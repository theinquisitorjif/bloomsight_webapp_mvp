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

# Print loaded values to verify
print(f"URL: {SUPABASE_URL}")
print(f"Key: {SUPABASE_KEY[:8]}...")

def get_table(table_name, filters=""):
    url = f"{SUPABASE_URL}/rest/v1/{table_name}{filters}"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    return response.json()


def insert_row(table_name, payload):
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    response = requests.post(url, headers=HEADERS, json=payload)
    response.raise_for_status()
    return response.json()

def insert_comment(payload):
    return insert_row("comments", payload)

def insert_picture(payload):
    return insert_row("pictures", payload)

def insert_report(payload):
    return insert_row("report-data", payload)

def insert_environmental_data(payload):
    return insert_row("environmental-data", payload)


# Sample insert and fetch operations
if __name__ == "__main__":
    print("Fetching all rows from 'test-beaches' table...")

    try:
        rows = get_table("test-beaches")
        print("Success! Here's what we got:")
        print(rows)
    except Exception as e:
        print("Error fetching data:")
        print(e)

    print("\nInserting test beach into 'test-beaches'...")

    test_payload = {
        "name": "Test Beach",
        "location": "Florida",
        "description": "Just a test insert"
    }

    try:
        result = insert_row("test-beaches", test_payload)
        print("Insert succeeded:")
        print(result)
    except Exception as e:
        print("An error occurred:")
        print(e)
        
    

