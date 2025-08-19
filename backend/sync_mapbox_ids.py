import os, json, math
from supabase import create_client, Client
from dotenv import load_dotenv

try:
    from shapely.geometry import shape
    HAVE_SHAPELY = True
except Exception:
    HAVE_SHAPELY = False

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"]  
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

GEOJSON_PATH = "C:\\Users\\asher\\bloomsight_webapp_mvp\\backend\\export.geojson"

def rough_centroid(coords):
    """Fallback centroid for Polygon/MultiPolygon if Shapely not available."""
    # coords: GeoJSON coordinates
    pts = []
    def add_ring(ring):
        for x, y in ring:
            pts.append((x, y))

    if isinstance(coords[0][0][0], (int, float)):  # Polygon -> [[ [x,y], ... ]]
        add_ring(coords[0])
    else:  # MultiPolygon -> [ [ [ [x,y], ... ] ] , ... ]
        add_ring(coords[0][0])

    if not pts:
        return None
    xs, ys = zip(*pts)
    return (sum(xs)/len(xs), sum(ys)/len(ys))

def feature_lonlat(f):
    geom = f.get("geometry") or {}
    gtype = geom.get("type")
    coords = geom.get("coordinates")

    if not gtype or coords is None:
        return None

    if gtype == "Point":
        lon, lat = coords
        return lon, lat

    if HAVE_SHAPELY:
        try:
            g = shape(geom)
            c = g.centroid
            return (c.x, c.y)
        except Exception:
            pass

    # Fallback centroid
    try:
        rc = rough_centroid(coords)
        if rc: return rc
    except Exception:
        pass
    return None

def main():
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    feats = data.get("features", [])
    if not feats:
        print("No features found in GeoJSON.")
        return

    inserted = updated = skipped = 0

    for f in feats:
        props = f.get("properties", {})
        mapbox_id = props.get("@id")
        name = props.get("name")

        if not mapbox_id or not name:
            skipped += 1
            continue

        # compute location "lat,lon"
        lonlat = feature_lonlat(f)
        location = f"{lonlat[1]},{lonlat[0]}" if lonlat else None

        # 1) Try to update existing row by name (fills mapbox_id on existing records)
        update_payload = {"mapbox_id": mapbox_id}
        if location:
            update_payload["location"] = location

        upd = supabase.table("beaches") \
            .update(update_payload) \
            .eq("name", name) \
            .execute()

        if upd.data:        # at least one row updated
            updated += 1
            continue

        # 2) No row with that name — create (or update) by unique mapbox_id
        insert_payload = {"mapbox_id": mapbox_id, "name": name}
        if location:
            insert_payload["location"] = location

        supabase.table("beaches") \
            .upsert(insert_payload, on_conflict="mapbox_id") \
            .execute()
        updated += 1  # counting both inserts/updates as "updated"


    print(f"Done. Updated (or inserted) rows: {updated}. Skipped (missing name/mapbox_id): {skipped}")

if __name__ == "__main__":
    main()
