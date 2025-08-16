# BloomSight Backend

This directory contains the backend for the BloomSight MVP, built with Flask and Supabase. It serves as the API layer for interacting with beach data and weather information used by the frontend.

---

## Getting Started

### 1. **Environment Setup**

Make sure you have Python 3.10+ installed. Then:

```bash
python3 -m venv venv
venv\Scripts\activate     # On Windows
# or
source venv/bin/activate   # On Mac/Linux
```

### 2. **Install Dependencies**

```bash
pip install -r requirements.txt
```

## Project Structure

```
bloomsight_webapp_mvp/
├── backend/
│   ├── app.py                  # Main Flask application
│   ├── supabase_client.py     # Supabase client initializer
│   └── seed.py                # (optional) script for seeding the database
├── .env
└── requirements.txt
```

---

## Running the App

From the project root:

```bash
python backend/app.py
```

The server will start on `http://localhost:5002`

---
