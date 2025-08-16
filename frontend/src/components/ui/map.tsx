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

  // fallback coords central FL
  const [lng] = useState<number>(-81.3792); 
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
            const hasLat = row.lat && row.lat !== '';
            const hasLon = row.lon && row.lon !== '';
            const hasPalette = row.palette && row.palette !== '';

            if (!hasLat || !hasLon || !hasPalette) {
              console.log('Filtered out row:', row);
            }

            return hasLat && hasLon && hasPalette;
          })
          .map((row) => {
            const lat = parseFloat(row.lat);
            const lon = parseFloat(row.lon);
            const intensity = parseFloat(row.palette);

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
                coordinates: [lon, lat],
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

    function getCloudCoverColor(cloudCover: string) {
      if (cloudCover == "Mostly Clear") {
          return "linear-gradient(to bottom right, #7EB2F5, #217ebf)"; // Sky blue for mostly clear
      } else if (cloudCover == "Partly Cloudy") {
          return "linear-gradient(to bottom right, #B0C4DE, #217ebf)"; // Light steel blue for partly cloudy
      } else if (cloudCover == "Cloudy") {
          return "linear-gradient(to bottom right, #778899, #217ebf)"; // Light slate gray for cloudy
      } else { //overcast
          return "linear-gradient(to bottom right, #696969, #8A8A8A)"; // Dim gray for overcast
      }
    }
  
  function getCardImg(cloudCover: string){
    if (cloudCover == "Mostly Clear") {
        return '<img src="../../../public/weather-2-svgrepo-com (1).svg" style="width: 56px; height: 56px; display: flex;">';
      } else if (cloudCover == "Partly Cloudy") {
        return '<img src="../../../public/weather-symbol-4-svgrepo-com.svg" style="width: 56px; height: 56px; display: flex;">';
      } else if (cloudCover == "Cloudy") {
        return '<img src="../../../public/weather-9-svgrepo-com (1).svg" style="width: 56px; height: 56px; display: flex;">';
      } else { //overcast
        return '<img src="../../../public/weather-symbol-8-svgrepo-com.svg" style="width: 56px; height: 56px; display: flex;">';
      }
  }

  const fetchBeachForecast = async (beachName: string, lat?: number, lng?: number) => {
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

          if (forecasts[0].current['Cloud Cover'] >= 0 && forecasts[0].current['Cloud Cover'] < 20) {
                forecasts[0].current['Cloud Cover'] = "Mostly Clear";
            } else if (forecasts[0].current['Cloud Cover'] >= 20 && forecasts[0].current['Cloud Cover'] < 50) {
                forecasts[0].current['Cloud Cover'] = "Partly Cloudy";
            } else if (forecasts[0].current['Cloud Cover'] >= 50 && forecasts[0].current['Cloud Cover'] < 80) {
                forecasts[0].current['Cloud Cover'] = "Cloudy";
            } else {
                forecasts[0].current['Cloud Cover'] = "Overcast";
            }



          return forecasts[0].current;
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
        style: 'mapbox://styles/sophiadadla/cme5opmc500qq01ryca404kxz',
      });

      mapRef.current.on('load', () => {
        console.log('Map loaded');
        setMapLoaded(true);

        //  your vector source & base points layer (beaches)
        // if your style already contains the source/layer this will create a new source named 'my-points' and a new layer 'points-layer'
        if (!mapRef.current!.getSource('my-points')) {
          mapRef.current?.addSource('my-points', {
            type: 'vector',
            url: 'mapbox://sophiadadla.cmdzazrza0kaw1old7xtl2drp-4tyrf',
          });
        }

        // add the layer that shows beach points (keeps your paint expression but highlight handled separately)
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

        // --- Add a client-side GeoJSON "hover-point" source + a hover layer that paints black ---
        // This avoids depending on vector tile feature IDs / feature-state.
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

          try {
            const beachData = await fetchBeachForecast(beachName, lat, lng);
            let popupContent;

            if (beachData) {
              const forecast = beachData;

              popupContent = `
                <h4 class="weather-section" style="background: ${getCloudCoverColor(forecast['Cloud Cover'])}">
                  <div style="font-size: 15px; padding: 5px;">
                    ${getCardImg(forecast['Cloud Cover'])}
                    ${forecast['Cloud Cover']}
                  </div>
                  ${Math.round((forecast["temperature_2m"] * 9) / 5 + 32)}°F
                  <p style="font-size: 12px; padding: 5 5 0 0">${beachName}</p>
                </h4>
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

        try {
          const style = mapRef.current?.getStyle();
          if (style?.layers) {
            console.log('Style layer IDs:', style.layers.map(l => l.id));
          }
        } catch (err) {
          // ignore
        }
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

    const addHeatmapLayer = () => {
      console.log('Adding heatmap layer...');

      try {
        if (mapRef.current!.getLayer('algae-heatmap')) {
          mapRef.current!.removeLayer('algae-heatmap');
        }
        if (mapRef.current!.getSource('algae')) {
          mapRef.current!.removeSource('algae');
        }

        const intensities = heatmapData.features.map(f => f.properties.intensity);
        const minIntensity = Math.min(...intensities);
        const maxIntensity = Math.max(...intensities);

        console.log('Intensity range:', minIntensity, 'to', maxIntensity);

        mapRef.current!.addSource('algae', {
          type: 'geojson',
          data: heatmapData,
        });

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
