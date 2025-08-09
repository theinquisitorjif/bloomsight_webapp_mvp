import os
import requests
from dotenv import load_dotenv
load_dotenv()

print("Loading environment variables...")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Prefer": "return=representation"
}

def insert_row(table, payload):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    response = requests.post(url, headers=HEADERS, json=payload)
    response.raise_for_status()
    return response.json()

if __name__ == "__main__":
    try:
        # Step 1: Insert User
        test_user = {
            "username": "testuser",
            "email": "test@example.com",
            "role": "user"
        }
        user_res = insert_row("users", test_user)
        user_id = user_res[0]["id"]
        print(f"User inserted with ID: {user_id}")

        # Step 2: Insert Beach
        test_beach = {
            "name": "Test Beach",
            "location": "Florida",
            "description": "Seeded beach for testing"
        }
        beach_res = insert_row("beaches", test_beach)
        beach_id = beach_res[0]["id"]
        print(f"Beach inserted with ID: {beach_id}")

        # Step 3: Insert Comment
        test_comment = {
            "user_id": user_id,
            "beach_id": beach_id,
            "content": "This is a test comment",
            "timestamp": "2025-08-06T12:00:00Z"
        }
        comment_res = insert_row("comments", test_comment)
        print(f"Comment inserted:\n{comment_res}")

    except requests.exceptions.HTTPError as err:
        print("HTTP error occurred:", err)
        print("Response content:", err.response.text)
    except Exception as e:
        print("Unexpected error:", e)
