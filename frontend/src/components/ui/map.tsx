import { useRef, useEffect, useState } from 'react';
import mapboxgl, { type LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createClient } from '@supabase/supabase-js';
import redTideData from '../../../../fwc_redtide.json';
import { useGetBeaches } from '@/api/beach';
import BeachCard from '../beach/beach-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';
import { ChevronUp, Waves } from 'lucide-react';
import { haversineDistanceMiles } from '@/lib/utils';
import { Skeleton } from './skeleton';
import { API_BASE } from '@/api/api-client';

type MapRef = mapboxgl.Map | null;

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Interface for bounding box coordinates
interface BoundingBoxCoords {
  northEast: { lat: number; lng: number };
  northWest: { lat: number; lng: number };
  southEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}

// eslint-disable-next-line react-refresh/only-export-components
export const getBeachForecast = async (beachId: string) => {
  try {
    // 1. Fetch the beach row from Supabase
    const { data: beachRows, error: beachError } = await supabase
      .from("beaches")
      .select("id, name, location, mapbox_id")
      .eq("mapbox_id", beachId)
      .limit(1);

    if (beachError) {
      console.error("Error fetching beach by ID:", beachError);
      return null;
    }

    if (!beachRows || beachRows.length === 0) {
      console.log("Beach not found:", beachId);
      return null;
    }

    const beach = beachRows[0];
    const [lat, lng] = beach.location.split(",").map(Number);

    // 2. Fetch forecast from your API endpoint (this populates the forecast column)
    let forecastData = null;
    try {
      //console.log("Fetching forecast for beach ID:", beachId);
      const response = await fetch(`${API_BASE}/beaches/${beachId}/weather-forecast`);
      if (!response.ok) {
        console.log(`Failed to fetch forecast for beach ${beachId}`);
      } else {
        const data = await response.json();
        //console.log("Forecast data from API:", data);
        if (Array.isArray(data) && data.length > 0) {
          forecastData = data[0]; // take the first forecast entry
        }
      }
    } catch (err) {
      console.error("Error fetching forecast data from API:", err);
    }

    if (forecastData) {
      const wc = forecastData.weather_code;

      // Map weather codes to Cloud Cover description
      if (wc === 0) {
        forecastData['Cloud Cover'] = "Clear sky";
      } else if ([1, 2].includes(wc)) {
        forecastData['Cloud Cover'] = "Partly cloudy";
      } else if (wc === 3) {
        forecastData['Cloud Cover'] = "Overcast";
      } else if (wc >= 45 && wc <= 48) {
        forecastData['Cloud Cover'] = "Foggy";
      } else if (wc >= 51 && wc <= 57) {
        forecastData['Cloud Cover'] = "Drizzle";
      } else if (wc >= 61 && wc <= 67) {
        forecastData['Cloud Cover'] = "Rainy";
      } else if (wc >= 71 && wc <= 77) {
        forecastData['Cloud Cover'] = "Snowy";
      } else if (wc >= 80 && wc <= 82) {
        forecastData['Cloud Cover'] = "Rain showers";
      } else if (wc >= 85 && wc <= 86) {
        forecastData['Cloud Cover'] = "Snow showers";
      } else if (wc >= 95 && wc <= 99) {
        forecastData['Cloud Cover'] = "Thunderstorms";
      } else {
        forecastData['Cloud Cover'] = "Overcast";
      }
    }

    // 3. Fetch air quality from your API
    let airQ = null;
    try {
      const response = await fetch(`${API_BASE}/beaches/${beach.mapbox_id}/weather-forecast`);
      const data = await response.json();
      airQ = Math.round(data[0]?.air_quality ?? -1);
    } catch (err) {
      console.warn("Could not fetch air quality data:", err);
    }

    // 4. Fetch tide data from your API
    let cTide = { height: -1, time: "" };
    try {
      const tideRes = await fetch(`${API_BASE}/beaches/${beach.mapbox_id}/tide-prediction`);
      const tideData = await tideRes.json();
      cTide = tideData?.tides?.[4] || cTide;
    } catch (err) {
      console.warn("Could not fetch tide data:", err);
    }

    return {
      forecast: forecastData,
      airQ,
      cTide,
      beachId: beach.mapbox_id,
      lat,
      lng,
      name: beach.name,
    };
  } catch (err) {
    console.error("Unexpected error in getBeachForecast:", err);
    return null;
  }
};

const getFeatureId = (properties: any) => {
  if (properties?.['@id']) {
    return properties['@id'].slice(5); // remove first 5 chars
  }
  return properties?.mapbox_id || null;
};

const Map = () => {
  const mapRef = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const popupRef = useRef<mapboxgl.Popup | null>(null); // Used to close the popup programmatically outside of mapbox

  // Used to fetch beaches and find distance from user's location
  const beaches = useGetBeaches();
  const [userLng, setUserLng] = useState<number>(-81.3792);
  const [userLat, setUserLat] = useState<number>(28.5383);
  const [beachesOverlayOpen, setBeachesOverlayOpen] = useState<boolean>(true);

  // State for bounding box coordinates
  const [boundingBox, setBoundingBox] = useState<BoundingBoxCoords | null>(null);

  // fallback coords central FL
  const [lng] = useState<number>(-81.3792); 
  const [lat] = useState<number>(28.5383);
  const [zoom] = useState<number>(7);

  interface RedTideBeach {
    name: string;
    lat: number;
    long: number;
    abundance: string;
  }

  // Function to check if a point is within the bounding box
  const isPointInBounds = (lat: number, lng: number, bounds: BoundingBoxCoords) => {
    return (
      lat >= bounds.southWest.lat && 
      lat <= bounds.northEast.lat &&
      lng >= bounds.southWest.lng && 
      lng <= bounds.northEast.lng
    );
  };

  // Function to find beaches within bounding box
  const findBeachesInBounds = (bounds: BoundingBoxCoords) => {
    if (!beaches.data || !Array.isArray(beaches.data)) return [];

    const beachesInBounds = beaches.data.filter((beach) => {
      const [lat, lng] = beach.location.split(",").map(v => parseFloat(v));
      return isPointInBounds(lat, lng, bounds);
    });

    return beachesInBounds;
  };

  // Function to update bounding box coordinates
  const updateBoundingBox = () => {
    if (!mapRef.current) return;

    const bounds = mapRef.current.getBounds();
    const newBoundingBox: BoundingBoxCoords = {
      northEast: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng },
      northWest: { lat: bounds.getNorthWest().lat, lng: bounds.getNorthWest().lng },
      southEast: { lat: bounds.getSouthEast().lat, lng: bounds.getSouthEast().lng },
      southWest: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng }
    };

    setBoundingBox(newBoundingBox);
    
    // Print coordinates to console
    console.log('==========================================');
    console.log('Bounding Box Coordinates:');
    console.log('North East:', newBoundingBox.northEast);
    console.log('North West:', newBoundingBox.northWest);
    console.log('South East:', newBoundingBox.southEast);
    console.log('South West:', newBoundingBox.southWest);
    
    // Find and print beaches within bounds
    const beachesInBounds = findBeachesInBounds(newBoundingBox);
    console.log(`\nBeaches within bounds (${beachesInBounds.length} total):`);
    
    if (beachesInBounds.length === 0) {
      console.log('No beaches found within current bounds');
    } else {
      beachesInBounds.forEach((beach, index) => {
        const [lat, lng] = beach.location.split(",").map(v => parseFloat(v));
        console.log(`${index + 1}. ${beach.name}`);
        console.log(`   Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        console.log(`   Mapbox ID: ${beach.mapbox_id}`);
      });
    }
    console.log('==========================================');
  };

  function getWeatherColor(weatherCode: number) {
    //console.log("weatherCode", weatherCode);

    if (weatherCode === 0) {
      // Clear sky
      return "linear-gradient(to bottom right, #B8DCFF, #38A2FF)";
    } else if (weatherCode === 1) {
      // Mainly clear / partly cloudy
      return "linear-gradient(to bottom right, #C9E8FF, #60A3D6)";
    } else if (weatherCode === 2) {
      // Cloudy
      return "linear-gradient(to bottom right, #B0CDE0, #5E8EB8)";
    } else if (weatherCode === 3) {
      // Overcast
      return "linear-gradient(to bottom right, #DEEDFF, #6696CC)";
    } else if (weatherCode >= 61 && weatherCode <= 67) {
      // Rainy
      return "linear-gradient(to bottom right, #A9C2D4, #4A6C8C)";
    } else if (weatherCode >= 71 && weatherCode <= 77) {
      // Snowy
      return "linear-gradient(to bottom right, #FFFFFF, #B0C4DE)";
    } else if (weatherCode >= 95 && weatherCode <= 99) {
      // Thunderstorm
      return "linear-gradient(to bottom right, #5A5A5A, #2C2C2C)";
    } else {
      // Default fallback
      return "linear-gradient(to bottom right, #E0E0E0, #8A8A8A)";
    }
  }

  function getCardImg(weatherCode: number) {
    const isRainy = weatherCode >= 61 && weatherCode <= 67; // include all rain types
    const isClear = weatherCode === 0;

    if (isRainy) {
      return '<img src="https://openweathermap.org/img/wn/09d.png" style="width:50px;" alt="Rainy">';
    } else if (isClear) {
      return '<img src="https://openweathermap.org/img/wn/01d.png" style="width:50px;" alt="Clear">';
    } else if (weatherCode === 1) {
      return '<img src="https://openweathermap.org/img/wn/02d.png" style="width:50px;" alt="Partly cloudy">';
    } else if (weatherCode === 2) {
      return '<img src="https://openweathermap.org/img/wn/03d.png" style="width:50px;" alt="Cloudy">';
    } else if (weatherCode === 3) {
      return '<img src="https://openweathermap.org/img/wn/04d.png" style="width:50px;" alt="Overcast">';
    } else if (weatherCode >= 71 && weatherCode <= 77) {
      return '<img src="https://openweathermap.org/img/wn/13d.png" style="width:50px;" alt="Snow">';
    } else if (weatherCode >= 95 && weatherCode <= 99) {
      return '<img src="https://openweathermap.org/img/wn/11d.png" style="width:50px;" alt="Thunderstorm">';
    } else {
      // Default for other cloud/fog types
      return '<img src="https://openweathermap.org/img/wn/50d.png" style="width:50px;" alt="Cloudy">';
    }
  }

  const getRedTideData = (beachName: string, lat: number, lng: number) => {
    try {
      // First try exact name match
      const exactMatch = redTideData.find((beach: RedTideBeach) => 
        beach.name.toLowerCase() === beachName.toLowerCase()
      );
      
      if (exactMatch) {
        return exactMatch;
      }
      
      // If no exact match, try partial name matching
      const partialMatch = redTideData.find((beach: RedTideBeach) => 
        beach.name.toLowerCase().includes(beachName.toLowerCase()) ||
        beachName.toLowerCase().includes(beach.name.toLowerCase())
      );
      
      if (partialMatch) {
        return partialMatch;
      }
      
      // If no name match, find closest by coordinates
      const tolerance = 1;
      const nearbyBeach = redTideData.find((beach: RedTideBeach) => 
        Math.abs(beach.lat - lat) < tolerance && 
        Math.abs(beach.long - lng) < tolerance
      );
      
      if (nearbyBeach) {
        return nearbyBeach;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting red tide data:', error);
      return null;
    }
  };

  const openBeachPopup = async (lng: number, lat: number, beachName: string, beachId: string) => {
    try {
      const [beachData, redTide] = await Promise.all([
        getBeachForecast(beachId),
        getRedTideData(beachName, lat, lng),
      ]);

      let popupContent;

      if (beachData) {
        const forecast = beachData.forecast;

        popupContent = `
          <div class="weather-section" style="background: ${getWeatherColor(forecast['weather_code'])}; padding: 10px; display: flex; align-items: center; flex-wrap: wrap;">
            ${getCardImg(forecast['weather_code'])}
            <div style="display: flex; flex-direction: column; align-items: flex-end; margin-left: auto;">
              <div style="font-size: 15px; margin-bottom: 9px;">${forecast['Cloud Cover']}</div>
              <div style="font-size: 28px; margin-bottom: 7px;">
                ${Math.round(forecast["temp"])}°F
              </div>
              <div style="font-size: 15px; max-width: 150px; word-break: break-word; text-align: right;">
                ${beachName}
              </div>
            </div>
          </div>
          <div class="weather-row"><div class="weather-category">Tides</div><div class="weather-rating">${beachData.cTide.time ? beachData.cTide.height >= 0.5 ? 'High' : 'Low' : "No tide data"}</div></div>
          <div class="weather-row"><div class="weather-category">Air Quality</div><div class="weather-rating">${beachData.airQ}</div></div>
          <div class="weather-row"><div class="weather-category">UV Index</div><div class="weather-rating">${Math.round(forecast["uv_index"])}</div></div>
          <div class="weather-row"><div class="weather-category">Red Tide</div><div class="weather-rating">${redTide?.abundance || 'Unknown'}</div></div>
          ${beachId ? `
          <div style="text-align:center; margin-top:5px;">
            <button data-beach-id="${beachId}" style="background:none; border:none; color:#6a6a6a; text-decoration:underline; cursor:pointer;"
              onClick="window.location.href='/beaches/${beachId}'">
              More Info
            </button>
          </div>
          ` : ''}
        `;
      } else {
        popupContent = `
          <h3 class="beach-name">${beachName}</h3>
          <p style="color:#666; font-style:italic;">Beach data not available</p>
          ${redTide ? `<div class="weather-row"><div class="weather-category">Red Tide</div><div class="weather-rating">${redTide.abundance}</div></div>` : ''}
        `;
      }

      if (popupRef.current) {
        popupRef.current.remove();
      }

      popupRef.current = new mapboxgl.Popup()
        .setLngLat([lng, lat])
        .setHTML(popupContent)
        .addTo(mapRef.current!);

    } catch (err) {
      console.error("Error opening beach popup:", err);
    }
  };

  // Initialize map
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

    const initializeMap = (centerLng: number, centerLat: number, zoomLevel: number) => {
      if (mapRef.current) {
        mapRef.current.remove();
      }

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current as HTMLDivElement,
        center: [centerLng, centerLat],
        zoom: zoomLevel,
        style: 'mapbox://styles/sophiadadla/cme5opmc500qq01ryca404kxz',
      });

      mapRef.current.on('load', () => {
        // Initialize bounding box on load
        updateBoundingBox();

        if (!mapRef.current!.getSource('my-points')) {
          mapRef.current?.addSource('my-points', {
            type: 'vector',
            url: 'mapbox://sophiadadla.cmdzazrza0kaw1old7xtl2drp-4tyrf',
          });
        }

        if (!mapRef.current!.getLayer('points-layer')) {
          mapRef.current?.addLayer({
            id: 'points-layer',
            type: 'circle',
            source: 'my-points',
            'source-layer': 'fl_beaches',
            paint: {
              'circle-radius': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                10,
                5
              ],
              'circle-color': '#1c47b5'
            }
          });
        }

        if (!mapRef.current!.getSource('hover-point')) {
          mapRef.current?.addSource('hover-point', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });
        }

        // Add hover layer on top 
        if (!mapRef.current!.getLayer('points-hover')) {
          mapRef.current?.addLayer({
            id: 'points-hover',
            type: 'circle',
            source: 'hover-point',
            paint: {
              'circle-radius': 10,             // bigger radius for hover
              'circle-color': '#3d60d1',       // color on hover
              'circle-opacity': 1
            }
          });
        }

        mapRef.current?.on('click', 'points-layer', async (e) => {
          const feature = e.features?.[0];
          if (!feature || feature.geometry.type !== 'Point') return;

          const coords = feature.geometry.coordinates as [number, number];
          const [lng, lat] = coords;

          const beachName =
            feature.properties?.name?.split(",")[0].trim() ||
            feature.properties?.place_name?.split(",")[0].trim();

          const beachId = getFeatureId(feature.properties);

          try {
            await openBeachPopup(lng, lat, beachName, beachId);
          } catch (error) {
            console.error('Error fetching beach data:', error);

            new mapboxgl.Popup()
              .setLngLat([lng, lat] as LngLatLike)
              .setHTML(`
                <h3 class="beach-name">${beachName}</h3>
                <p style="color: #d32f2f;">Unable to load weather data</p>
                <div style="font-size: 12px; color: #666; margin-top: 10px;">
                  Database connection error
                </div>
              `)
              .addTo(mapRef.current!);
          }
        });

        // --- Hover: update hover-point source with the hovered feature geometry ---
        mapRef.current?.on('mousemove', 'points-layer', (e) => {
          const hoverSource = mapRef.current!.getSource('hover-point') as mapboxgl.GeoJSONSource | undefined;
          if (!hoverSource) return;

          if (!e.features || e.features.length === 0) {
            // clear hover
            hoverSource.setData({ type: 'FeatureCollection', features: [] });
            return;
          }

          const feature = e.features[0];
          const geom = feature.geometry;
          if (!geom || geom.type !== 'Point') {
            hoverSource.setData({ type: 'FeatureCollection', features: [] });
            return;
          }

          const coords = geom.coordinates as [number, number];
          const hoverFeature = {
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: coords
            },
            properties: { originalProps: feature.properties || {} }
          };

          hoverSource.setData({
            type: 'FeatureCollection',
            features: [hoverFeature]
          });
        });

        mapRef.current?.on('mouseleave', 'points-layer', () => {
          const hoverSource = mapRef.current!.getSource('hover-point') as mapboxgl.GeoJSONSource | undefined;
          if (!hoverSource) return;
          hoverSource.setData({ type: 'FeatureCollection', features: [] });
        });
      });

      // Add event listeners for map movement and zoom
      mapRef.current.on('moveend', updateBoundingBox);
      mapRef.current.on('zoomend', updateBoundingBox);
      mapRef.current.on('dragend', updateBoundingBox);

      // marker for user location
      new mapboxgl.Marker()
        .setLngLat([centerLng, centerLat])
        .addTo(mapRef.current);
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        initializeMap(position.coords.longitude, position.coords.latitude, zoom);
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
      },
      (err) => {
        console.error('Could not get location', err);
        initializeMap(lng, lat, zoom);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [lng, lat, zoom]);

  return <div className='relative w-full h-[calc(100vh-5rem)]'> {/** Subtract height of header/navbar */}
    <div ref={mapContainerRef} className='w-full h-[calc(100vh-5rem)]' /> {/** Subtract height of header/navbar */}

    {/** Grid overlay */}
     <Collapsible
        open={beachesOverlayOpen}
        onOpenChange={setBeachesOverlayOpen}
        className='absolute top-8 left-8 hidden md:block md:w-1/2 lg:w-1/3 bg-background border border-border rounded-xl'
      >
        
        <CollapsibleTrigger className='flex items-center w-full justify-between gap-2 py-4 px-8'>
          <span className='flex items-center gap-2'>
            <Waves className='w-4 h-4' />
            <h1 className='text-xl font-medium'>Beaches</h1>
          </span>

          <span className='flex items-center justify-center rounded-full border border-border bg-neutral-100 p-2'>
            <ChevronUp className={`w-4 h-4 transition-transform ${beachesOverlayOpen ? 'rotate-180' : ''}`} />
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 grid h-[calc(100vh-13rem)] grid-cols-1 xl:grid-cols-2 overflow-y-auto gap-2 scrollbar-hide">
          {beaches.isPending ? (
            [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="w-full h-60 rounded-lg" />
            ))
          ) : Array.isArray(beaches.data) && beaches.data.length > 0 && boundingBox ? (
            (() => {
              // Filter beaches to only those within bounding box
              const beachesInBounds = findBeachesInBounds(boundingBox);
              
              if (beachesInBounds.length === 0) {
                return <p className="col-span-full text-center text-gray-500">No beaches in current view. Zoom out or move the map to see more beaches.</p>;
              }
              
              return beachesInBounds
                .map((beach) => {
                  const [lat, lng] = beach.location.split(",").map(v => parseFloat(v));
                  const distance = haversineDistanceMiles(lat, lng, userLat, userLng);
                  return { ...beach, lat, lng, distance };
                })
                .sort((a, b) => a.distance - b.distance)
                .map((beach) => (
                  <div
                    className="contents cursor-pointer"
                    key={beach.mapbox_id}
                    onClick={() => {
                      mapRef.current!.flyTo({ center: [beach.lng, beach.lat], zoom: 10 });
                      openBeachPopup(beach.lng, beach.lat, beach.name, beach.mapbox_id);
                    }}
                    onMouseEnter={() => {
                      openBeachPopup(beach.lng, beach.lat, beach.name, beach.mapbox_id);
                    }}
                    onMouseLeave={() => {
                      // close popup when leaving card
                      if (popupRef.current) {
                        popupRef.current.remove();
                        popupRef.current = null;
                      }
                    }}
                  >
                    <BeachCard
                      coords={[beach.lng, beach.lat]}
                      beachName={beach.name}
                      imgSrc={beach.preview_picture ?? null}
                      beachId={beach.mapbox_id}
                      distance={`${Math.round(beach.distance)} mi`}
                    />
                  </div>
                ));
            })()
          ) : boundingBox ? (
            <p className="col-span-full text-center text-gray-500">No beaches found...</p>
          ) : (
            <p className="col-span-full text-center text-gray-500">Loading map bounds...</p>
          )}

        </CollapsibleContent>
     </Collapsible>
  </div>;
};

export default Map;