import { useRef, useEffect, useState } from 'react';
import mapboxgl, { type LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createClient } from '@supabase/supabase-js';
import redTideData from '../../../../fwc_redtide.json';

type MapRef = mapboxgl.Map | null;

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Map = () => {
  const mapRef = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

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

    function getCloudCoverColor(cloudCover: string) {
      if (cloudCover == "Mostly Clear") {
          return "linear-gradient(to bottom right, #B8DCFF, #38A2FF)"; // mostly clear
      } else if (cloudCover == "Partly Cloudy") {
          return "linear-gradient(to bottom right, #C9E8FF, #60A3D6)"; // partly cloudy
      } else if (cloudCover == "Cloudy") {
          return "linear-gradient(to bottom right, #DEEDFF, #6696CC)"; // cloudy
      } else { 
          return "linear-gradient(to bottom right, #E0E0E0, #8A8A8A)"; // overcast
      }
    }
  
  function getCardImg(cloudCover: string){
    if (cloudCover == "Mostly Clear") {
        return '<img src="../../../public/weather-2-svgrepo-com (1).svg" style="width: 40px;">';
      } else if (cloudCover == "Partly Cloudy") {
        return '<img src="../../../public/weather-symbol-4-svgrepo-com.svg" style="width: 50px;">';
      } else if (cloudCover == "Cloudy") {
        return '<img src="../../../public/weather-9-svgrepo-com (1).svg" style="width: 50px; padding-bottom: 10px; padding-left: 10px;">';
      } else { //overcast
        return '<img src="../../../public/weather-symbol-8-svgrepo-com.svg" style="width: 50px; padding-bottom: 10px; padding-left: 10px;">';
      }
  }

  const fetchBeachForecast = async (beachName: string, lat?: number, lng?: number, id?: string) => {
    try {
      if (lat && lng) {
        const tolerance = 0.005;
        const { data: forecasts, error: forecastError } = await supabase
          .from('beach_forecasts')
          .select('current')
          .gte('lat', lat - tolerance)
          .lte('lat', lat + tolerance)
          .gte('lon', lng - tolerance)
          .lte('lon', lng + tolerance)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (forecastError) {
          console.error('Error fetching forecast:', forecastError);
          return null;
        }

        if (forecasts && forecasts.length > 0) {
          if (forecasts[0].current['cloud_cover'] >= 0 && forecasts[0].current['cloud_cover'] < 20) {
                forecasts[0].current['Cloud Cover'] = "Mostly Clear";
            } else if (forecasts[0].current['cloud_cover'] >= 20 && forecasts[0].current['cloud_cover'] < 50) {
                forecasts[0].current['Cloud Cover'] = "Partly Cloudy";
            } else if (forecasts[0].current['cloud_cover'] >= 50 && forecasts[0].current['cloud_cover'] < 80) {
                forecasts[0].current['Cloud Cover'] = "Cloudy";
            } else {
                forecasts[0].current['Cloud Cover'] = "Overcast";
            }
          console.log('Forecast found:', forecasts[0].current);
          // get air quality
          const response = await fetch(`http://localhost:5002/beaches/${id}/weather-forecast`);
          const data = await response.json();
          const airQ = Math.round(data[0]["air_quality"]);

          // get tides
          const tidesres = await fetch(`http://localhost:5002/beaches/${id}/tide-prediction`);
          const tidesData = await tidesres.json();
          const cTide = tidesData.tides[4];


          return { forecast: forecasts[0].current, airQ, cTide };
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
            const [beachData, redTideData] = await Promise.all([
              fetchBeachForecast(beachName, lat, lng, beachId), // returns { forecast, airQ, cTide }
              getRedTideData(beachName, lat, lng),
            ]);
            
            console.log(beachData?.cTide);

            let popupContent;

            if (beachData) {
              const forecast = beachData.forecast;

              popupContent = `
              <div class="weather-section" style="background: ${getCloudCoverColor(forecast['Cloud Cover'])}; padding: 10px; display: flex; align-items: center; flex-wrap: wrap;">
                ${getCardImg(forecast['Cloud Cover'])}
                <!-- Text section aligned to the right -->
                <div style="display: flex; flex-direction: column; align-items: flex-end; min-width: 0; margin-left: auto;">
                  <div style="font-size: 15px; margin-bottom: 9px;">
                    ${forecast['Cloud Cover']}
                  </div>
                  <div style="font-size: 28px; margin-bottom: 7px;">
                    ${Math.round((forecast["temperature_2m"] * 9) / 5 + 32)}°F
                  </div>
                  <div style="font-size: 15px; max-width: 150px; word-break: break-word; text-align: right;">
                    ${beachName}
                  </div>
                </div>
              </div>

              <div class="weather-row">
                <div class="weather-category">Tides</div>
                <div class="weather-rating"> ${beachData.cTide.height >= 0.5 ? 'High' : 'Low'} </div>
              </div>
              <div class="weather-row">
                <div class="weather-category">Air Quality</div>
                <div class="weather-rating">${beachData.airQ}</div>
              </div>
              <div class="weather-row">
                <div class="weather-category">UV Index</div>
                <div class="weather-rating">${Math.round(forecast["uv_index"])}</div>
              </div>
              <div class="weather-row">
                <div class="weather-category">Red Tide</div>
                <div class="weather-rating">
                  ${redTideData?.abundance || 'Unknown'}
                </div>
              </div>
              <div style="display: flex; justify-content: center; align-items: center; height: 20px; margin-top: 5px;">
                <button 
                  data-beach-id="${beachId}"
                  style="background: none; border: none; color: rgb(106, 106, 106); padding: 0px 8px; font-size: 11px; border-radius: 8px; text-align: center; text-decoration: underline; cursor: pointer;"
                  onClick="console.log('${beachId}'); window.location.href='/'">
                  More Info
                </button>
              </div>


            `;

            } else {
              popupContent = `
                <h3 class="beach-name">${beachName}</h3>
                <p style="color: #666; font-style: italic;">Beach data not available</p>
                ${redTideData ? `
                  <div class="weather-row">
                    <div class="weather-category">Red Tide</div>
                    <div class="weather-rating">
                      ${redTideData.abundance}
                    </div>
                  </div>
                ` : ''}
              `;
            }

            new mapboxgl.Popup()
              .setLngLat([lng, lat] as LngLatLike)
              .setHTML(popupContent)
              .addTo(mapRef.current!);

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

      // Add a small marker for debugging/center marker
      new mapboxgl.Marker()
        .setLngLat([centerLng, centerLat])
        .addTo(mapRef.current);
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        initializeMap(position.coords.longitude, position.coords.latitude, zoom);
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

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Map;