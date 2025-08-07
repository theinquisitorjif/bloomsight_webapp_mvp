import requests
import time
from datetime import datetime

def get_parking_info(lat, lon):
    # Define a small bounding box around the point (5km approx)
    # Overpass uses (south,west,north,east)
    delta = 0.05  # approx 5 km, adjust as needed
    south = lat - delta
    north = lat + delta
    west = lon - delta
    east = lon + delta

    query = f"""
    [out:json][timeout:10];
    (
      node["amenity"="parking"]({south},{west},{north},{east});
      way["amenity"="parking"]({south},{west},{north},{east});
      relation["amenity"="parking"]({south},{west},{north},{east});
    );
    out center 20;
    """

    try:
        response = requests.get("https://overpass-api.de/api/interpreter", params={'data': query}, timeout=15)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"Error querying Overpass API: {e}")
        return {
            "latitude": lat,
            "longitude": lon,
            "parking_spots": [],
            "error": str(e),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

    parking_spots = []
    elements = data.get('elements', [])[:20]  # limit to first 20

    for element in elements:
        el_lat = element.get('lat') or element.get('center', {}).get('lat')
        el_lon = element.get('lon') or element.get('center', {}).get('lon')

        tags = element.get('tags', {})
        spot = {
            "id": element.get('id'),
            "type": element.get('type'),
            "latitude": el_lat,
            "longitude": el_lon,
            "name": tags.get('name'),
            "parking_type": tags.get('parking'),
            "fee": tags.get('fee')
        }
        parking_spots.append(spot)

    return {
        "latitude": lat,
        "longitude": lon,
        "parking_spots": parking_spots,
        "count": len(parking_spots),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }