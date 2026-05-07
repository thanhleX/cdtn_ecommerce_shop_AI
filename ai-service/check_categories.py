import mysql.connector
import sys

# Set stdout to UTF-8
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "admin123",
    "database": "shop_db",
    "port": 3306
}

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM categories WHERE is_active = 1")
    rows = cursor.fetchall()
    print("Categories:")
    for row in rows:
        print(f"- {row[0]}")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
