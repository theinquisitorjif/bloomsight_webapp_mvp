#This file is what is used to store and update the data from FWC maps to dictate whether or not a red tide event is occurring

#Create list of beaches with data for Florida

beaches = [
    {
        "name": "Fishing Bend",
        "lat": 30.54,
        "long": -87.14,
        "abundance": "not present"
    },
    {
        "name": "Palafox Pier (Pensacola Bay)",
        "lat": 30.40,
        "long": -87.21,
        "abundance": "not present"
    },
    {
        "name": "Cedar Point; NE of East Bay",
        "lat": 30.10,
        "long": -85.56,
        "abundance": "not present"
    },
    {
        "name": "Little Oyster Bar Point; NE of East Bay",
        "lat": 30.05,
        "long": -85.50,
        "abundance": "not present"
    },
    {
        "name": "Millendaer Street; S of St. George Sound",
        "lat": 29.73,
        "long": -84.88,
        "abundance": "not present"
    },
    {
        "name": "17th Street East; E of Steinhatchee River",
        "lat": 29.67,
        "long": -83.36,
        "abundance": "not present"
    },
    {
        "name": "Salt Creek; 2 mi S of Deadman Bay",
        "lat": 29.66,
        "long": -83.47,
        "abundance": "not present"
    },
    {
        "name": "Buck Island; 2.4 mi W of Suwannee Sound",
        "lat": 29.22,
        "long": -83.12,
        "abundance": "not present"
    },
    {
        "name": "Derrick Key",
        "lat": 29.19,
        "long": -83.08,
        "abundance": "not present"
    },
    {
        "name": "Gomez Keys",
        "lat": 29.15,
        "long": -83.08,
        "abundance": "not present"
    },
    {
        "name": "Deadmans Key",
        "lat": 29.11,
        "long": -83.08,
        "abundance": "not present"
    },
    {
        "name": "Seahorse Key",
        "lat": 	29.11,
        "long": -83.05,
        "abundance": "not present"
    },
    {
        "name": "Dog Island",
        "lat": 29.13,
        "long": -83.02,
        "abundance": "not present"
    },
    {
        "name": "Scale Key",
        "lat": 	29.15,
        "long": -83.00,
        "abundance": "not present"
    },
    {
        "name": "Tripod Point",
        "lat": 	29.14,
        "long": -82.95,
        "abundance": "not present"
    },
    {
        "name": "South Point",
        "lat": 28.66,
        "long": -82.74,
        "abundance": "not present"
    },
    {
        "name": "Pine Island",
        "lat": 28.58,
        "long": -82.65,
        "abundance": "not present"
    },
    {
        "name": "Rock Island",
        "lat": 28.56,
        "long": -82.78,
        "abundance": "not present"
    },
    {
        "name": "Centipede Bay",
        "lat": 28.52,
        "long": -82.83,
        "abundance": "not present"
    },
    {
        "name": "Round Island",
        "lat": 28.51,
        "long": -82.73,
        "abundance": "not present"
    },
    {
        "name": "Indian Key",
        "lat": 	28.46,
        "long": -82.74,
        "abundance": "not present"
    },
    {
        "name": "Robert K. Rees Memorial Park",
        "lat": 	28.25,
        "long": -82.76,
        "abundance": "not present"
    },
    {
        "name": "Gulf Harbors",
        "lat": 28.25,
        "long": -82.78,
        "abundance": "not present"
    },
    {
        "name": "Gulf Harbors South Beach",
        "lat": 	28.23,
        "long": -82.77,
        "abundance": "not present"
    },
    {
        "name": "Eagle Point Park",
        "lat": 28.23,
        "long": -82.76,
        "abundance": "not present"
    },
    {
        "name": "Baileys Bluff Estates; N of (Anclote Anchorage)",
        "lat": 	28.21,
        "long": -82.78,
        "abundance": "not present"
    },
    {
        "name": "Key Vista Nature Park (Anclote Anchorage)",
        "lat": 28.20,
        "long": -82.79,
        "abundance": "not present"
    },
    {
        "name": "Anclote Gulf Park Pier (Anclote Anchorage)",
        "lat": 28.19,
        "long": -82.79,
        "abundance": "not present"
    },
    {
        "name": "North Keys; SE of (Anclote Anchorage)",
        "lat": 28.20,
        "long": -82.84,
        "abundance": "not present"
    },
    {
        "name": "East Anclote Key",
        "lat": 28.20,
        "long": -82.85,
        "abundance": "not present"
    },
    {
        "name": "Anclote River Park Boat Ramp",
        "lat": 	28.18,
        "long": -82.79,
        "abundance": "not present"
    },
    {
        "name": "South Anclote Key Beach",
        "lat": 28.17,
        "long": -82.84,
        "abundance": "not present"
    },
    {
        "name": "Clearwater Beach Pier 60",
        "lat": 	27.98,
        "long": -82.83,
        "abundance": "not present"
    },
    {
        "name": "Via Cipriani; dock S of (Old Tampa Bay)",
        "lat": 	27.94,
        "long": -82.72,
        "abundance": "not present"
    },
    {
        "name": "La Contessa Pier",
        "lat": 27.81,
        "long": -82.82,
        "abundance": "not present"
    },
    {
        "name": "Treasure Island Beach",
        "lat": 27.77,
        "long": -82.78,
        "abundance": "not present"
    },
    {
        "name": "Country Club Road North; SW of (Boca Ciega Bay)",
        "lat": 27.78,
        "long": -82.75,
        "abundance": "not present"
    },
    {
        "name": "North Shore Park Beach (Middle Tampa Bay)",
        "lat": 27.78,
        "long": -82.62,
        "abundance": "not present"
    },
    {
        "name": "Spa Beach (Middle Tampa Bay)",
        "lat": 27.77,
        "long": -82.63,
        "abundance": "not present"
    },
    {
        "name": "FWRI Peninsula; SE tip of (Bayboro Harbor)",
        "lat": 27.76,
        "long": -82.63,
        "abundance": "not present"
    },
    {
        "name": "Lassing Park (Middle Tampa Bay)",
        "lat": 27.75,
        "long": -82.63,
        "abundance": "not present"
    },
    {
        "name": "Wallace Cove (Boca Ciega Bay)",
        "lat": 27.71,
        "long": -82.69,
        "abundance": "not present"
    },
    {
        "name": "Maximo Park (Lower Tampa Bay)",
        "lat": 	27.71,
        "long": -82.68,
        "abundance": "not present"
    },
    {
        "name": "Mullet Key; Gulf Pier",
        "lat": 27.61,
        "long": -82.74,
        "abundance": "not present"
    },
    {
        "name": "Skyway Fishing Pier; South (Lower Tampa Bay)",
        "lat": 27.60,
        "long": -82.64,
        "abundance": "not present"
    },
    {
        "name": "Fletcher Point (Lower Tampa Bay)",
        "lat": 27.59,
        "long": -82.61,
        "abundance": "not present"
    },
    {
        "name": "Fletcher Point (Lower Tampa Bay)",
        "lat": 27.59,
        "long": -82.61,
        "abundance": "not present"
    },
    {
        "name": "Anna Maria Island Rod & Reel Pier (Lower Tampa Bay)",
        "lat": 27.54,
        "long": -82.74,
        "abundance": "not present"
    },
    {
        "name": "Palma Sola Bay Bridge",
        "lat": 27.50,
        "long": -82.65,
        "abundance": "not present"
    },
    {
        "name": "Longboat Pass Boat Ramp (Sarasota Bay)",
        "lat": 27.45,
        "long": -82.69,
        "abundance": "not present"
    },
    {
        "name": "Englewood Beach",
        "lat": 26.92,
        "long": -82.36,
        "abundance": "not present"
    },
    {
        "name": "Catfish Creek; mouth of (Gasparilla Sound)",
        "lat": 26.82,
        "long": -82.25,
        "abundance": "not present"
    },
    {
        "name": "Boca Grande Pier (Gasparilla Sound)",
        "lat": 26.81,
        "long": -82.27,
        "abundance": "not present"
    },
    {
        "name": "Sandfly Key; NE of (Gasparilla Sound)",
        "lat": 	26.80,
        "long": -82.23,
        "abundance": "not present"
    },
    {
        "name": "Bull Key; NW of (Bull Bay)",
        "lat": 26.78,
        "long": -82.21,
        "abundance": "not present"
    },
    {
        "name": "Cayo Pelau; 2 mi S of (Charlotte Harbor)",
        "lat": 26.74,
        "long": -82.21,
        "abundance": "not present"
    },
    {
        "name": "Boca Grande Pass",
        "lat": 	26.71,
        "long": -82.26,
        "abundance": "not present"
    },
    {
        "name": "Little Bokeelia Island; N of (Charlotte Harbor)",
        "lat": 26.71,
        "long": -82.18,
        "abundance": "not present"
    },
    {
        "name": "Captiva Pass",
        "lat": 	26.61,
        "long": -82.22,
        "abundance": "not present"
    },
    {
        "name": "Captiva Rocks; SW of (Pine Island Sound)",
        "lat": 26.60,
        "long": -82.18,
        "abundance": "not present"
    },
    {
        "name": "Hemp Key; S of (Pine Island Sound)",
        "lat": 26.59,
        "long": -82.16,
        "abundance": "not present"
    },
    {
        "name": "Cork Island; W of (Pine Island Sound)",
        "lat": 26.58,
        "long": -82.13,
        "abundance": "not present"
    },
    {
        "name": "Redfish Pass; 1.8 mi E of (Pine Island Sound)",
        "lat": 	26.56,
        "long": -82.17,
        "abundance": "not present"
    },
    {
        "name": "Redfish Pass (Pine Island Sound)",
        "lat": 	26.55,
        "long": -82.20,
        "abundance": "not present"
    },
    {
        "name": "Alison Hagerup Beach Park",
        "lat": 	26.53,
        "long": -82.19,
        "abundance": "not present"
    },
    {
        "name": "Buck Key; 1.8 mi NE of (Pine Island Sound)",
        "lat": 26.53,
        "long": -82.15,
        "abundance": "not present"
    },
    {
        "name": "Regla Island; W of (Pine Island Sound)",
        "lat": 	26.54,
        "long": -82.13,
        "abundance": "not present"
    },
    {
        "name": "York Island; W of (Pine Island Sound)",
        "lat": 	26.49,
        "long": -82.11,
        "abundance": "not present"
    },
    {
        "name": "Lighthouse Beach",
        "lat": 	26.45,
        "long": -82.02,
        "abundance": "not present"
    },
    {
        "name": "Tarpon Bay Road Beach",
        "lat": 	26.42,
        "long": -82.08,
        "abundance": "not present"
    },
    {
        "name": "Lynn Hall Park",
        "lat": 	26.45,
        "long": -81.96,
        "abundance": "not present"
    },
    {
        "name": "Lovers Key State Park",
        "lat": 	26.39,
        "long": -81.88,
        "abundance": "not present"
    },
    {
        "name": "Bonita Beach Park",
        "lat": 	26.33,
        "long": -81.85,
        "abundance": "not present"
    },
    {
        "name": "Barefoot Beach State Preserve",
        "lat": 	26.30,
        "long": -81.84,
        "abundance": "not present"
    },
    {
        "name": "Vanderbilt Beach",
        "lat": 	26.25,
        "long": -81.82,
        "abundance": "not present"
    },
    {
        "name": "Seagate",
        "lat": 	26.21,
        "long": -81.82,
        "abundance": "not present"
    },
    {
        "name": "Naples Pier",
        "lat": 	26.13,
        "long": -81.81,
        "abundance": "not present"
    },
    {
        "name": "South Marco Beach",
        "lat": 	25.91,
        "long": -81.73,
        "abundance": "not present"
    },
    {
        "name": "Sea King Circle",
        "lat": 	25.04,
        "long": -80.49,
        "abundance": "not present"
    },
    {
        "name": "Harry Harris Beach and Park",
        "lat": 	25.02,
        "long": -80.49,
        "abundance": "not present"
    },
    {
        "name": "Juno Beach Fishing Pier",
        "lat": 	26.89,
        "long": -80.05,
        "abundance": "not present"
    },
    {
        "name": "St. Johns Inland",
        "lat": 	30.39,
        "long": -81.46,
        "abundance": "not present"
    },
    {
        "name": "St. Johns Inlet",
        "lat": 	30.41,
        "long": -81.41,
        "abundance": "not present"
    },
    {
        "name": "Ft. George Inlet",
        "lat": 	30.42,
        "long": -81.42,
        "abundance": "not present"
    },
    {
        "name": "Ft. George Inland",
        "lat": 	30.44,
        "long": -81.44,
        "abundance": "not present"
    },
    {
        "name": "Nassau Inlet",
        "lat": 	30.51,
        "long": -81.46,
        "abundance": "not present"
    },
    {
        "name": "St. Marys Inlet",
        "lat": 	30.70,
        "long": -81.43,
        "abundance": "not present"
    }
]   

#Print out all beaches and locations
for location in beaches:
    print(f"Name: {location['name']}")
    print(f"Latitude: {location['lat']}")
    print(f"Longitude: {location['long']}")
    print(f"Karena Brevis Abundance: {location['abundance']}")
    print()