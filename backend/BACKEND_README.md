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
pip install Flask flask-cors requests python-dotenv supabase
```

### 3. **Set Environment Variables**

Create a `.env` file in the root of the repository:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

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

## API Endpoints

### Base URL: `http://localhost:5000`

### `GET /`

Health check for the server.

### `GET /api/beaches`

Returns all beaches from the Supabase database.

### `GET /api/beaches/<id>`

Returns details for a specific beach by ID.

### `POST /api/beaches`

Adds a new beach. JSON body must include name, lat/lon, and optional metadata.

### `PUT /api/beaches/<id>`

Updates a beach entry by ID.

### `DELETE /api/beaches/<id>`

Deletes a beach entry by ID.

### `GET /beach-weather?lat=<>&lon=<>`

Returns a suitability rating based on temperature and wind using data from the Open-Meteo API.

---

##  Running the App

From the project root:

```bash
python backend/app.py
```

The server will start on `http://localhost:5000`

---
