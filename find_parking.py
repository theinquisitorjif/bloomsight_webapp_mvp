import requests
import time

def get_location_name(lat, lon):
    """Get readable location name from coordinates using Nominatim reverse geocoding"""
    if lat is None or lon is None:
        return "Unknown Location"
    
    try:
        # Use Nominatim for reverse geocoding (free OpenStreetMap service)
        url = f"https://nominatim.openstreetmap.org/reverse"
        params = {
            'lat': lat,
            'lon': lon,
            'format': 'json',
            'addressdetails': 1
        }
        headers = {'User-Agent': 'Beach Parking Finder/1.0'}
        
        response = requests.get(url, params=params, headers=headers)
        if response.status_code == 200:
            data = response.json()
            
            # Extract meaningful address components
            address = data.get('address', {})
            location_parts = []
            
            # Try to build a readable address
            if address.get('house_number') and address.get('road'):
                location_parts.append(f"{address['house_number']} {address['road']}")
            elif address.get('road'):
                location_parts.append(address['road'])
            
            if address.get('neighbourhood'):
                location_parts.append(address['neighbourhood'])
            elif address.get('suburb'):
                location_parts.append(address['suburb'])
            
            if address.get('city'):
                location_parts.append(address['city'])
            elif address.get('town'):
                location_parts.append(address['town'])
            
            if address.get('state'):
                location_parts.append(address['state'])
            
            if location_parts:
                return ", ".join(location_parts)
            else:
                return data.get('display_name', f"Lat: {lat}, Lon: {lon}")
        
        return f"Lat: {lat}, Lon: {lon}"
    
    except Exception as e:
        print(f"Error getting location name: {e}")
        return f"Lat: {lat}, Lon: {lon}"

query = """
[out:json];
(
  node["amenity"="parking"](25.76,-80.19,25.80,-80.13);
  way["amenity"="parking"](25.76,-80.19,25.80,-80.13);
  relation["amenity"="parking"](25.76,-80.19,25.80,-80.13);
);
out center;
"""

response = requests.get("https://overpass-api.de/api/interpreter", params={'data': query})
data = response.json()

print("Parking locations found:")
print("=" * 80)

for i, element in enumerate(data['elements']):
    lat = element.get('lat') or element.get('center', {}).get('lat')
    lon = element.get('lon') or element.get('center', {}).get('lon')
    
    # Get readable location name
    location_name = get_location_name(lat, lon)
    
    print(f"{i+1}. Type: {element['type']}, ID: {element['id']}")
    print(f"   Location: {location_name}")
    print(f"   Coordinates: {lat}, {lon}")
    
    # Get additional tags if available
    tags = element.get('tags', {})
    if 'name' in tags:
        print(f"   Name: {tags['name']}")
    if 'parking' in tags:
        print(f"   Parking Type: {tags['parking']}")
    if 'fee' in tags:
        print(f"   Fee: {tags['fee']}")
    
    print()
    
    # Add a small delay to be respectful to the Nominatim service
    time.sleep(1)
