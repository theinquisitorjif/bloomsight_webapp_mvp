from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import pandas as pd

# ----------------------
# Get lat/lon of a beach
# ----------------------
def get_beach_location(beach_name):
    geolocator = Nominatim(user_agent="beach_name_locator")
    beach_location = geolocator.geocode(beach_name)

    if not beach_location:
        raise ValueError(f"Could not find location for {beach_name}")

    return beach_location.latitude, beach_location.longitude, beach_location.address

# ----------------------
# Convert miles to walking time (minutes)
# ----------------------
def miles_to_walk_time(miles):
    feet = miles * 5280
    seconds = feet / 3  # walking speed = 3 ft/sec
    return seconds / 60  # minutes

# ----------------------
# Scoring function
# ----------------------
def score_access_point(coord, dist, beach_access_points):
    score = 0

    # Distance score
    if dist <= 0.5:
        score += 40
    elif dist <= 1.0:
        score += 30
    elif dist <= 2.0:
        score += 10

    # Parking availability
    avail = beach_access_points.loc[
        beach_access_points["LAT_LON_COORDS"] == coord, "REGULAR_PARKING"
    ].values[0]
    if avail == "Yes":
        score += 20

    # Number of spaces
    num_spaces = beach_access_points.loc[
        beach_access_points["LAT_LON_COORDS"] == coord, "NUMBER_OF_SPACES"
    ].values[0]
    try:
        num_spaces = int(num_spaces)
    except:
        num_spaces = 0
    score += min(num_spaces, 50) / 50 * 20

    # Parking fee
    parking_fee = beach_access_points.loc[
        beach_access_points["LAT_LON_COORDS"] == coord, "PARKING_FEE_AMOUNT"
    ].values[0]
    try:
        parking_fee = float(parking_fee)
    except:
        parking_fee = 999  # Missing data penalty

    if parking_fee == 0:
        score += 20
    elif parking_fee <= 10:
        score += 10

    return score, parking_fee

# ----------------------
# Ranking function
# ----------------------
def rank_access_points(beach_lat, beach_lon, beach_access_points):
    scores = {}
    beach_coord = (beach_lat, beach_lon)

    for coord in beach_access_points["LAT_LON_COORDS"]:
        try:
            lat, lon = coord.split(", ")
            local_coord = (float(lat), float(lon))
        except:
            continue  # skip invalid coords

        distance_miles = geodesic(beach_coord, local_coord).miles
        score, parking_fee = score_access_point(coord, distance_miles, beach_access_points)
        scores[coord] = (score, distance_miles, parking_fee)

    # Sort by score (highest first), keep top 5
    sorted_scores = dict(sorted(scores.items(), key=lambda x: x[1][0], reverse=True)[:5])
    return sorted_scores

# ----------------------
# Main script
# ----------------------
def main():
    # Load dataset
    beach_access_points = pd.read_csv("fl_beach_access_points.csv")

    # If coords aren't in string format, build them
    if "LAT_LON_COORDS" not in beach_access_points.columns:
        beach_access_points["LAT_LON_COORDS"] = (
            beach_access_points["Y_LATITUDE"].astype(str) + ", " +
            beach_access_points["X_LONGITUDE"].astype(str)
        )

    # Beach to search
    beach_name = "Treasure Island Beach Florida"
    beach_lat, beach_lon, beach_address = get_beach_location(beach_name)
    print(f"Searching access points near: {beach_address}")

    # Rank recommendations
    top_recommendations = rank_access_points(beach_lat, beach_lon, beach_access_points)

    # Print results
    geolocator = Nominatim(user_agent="beach_name_locator")
    print("\nTop 5 Beach Access Point Recommendations:")
    for i, (coord, (score, dist, fee)) in enumerate(top_recommendations.items(), start=1):
        try:
            location = geolocator.reverse(coord)
            address = location.address if location else "Unknown location"
        except:
            address = "Unknown location"

        walk_time_min = miles_to_walk_time(dist)
        fee_str = "Free" if fee == 0 else f"${fee:.2f}"

        print(f"{i}. Address: {address}")
        print(f"   Distance: {dist:.2f} miles | Walk Time: {walk_time_min:.1f} minutes")
        print(f"   Parking Fee: {fee_str}")
        print(f"   Score: {score:.1f}\n")

if __name__ == "__main__":
    main()
