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

/**
 * Fetch the most recent forecast for a beach near given lat/lng.
 */
// eslint-disable-next-line react-refresh/only-export-components
export async function getForecast(lat: number, lng: number, tolerance = 0.005) {
  try {
    // 1. Fetch rows (only forecast, location, updated_at)
    const { data: beaches, error } = await supabase
      .from("beaches")
      .select("forecast, location, last_updated")
      .order("last_updated", { ascending: false });

    if (error) {
      console.error("Error fetching beaches:", error);
      return null;
    }

    // 2. Parse and filter in JS
    const matching = beaches.filter((row) => {
      const [rowLat, rowLng] = row.location.split(",").map(Number);
      return (
        Math.abs(rowLat - lat) <= tolerance &&
        Math.abs(rowLng - lng) <= tolerance
      );
    });

    // 3. Return the latest forecast (since data is already ordered by updated_at)
    return matching.length > 0 ? matching[0].forecast : null;
  } catch (err) {
    console.error("Unexpected error in getForecast:", err);
    return null;
  }
}




const Map = () => {
  const mapRef = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const popupRef = useRef<mapboxgl.Popup | null>(null); // Used to close the popup programmatically outside of mapbox

  // Used to fetch beaches and find distance from user's location
  const beaches = useGetBeaches();
  const [userLng, setUserLng] = useState<number>(-81.3792);
  const [userLat, setUserLat] = useState<number>(28.5383);
  const [beachesOverlayOpen, setBeachesOverlayOpen] = useState<boolean>(true);

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

  function getWeatherColor(weatherCode: number) {
    console.log("weatherCode", weatherCode);

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


  const fetchBeachForecast = async (beachName: string, lat?: number, lng?: number, id?: string) => {
    try {
      if (lat && lng) {

        const forecasts = await getForecast(lat, lng);
        const thisForecast = forecasts[0];
        console.log('Fetched forecasts:', thisForecast);

        if (thisForecast && forecasts.length > 0) {
          const cc = thisForecast.cloud_cover;
          if (cc >= 0 && cc < 20) {
                thisForecast['Cloud Cover'] = "Mostly Clear";
            } else if (cc >= 20 && cc < 50) {
                thisForecast['Cloud Cover'] = "Partly Cloudy";
            } else if (cc >= 50 && cc < 80) {
                thisForecast['Cloud Cover'] = "Cloudy";
            } else {
               thisForecast['Cloud Cover'] = "Overcast";
            }

          // get air quality
          const response = await fetch(`${API_BASE}/beaches/${id}/weather-forecast`);
          const data = await response.json();
          const airQ = Math.round(data[0]["air_quality"]);

          // get tides
          const tidesres = await fetch(`${API_BASE}/beaches/${id}/tide-prediction`);
          const tidesData = await tidesres.json();
          const cTide = tidesData.tides[4] || [{
            "height": -1,
            "time": ""
          }];


          return { forecast: thisForecast, airQ, cTide };
        }

        console.log('No forecast found for coordinates:', lat, lng);
        return null;
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      return null;
    }
    return null;
  };

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

  const openBeachPopup = async (lng: number, lat: number, beachName: string, beachId?: string) => {
    try {
      const [beachData, redTide] = await Promise.all([
        fetchBeachForecast(beachName, lat, lng, beachId),
        getRedTideData(beachName, lat, lng),
      ]);

      let popupContent;
      if (beachData) {
        const forecast = beachData.forecast;
        console.log("forecast", forecast);
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
          <div style="text-align:center; margin-top:5px;">
            <button data-beach-id="${beachId}" style="background:none; border:none; color:#6a6a6a; text-decoration:underline; cursor:pointer;"
              onClick="window.location.href='/beaches/${beachId}'">
              More Info
            </button>
          </div>
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
        console.log('Map loaded');

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

        // --- Click popup for beaches ---
        mapRef.current?.on('click', 'points-layer', async (e) => {
          const feature = e.features?.[0];
          if (!feature || feature.geometry.type !== 'Point') return;
          const coords = feature.geometry.coordinates as [number, number];
          const [lng, lat] = coords;
          const beachName = feature.properties?.name || 'Unknown Beach';
          const beachId = feature.properties? feature.properties['@id'].slice(5): null;

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
          ) : Array.isArray(beaches.data) && beaches.data.length > 0 ? (
            beaches.data.map((beach) => {
              const [lat, lng] = beach.location.split(",").map(parseFloat);
              return (
                <div
                  className="contents cursor-pointer"
                  key={beach.id}
                  onClick={() => {
                    mapRef.current!.flyTo({ center: [lng, lat], zoom: 10 });
                    openBeachPopup(lng, lat, beach.name, beach.mapbox_id);
                  }}
                >
                  <BeachCard
                    coords={[lng, lat]}
                    beachName={beach.name}
                    imgSrc={beach.preview_picture ?? null}
                    beachId={parseInt(beach.mapbox_id)}
                    distance={`${Math.round(haversineDistanceMiles(lat, lng, userLat, userLng))} mi`}
                  />
                </div>
              );
            })
          ) : <p>No beaches found...</p>}
        </CollapsibleContent>
     </Collapsible>
  </div>;
};

export default Map;