import os
import json
import time
import requests
from typing import List, Dict, Optional
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# Normalizers 

def overpass_parking_around(lat: float, lon: float, radius_m: int = 2000) -> dict:
    """
    Query Overpass for parking around a point.
    Returns raw JSON from Overpass (elements list).
    """
    query = f"""
    [out:json][timeout:50];
    (
      node["amenity"="parking"](around:{radius_m},{lat},{lon});
      way["amenity"="parking"](around:{radius_m},{lat},{lon});
      relation["amenity"="parking"](around:{radius_m},{lat},{lon});
    );
    out center tags;
    """
    resp = requests.get("https://overpass-api.de/api/interpreter", params={'data': query}, timeout=90)
    resp.raise_for_status()
    return resp.json()

def normalize_parking_elements(elements: list[dict]) -> list[dict]:
    """Turn Overpass elements into a stable list of dicts with lat/lon/name/tags."""
    out = []
    for el in elements:
        typ = el.get("type")
        el_id = el.get("id")
        tags = el.get("tags", {}) or {}
        name = tags.get("name")

        # coordinates may be on node or center for ways/relations
        lat = el.get("lat") or (el.get("center") or {}).get("lat")
        lon = el.get("lon") or (el.get("center") or {}).get("lon")
        if lat is None or lon is None:
            continue

        out.append({
            "source_id": f"{typ}/{el_id}",
            "name": name or "Parking",
            "lat": lat,
            "lon": lon,
            "tags": tags,
        })
    return out

def reverse_geocode(lat: float, lon: float) -> str:
    """Optional display name using Nominatim (be polite with rate limits)."""
    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"lat": lat, "lon": lon, "format": "json", "addressdetails": 1},
            headers={"User-Agent": "BloomSight/1.0"},
            timeout=30
        )
        if r.status_code == 200:
            j = r.json()
            return j.get("display_name") or f"{lat},{lon}"
    except Exception:
        pass
    return f"{lat},{lon}"

def get_parking_json(lat: float, lon: float, radius_m: int = 2000, with_display_name: bool = False) -> list[dict]:
    """
    Public function: returns normalized parking JSON list for a point.
    Each item: {source_id, name, lat, lon, tags, display_name?}
    """
    raw = overpass_parking_around(lat, lon, radius_m)
    items = normalize_parking_elements(raw.get("elements", []))
    if with_display_name:
        # Simple polite throttling
        for item in items[:50]:
            item["display_name"] = reverse_geocode(item["lat"], item["lon"])
            time.sleep(1)  # be nice to Nominatim
    return items

# Supabase helpers + seeding

def _supabase_headers():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_*_KEY in environment")
    return url, {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def _fetch_all_beaches() -> list[dict]:
    url, headers = _supabase_headers()
    r = requests.get(f"{url}/rest/v1/beaches?select=*", headers=headers, timeout=60)
    r.raise_for_status()
    return r.json()

def _bulk_upsert(table: str, rows: list[dict], conflict: str | None = None):
    if not rows:
        return
    url, headers = _supabase_headers()
    endpoint = f"{url}/rest/v1/{table}"
    if conflict:
        headers = dict(headers)
        headers["Prefer"] = "resolution=merge-duplicates,return=representation"
        endpoint += f"?on_conflict={conflict}"
    CHUNK = 500
    for i in range(0, len(rows), CHUNK):
        payload = rows[i:i+CHUNK]
        rr = requests.post(endpoint, headers=headers, data=json.dumps(payload), timeout=120)
        if rr.status_code >= 400:
            raise RuntimeError(f"Upsert to {table} failed: {rr.status_code} {rr.text}")

def _parse_lat_lon(location_str: str):
    try:
        parts = [p.strip() for p in location_str.split(",")]
        return float(parts[0]), float(parts[1])
    except Exception:
        return None

def seed_parking_for_all_beaches(radius_m: int = 2000, include_display_name: bool = False):
    beaches = _fetch_all_beaches()
    rows = []
    for b in beaches:
        loc = b.get("location")
        parsed = _parse_lat_lon(loc) if isinstance(loc, str) else None
        if not parsed:
            continue
        lat, lon = parsed
        try:
            items = get_parking_json(lat, lon, radius_m, with_display_name=include_display_name)
            for it in items:
                rows.append({
                    # expected columns in 'parking_spots':
                    # id (auto), beach_id, source_id (unique per beach), name, lat, lon, tags jsonb, display_name text, created_at
                    "beach_id": b.get("id"),
                    "source_id": it["source_id"],
                    "name": it.get("name"),
                    "lat": it["lat"],
                    "lon": it["lon"],
                    "tags": it.get("tags", {}),
                    "display_name": it.get("display_name")
                })
        except Exception as e:
            print(f"parking seed failed for beach {b.get('id')} {b.get('name')}: {e}")

    # Upsert by (beach_id, source_id) so repeats don’t duplicate
    _bulk_upsert("parking", rows, conflict="beach_id,source_id")
    print(f"Seeded parking for {len(rows)} spots across {len(beaches)} beaches.")

# CLI 

if __name__ == "__main__":
    import sys
    # python backend\find_parking.py --seed
    if "--seed" in sys.argv:
        seed_parking_for_all_beaches()
    else:
        # quick demo
        print(json.dumps(get_parking_json(25.7617, -80.1918)[:5], indent=2))
