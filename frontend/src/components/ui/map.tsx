import { useRef, useEffect, useState } from 'react';
import mapboxgl, { type LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Papa from 'papaparse';
import type { FeatureCollection, Point } from 'geojson';
import { createClient } from '@supabase/supabase-js';

type MapRef = mapboxgl.Map | null;

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Map = () => {
  const mapRef = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  //fall back coords is central FL
  const [lng] = useState<number>(81.3792);
  const [lat] = useState<number>(28.5383);
  const [zoom] = useState<number>(7);

  const [heatmapData, setHeatmapData] = useState<FeatureCollection<Point, { intensity: number }> | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  interface Row {
  chlor_a: string;  // First column
  lat: string;      // Latitude column
  lon: string;      // Longitude column  
  palette: string;  // Palette/intensity column
}

  const fetchAlgaeDataFromCSV = async () => {
    try {
      const res = await fetch('/output_florida.csv');
      const csvText = await res.text();
            
      const parsed = Papa.parse(csvText, { 
        header: true, 
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });
      
      const rows = parsed.data as Row[];
      
      const geojson: FeatureCollection<Point, { intensity: number }> = {
        type: 'FeatureCollection',
        features: rows
          .filter((row) => {
            // Filter based on actual column names
            const hasLat = row.lat && row.lat !== '';
            const hasLon = row.lon && row.lon !== '';
            const hasPalette = row.palette && row.palette !== '';
            
            if (!hasLat || !hasLon || !hasPalette) {
              console.log('Filtered out row:', row);
            }
            
            return hasLat && hasLon && hasPalette;
          })
          .map((row) => {
            const lat = parseFloat(row.lat);    // Note: lat first
            const lon = parseFloat(row.lon);    // Note: lon second  
            const intensity = parseFloat(row.palette);
            
            // Validate coordinates
            if (isNaN(lat) || isNaN(lon) || isNaN(intensity)) {
              return null;
            }
            
            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
              console.warn('Out of range:', { lat, lon });
              return null;
            }
                        
            return {
              type: "Feature" as const,
              geometry: {
                type: "Point" as const,
                coordinates: [lon, lat], // GeoJSON format: [longitude, latitude]
              },
              properties: {
                intensity: intensity,
              },
            };
          })
          .filter((feature): feature is NonNullable<typeof feature> => feature !== null),
      };

      console.log('Final GeoJSON features:', geojson.features.length);

      setHeatmapData(geojson);
    } catch (err) {
      console.error('Error fetching algae CSV:', err);
    }
  };

  const fetchBeachForecast = async (beachName: string, lat?: number, lng?: number) => {
    try {
      // Look up by coordinates using lat/lon columns in beach_forecasts
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

        console.log(forecasts, forecasts[0].current.temperature_2m);

        if (forecasts && forecasts.length > 0) {
          return forecasts[0].current;
        }

        console.log('No forecast found for coordinates:', lat, lng);
        // Explicitly return null when no forecast is found
        return null;
      }
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return null;
    }
    // Also, you need a return statement for when lat/lng are not provided
    return null;
};

useEffect(() => {

  fetchAlgaeDataFromCSV();
}, []);

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
        style: 'mapbox://styles/sophiadadla/cmdzb7ypd00ff01s7eokp2okh',
      });

      mapRef.current.on('load', () => {
        console.log('Map loaded');
        setMapLoaded(true); // Set state when map is loaded
        
        // Beaches vector layer
        mapRef.current?.addSource('my-points', {
          type: 'vector',
          url: 'mapbox://sophiadadla.cmdzazrza0kaw1old7xtl2drp-4tyrf',
        });

        mapRef.current?.addLayer({
          id: 'points-layer',
          type: 'circle',
          source: 'my-points',
          'source-layer': 'fl_beaches',
          paint: {
            'circle-radius': 6,
            'circle-color': '#007cbf',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
          },
        });

        mapRef.current?.on('mousemove', 'points-layer', async (e) => {
          //i want to eventually make the points have an effect on hover
        });
        // Hover popup for beaches - Updated to use direct Supabase access
        mapRef.current?.on('click', 'points-layer', async (e) => {
          const feature = e.features?.[0];
          if (!feature || feature.geometry.type !== 'Point') return;

          const coords = feature.geometry.coordinates as [number, number];
          const [lng, lat] = coords;
          const beachName = feature.properties?.name || 'Unknown Beach';

          try {
            // Fetch beach forecast data directly from Supabase using name and coordinates
            const beachData = await fetchBeachForecast(beachName, lat, lng);
            console.log(beachData, beachData["temperature_2m"])
            
            let popupContent;

            if (beachData) {
              const forecast = beachData;
              
              popupContent = `
                <h3 class="beach-name">${beachName}</h3>
                <h4 class="weather-section">
                  ${Math.round((forecast["temperature_2m"] * 9) / 5 + 32)}°F
                  <p style="font-size: 16px; padding-top: 10px;">${forecast["cloud_cover"]}</p>
                </h4>
                <h2><strong>Current Conditions</strong></h2>
                <div class="weather-row">
                  <div class="weather-category">Tides</div>
                  <div class="weather-rating">${forecast.tides || 'N/A'}</div>
                </div>
                <div class="weather-row">
                  <div class="weather-category">Air Quality</div>
                  <div class="weather-rating">${forecast.air_quality || 'N/A'}</div>
                </div>
                <div class="weather-row">
                  <div class="weather-category">UV Index</div>
                  <div class="weather-rating">${Math.round(forecast["uv_index"])}</div>
                </div>
                <div class="weather-row">
                  <div class="weather-category">Algae</div>
                  <div class="weather-rating">${forecast.wind_speed ? Math.round(forecast["wind_speed"]) + ' mph' : 'N/A'}</div>
                </div>
                ${forecast.overall_rating || forecast.recommendation ? `
                  <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
                    ${forecast.overall_rating ? `<strong style="color: #007cbf;">${forecast.overall_rating}</strong>` : ''}
                    ${forecast.recommendation ? `<p style="font-size: 14px; margin-top: 5px; color: #555;">${forecast.recommendation}</p>` : ''}
                  </div>
                ` : ''}
              `;
            } else {
              // Beach not found in database
              popupContent = `
                <h3 class="beach-name">${beachName}</h3>
                <p style="color: #666; font-style: italic;">Beach data not available</p>
                <div style="font-size: 12px; color: #666; margin-top: 10px;">
                  Beach not found in database
                </div>
              `;
            }

            new mapboxgl.Popup()
              .setLngLat([lng, lat] as LngLatLike)
              .setHTML(popupContent)
              .addTo(mapRef.current!);

          } catch (error) {
            console.error('Error fetching beach data:', error);
            
            // Show error popup
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
      });

      new mapboxgl.Marker().setLngLat([centerLng, centerLat]).addTo(mapRef.current);
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

  // Add heatmap layer when BOTH data and map are available
  useEffect(() => {
    console.log('Heatmap useEffect triggered', {
      mapExists: !!mapRef.current,
      mapLoaded: mapLoaded,
      dataExists: !!heatmapData,
      dataLength: heatmapData?.features.length
    });

    if (!mapRef.current || !heatmapData || !mapLoaded) {
      console.log('Map, data, or load state not ready');
      return;
    }

    // Add heatmap immediately since we know everything is ready
    const addHeatmapLayer = () => {
      console.log('Adding heatmap layer...');

      try {
        // Remove existing layer/source if it exists
        if (mapRef.current!.getLayer('algae-heatmap')) {
          mapRef.current!.removeLayer('algae-heatmap');
        }
        if (mapRef.current!.getSource('algae')) {
          mapRef.current!.removeSource('algae');
        }

        // Calculate intensity range
        const intensities = heatmapData.features.map(f => f.properties.intensity);
        const minIntensity = Math.min(...intensities);
        const maxIntensity = Math.max(...intensities);
        
        console.log('Intensity range:', minIntensity, 'to', maxIntensity);

        // Add source
        mapRef.current!.addSource('algae', {
          type: 'geojson',
          data: heatmapData,
        });

        // Add heatmap layer
        mapRef.current!.addLayer({
          id: 'algae-heatmap',
          type: 'heatmap',
          source: 'algae',
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              minIntensity, 0.1,
              maxIntensity, 1
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              9, 3
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 255, 0)',
              0.1, 'rgba(0, 255, 255, 0.4)',
              0.3, 'rgba(0, 255, 0, 0.6)',
              0.5, 'rgba(255, 255, 0, 0.7)',
              0.7, 'rgba(255, 165, 0, 0.8)',
              1, 'rgba(255, 0, 0, 0.9)',
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,
              9, 20
            ],
            'heatmap-opacity': 0.8,
          },
        });

        // Fit map to show all data
        const coordinates = heatmapData.features.map(f => f.geometry.coordinates);
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord as [number, number]));
        
        mapRef.current!.fitBounds(bounds, { 
          padding: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        console.log('Heatmap layer added successfully with', heatmapData.features.length, 'points');
      } catch (error) {
        console.error('Error adding heatmap layer:', error);
      }
    };

    addHeatmapLayer();
  }, [heatmapData, mapLoaded]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Map;