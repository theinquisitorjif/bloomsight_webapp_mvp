import { useRef, useEffect, useState } from 'react';
import mapboxgl, { type LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Papa from 'papaparse';
import type { FeatureCollection, Point } from 'geojson';

type MapRef = mapboxgl.Map | null;

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

useEffect(() => {
  const fetchAlgaeDataFromCSV = async () => {
    try {
      const res = await fetch('/output.csv');
      const csvText = await res.text();
            
      const parsed = Papa.parse(csvText, { 
        header: true, 
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });
      
      const rows = parsed.data as Row[];
      
      console.log('Parsed data sample:', rows.slice(0, 5));
      console.log('Available columns:', Object.keys(rows[0] || {}));
      console.log('First row values:', {
        chlor_a: rows[0]?.chlor_a,
        lat: rows[0]?.lat, 
        lon: rows[0]?.lon,
        palette: rows[0]?.palette
      });
      
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
              console.warn('Invalid coordinate:', { lat: row.lat, lon: row.lon, palette: row.palette });
              return null;
            }
            
            if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
              console.warn('Out of range:', { lat, lon });
              return null;
            }
            
            console.log('Valid point:', { lat, lon, intensity });
            
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

        // Hover popup for beaches
        mapRef.current?.on('mousemove', 'points-layer', (e) => {
          const feature = e.features?.[0];
          if (!feature || feature.geometry.type !== 'Point') return;

          const coords = feature.geometry.coordinates as [number, number];
          const [lng, lat] = coords;

          fetch(`/beach-weather?lat=${lat}&lon=${lng}`)
            .then((res) => res.json())
            .then((data) => {
              new mapboxgl.Popup()
                .setLngLat([lng, lat] as LngLatLike)
                .setHTML(`
                  <h3 class="beach-name">${feature.properties?.name || 'Unknown Beach'}</h3>
                  <h4 class="weather-section">
                    ${Math.round((data.temperature * 9) / 5 + 32)}°F
                    <p style="font-size: 16px; padding-top: 10px;">${data.conditions['Cloud Cover']}</p>
                  </h4>
                  <h2><strong>Current Conditions</strong></h2>
                  <div class="weather-row"><div class="weather-category">Available Parking</div><div class="weather-rating">${data.parking_info.count}</div></div>
                  <div class="weather-row"><div class="weather-category">Rip Currents</div><div class="weather-rating">${data.rip_risk.risk_level}</div></div>
                `)
                .addTo(mapRef.current!);
            })
            .catch((err) => {
              console.error('Weather fetch error:', err);
            });
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
  }, [heatmapData, mapLoaded]); // Depend on both data and map loaded state

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Map;