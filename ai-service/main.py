import os
import mysql.connector
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Optional
import google.genai as genai
from dotenv import load_dotenv
from rank_bm25 import BM25Okapi
import re

# Load environment variables
load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE", "shop_db"),
    "port": int(os.getenv("DB_PORT", 3306))
}

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI(title="AI Support Chatbot Service")

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:5174", "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
print("Loading Embedding Model...")
embed_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
print("Model loaded.")

# Initialize Gemini if API Key exists
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
    print("Gemini AI Client initialized for intent extraction.")
else:
    client = None
    print("GEMINI_API_KEY not found. Falling back to basic semantic search.")

# In-memory index for product embeddings
# In a real production app, use a Vector DB like ChromaDB or Pinecone
product_index = []
bm25_index = None
embeddings_norm = None

class ChatRequest(BaseModel):
    message: str

class ProductInfo(BaseModel):
    id: int
    name: str
    description: Optional[str]
    slug: str
    category: str

def fetch_products():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT p.id, p.name, p.description, p.slug, c.name as category 
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        products = []
        for row in rows:
            products.append({
                "id": row["id"],
                "name": row["name"],
                "description": row["description"] or "",
                "slug": row["slug"],
                "category": row["category"]
            })
            
        cursor.close()
        conn.close()
        return products
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []

def refresh_index():
    global product_index, bm25_index
    print("Refreshing product index...")
    products = fetch_products()
    
    if not products:
        print("No products found to index.")
        return
        
    # Create text to embed
    texts = [f"{p['name']} ({p['category']}): {p['description']}" for p in products]
    embeddings = embed_model.encode(texts)
    
    # Basic tokenization for BM25 (lowercase, remove non-alphanumeric except spaces)
    tokenized_corpus = []
    for text in texts:
        clean_text = re.sub(r'[^\w\s]', ' ', text.lower())
        tokenized_corpus.append(clean_text.split())
        
    bm25_index = BM25Okapi(tokenized_corpus)
    
    # Pre-calculate normalized matrix for fast O(1) vector search
    embeddings_matrix = np.array(embeddings)
    norms = np.linalg.norm(embeddings_matrix, axis=1, keepdims=True)
    global embeddings_norm
    embeddings_norm = embeddings_matrix / norms
    
    product_index = []
    for i, p in enumerate(products):
        product_index.append({
            "info": p,
            "embedding": embeddings[i],
            "text": texts[i]
        })
    print(f"Indexed {len(product_index)} products with Vector and BM25.")

import json

def hybrid_search(query: str, top_k: int = 15):
    if not product_index or not bm25_index:
        return []
        
    # 1. Vector Search Scores (Vectorized O(1) numpy operation)
    query_embedding = embed_model.encode([query])[0]
    query_norm = query_embedding / np.linalg.norm(query_embedding)
    similarities = np.dot(embeddings_norm, query_norm)
    vector_scores = similarities.tolist()
        
    # 2. BM25 Scores
    clean_query = re.sub(r'[^\w\s]', ' ', query.lower())
    tokenized_query = clean_query.split()
    bm25_scores = bm25_index.get_scores(tokenized_query)
    
    # 3. Normalize Scores (Min-Max Scaling)
    def min_max_normalize(scores):
        if len(scores) == 0:
            return []
        min_val = min(scores)
        max_val = max(scores)
        if max_val == min_val:
            return [0.0] * len(scores)
        return [(s - min_val) / (max_val - min_val) for s in scores]
        
    norm_vector = min_max_normalize(vector_scores)
    norm_bm25 = min_max_normalize(bm25_scores)
    
    # 4. Combine Scores (Weighted: 60% Vector, 40% BM25)
    results = []
    for i in range(len(product_index)):
        final_score = (norm_vector[i] * 0.6) + (norm_bm25[i] * 0.4)
        results.append({
            "info": product_index[i]["info"],
            "score": final_score,
            "vector_sim": vector_scores[i]
        })
        
    # 5. Sort and return Top K
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]

from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception),
    before_sleep=lambda retry_state: print(f"Retrying Gemini call (attempt {retry_state.attempt_number})...")
)
def call_gemini_with_retry(prompt: str):
    return client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )

def extract_intent(user_msg: str, local_products: list) -> dict:
    """Use Gemini as a technical expert to match user requests with local products."""
    if not client:
        return {"matched_ids": [], "keywords": user_msg}
    
    # Create a compact list of local products for Gemini to analyze
    product_list_str = "\n".join([f"ID: {p['id']} - Name: {p['name']}" for p in local_products])
    
    prompt = f"""
    You are a hardware technical expert.
    Below is a list of the MOST RELEVANT PRODUCTS found in the inventory based on the customer's request:
    {product_list_str}
    
    Task:
    1. Analyze the customer's technical request: "{user_msg}"
    2. Evaluate the provided product list above and filter out the products that TRULY best match the request.
    3. IMPORTANT REGARDING COMPARISON: If the customer requests a direct comparison (e.g., "compare A and B", "is A or B better?"), you must decline. However, if the customer asks for "best", "most powerful", or "cheapest", you ARE ALLOWED to implicitly evaluate and select the top product meeting that criterion to return (no need to write negative comparisons against other products).
    4. IDENTIFY TOPIC: If the customer's inquiry is completely unrelated to technology, electronics, hardware, or shopping (e.g., weather, cooking, small talk...), set "is_off_topic" to true.
    5. Return the result strictly in JSON format with the following keys:
       - "matched_ids": A list of IDs of the matching products (maximum 5).
       - "reason": A brief explanation of why these products are recommended. If the customer explicitly asked for a DIRECT comparison between A and B, state exactly: "Hệ thống hiện không hỗ trợ tính năng phân tích so sánh trực tiếp. Dưới đây là thông tin các sản phẩm bạn quan tâm để tự tham khảo." If they looked for the "best/cheapest", simply explain the strengths of the selected product objectively.
       - "keywords": Extracted keywords from the request.
       - "is_off_topic": true or false (boolean).
    
    Return ONLY a valid JSON object. Do not include any conversational filler, markdown formatting (like ```json), or extra explanations.
    """
    try:
        response = call_gemini_with_retry(prompt)
        clean_text = response.text.strip().replace('```json', '').replace('```', '')
        result = json.loads(clean_text)
        print(f"Gemini Technical Match: {result}")
        return result
    except Exception as e:
        print(f"Gemini matching error: {e}")
        return {"matched_ids": [], "keywords": user_msg}

@app.on_event("startup")
async def startup_event():
    refresh_index()

@app.post("/chat")
async def chat(request: ChatRequest):
    user_msg = request.message.strip()
    if len(user_msg) > 200:
        raise HTTPException(status_code=400, detail="Tin nhắn không được vượt quá 200 ký tự.")

    if not product_index or not bm25_index:
        return {"reply": "Dữ liệu sản phẩm đang được cập nhật...", "products": []}

    # 1. RETRIEVAL: Sử dụng Hybrid Search lấy Top 15 sản phẩm ngữ cảnh
    retrieved_results = hybrid_search(user_msg, top_k=15)
    retrieved_prods = [item["info"] for item in retrieved_results]
    
    # 2. GENERATION: Gửi ngữ cảnh (Top 15) cho Gemini phân tích
    intent = extract_intent(user_msg, retrieved_prods)
    
    if intent.get("is_off_topic", False):
        return {
            "reply": "Xin lỗi, tôi là trợ lý AI chuyên về tư vấn sản phẩm công nghệ. Hệ thống không hỗ trợ trả lời các câu hỏi ngoài luồng này ạ.",
            "products": [],
            "debug_keywords": user_msg,
            "debug_matches": []
        }

    matched_ids = intent.get("matched_ids", [])
    search_keywords = intent.get("keywords", user_msg)
    ai_reason = intent.get("reason", "")

    # 3. Merge results (Xử lý Fallback)
    final_ids = set()
    final_products = []
    
    # Thêm các sản phẩm được Gemini chọn
    for pid in matched_ids:
        for p in retrieved_prods:
            if str(p["id"]) == str(pid):
                if p["id"] not in final_ids:
                    final_products.append(p)
                    final_ids.add(p["id"])
    
    # Nếu Gemini sập hoặc không chọn được gì, fallback về Top 5 của Hybrid Search
    if not final_products:
        for item in retrieved_results:
            # Lọc bỏ các kết quả có điểm vector quá thấp để tránh rác
            if item["vector_sim"] > 0.4: 
                if item["info"]["id"] not in final_ids:
                    final_products.append(item["info"])
                    final_ids.add(item["info"]["id"])
            if len(final_products) >= 5:
                break

    # 4. Build reply
    if final_products:
        reply = f"Dựa trên yêu cầu của bạn, tôi tìm thấy các sản phẩm phù hợp nhất trong hệ thống:"
        if ai_reason:
            reply = f"Theo phân tích kỹ thuật: {ai_reason}\nTôi đề xuất các mẫu sau:"
    else:
        reply = "Tôi đã tìm kiếm kỹ nhưng chưa thấy sản phẩm nào khớp hoàn toàn với yêu cầu kỹ thuật này trong kho hàng hiện tại."

    return {
        "reply": reply,
        "products": final_products[:5],
        "debug_keywords": search_keywords,
        "debug_matches": matched_ids
    }

@app.post("/reindex")
async def reindex():
    refresh_index()
    return {"status": "success", "count": len(product_index)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8082)
