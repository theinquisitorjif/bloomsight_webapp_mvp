import os
from dotenv import load_dotenv
from supabase import create_client

# Load variables from .env into os.environ
load_dotenv()

# Pull the variables from the environment
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")

def init_supabase():
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_ANON_KEY")
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

HEADERS = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Prefer": "return=representation"
}

# Example usage:
if __name__ == "__main__":
    supabase = init_supabase()
    print("Supabase client initialized successfully")



#def insert_row(table_name, payload):
#    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
#    response = requests.post(url, headers=HEADERS, json=payload)
#    response.raise_for_status()
#    return response.json()
#
#def insert_comment(payload):
#    return insert_row("comments", payload)
#
#def insert_picture(payload):
#    return insert_row("pictures", payload)
#
#def insert_report(payload):
#    return insert_row("report-data", payload)

#def insert_environmental_data(payload):
#    return insert_row("environmental-data", payload)

##
# Sample insert and fetch operations
#if __name__ == "__main__":
#    print("Fetching all rows from 'test-beaches' table...")
#
#   try:
#        rows = get_table("test-beaches")
#        print("Success! Here's what we got:")
#        print(rows)
#    except Exception as e:
#        print("Error fetching data:")
#        print(e)
#
#    print("\nInserting test beach into 'test-beaches'...")
#
#    test_payload = {
#        "name": "Test Beach",
#        "location": "Florida",
#        "description": "Just a test insert"
#    }
#
#    try:
#        result = insert_row("test-beaches", test_payload)
#        print("Insert succeeded:")
#        print(result)
#    except Exception as e:
#        print("An error occurred:")
#        print(e)