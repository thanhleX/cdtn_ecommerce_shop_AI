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

# Load environment variables
load_dotenv()

# Configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "admin123",
    "database": "shop_db",
    "port": 3306
}

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI(title="AI Support Chatbot Service")

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
print("Loading Embedding Model...")
embed_model = SentenceTransformer('all-MiniLM-L6-v2')
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
    global product_index
    print("Refreshing product index...")
    products = fetch_products()
    
    if not products:
        print("No products found to index.")
        return
        
    # Create text to embed
    texts = [f"{p['name']} ({p['category']}): {p['description']}" for p in products]
    embeddings = embed_model.encode(texts)
    
    product_index = []
    for i, p in enumerate(products):
        product_index.append({
            "info": p,
            "embedding": embeddings[i]
        })
    print(f"Indexed {len(product_index)} products.")

import json

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
    Bạn là một chuyên gia kỹ thuật phần cứng. 
    Dưới đây là danh sách sản phẩm hiện có trong kho của shop:
    {product_list_str}
    
    Nhiệm vụ:
    1. Phân tích yêu cầu kỹ thuật của khách: "{user_msg}"
    2. Dựa vào KIẾN THỨC THỰC TẾ của bạn về các model trên, hãy xác định xem sản phẩm nào trong danh sách TRÊN có thông số khớp với yêu cầu.
    3. QUAN TRỌNG: TUYỆT ĐỐI KHÔNG thực hiện so sánh các sản phẩm với nhau (ví dụ: "so sánh A và B", "cái nào tốt hơn"). Nếu khách yêu cầu so sánh, hãy từ chối việc so sánh.
    4. XÁC ĐỊNH CHỦ ĐỀ: Nếu câu hỏi của khách hoàn toàn không liên quan đến sản phẩm công nghệ, điện tử, phần cứng hoặc mua sắm (ví dụ: thời tiết, nấu ăn, chuyện phiếm...), hãy đặt "is_off_topic" thành true.
    5. Trả về kết quả dưới dạng JSON:
       - "matched_ids": Danh sách ID của các sản phẩm khớp (tối đa 5).
       - "reason": Giải thích ngắn gọn tại sao chọn các sản phẩm đó. TUYỆT ĐỐI KHÔNG dùng từ ngữ so sánh hơn/nhất, không phân tích ưu/nhược điểm giữa chúng. Nếu khách yêu cầu so sánh, hãy ghi chính xác câu này: "Hệ thống hiện không hỗ trợ tính năng so sánh trực tiếp. Dưới đây là thông tin các sản phẩm bạn quan tâm để bạn tự tham khảo."
       - "keywords": Các từ khóa bóc tách được.
       - "is_off_topic": true hoặc false (boolean).
    
    Chỉ trả về JSON định dạng hợp lệ, không giải thích thêm.
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

    if not product_index:
        return {"reply": "Dữ liệu sản phẩm đang được cập nhật...", "products": []}

    # 1. Fetch current simple product list for Gemini context
    all_prods = [item["info"] for item in product_index]
    
    # 2. Get Technical Match from Gemini
    intent = extract_intent(user_msg, all_prods)
    
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

    # 3. Perform Vector Search as fallback/additional results
    query_embedding = embed_model.encode([search_keywords])[0]
    vector_results = []
    for item in product_index:
        sim = np.dot(query_embedding, item["embedding"]) / (
            np.linalg.norm(query_embedding) * np.linalg.norm(item["embedding"])
        )
        vector_results.append({
            "info": item["info"],
            "similarity": float(sim)
        })
    
    vector_results.sort(key=lambda x: x["similarity"], reverse=True)
    
    # 4. Merge results: Prioritize Gemini matches, then top vector results
    final_ids = set()
    final_products = []
    
    # Add Gemini's technical matches first
    for pid in matched_ids:
        for item in product_index:
            if str(item["info"]["id"]) == str(pid):
                if item["info"]["id"] not in final_ids:
                    final_products.append(item["info"])
                    final_ids.add(item["info"]["id"])
    
    # Add top vector matches (if high similarity and not already added)
    for item in vector_results:
        if item["similarity"] > 0.3: # Higher threshold for vector fallback
            if item["info"]["id"] not in final_ids:
                final_products.append(item["info"])
                final_ids.add(item["info"]["id"])
        if len(final_products) >= 5:
            break

    # 5. Build reply
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
