import { useRef, useEffect, useState } from 'react';
import mapboxgl, { type LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FeatureCollection, Point } from 'geojson';

const Map = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [lng, setLng] = useState(-74.0242);
  const [lat, setLat] = useState(40.6941);
  const [zoom, setZoom] = useState(7);

  const [heatmapData, setHeatmapData] = useState<FeatureCollection<Point> | null>(null);

  // Initialize map only once
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

    if (mapRef.current) return; // map already initialized

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current as HTMLElement,
      style: 'mapbox://styles/sophiadadla/cmdzb7ypd00ff01s7eokp2okh',
      center: [lng, lat],
      zoom: zoom,
    });

    mapRef.current.on('load', () => {
      // Add your static sources and layers here:

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

      // Add hover popup event
      mapRef.current?.on('mousemove', 'points-layer', (e) => {
        // Your popup code here
      });

      // Add an empty source for algae heatmap to be filled later
      mapRef.current?.addSource('algae', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      mapRef.current?.addLayer({
        id: 'algae-heatmap',
        type: 'heatmap',
        source: 'algae',
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 255, 255, 0)',
            0.2, 'rgba(0, 255, 0, 0.6)',
            0.4, 'rgba(255, 255, 0, 0.7)',
            0.6, 'rgba(255, 165, 0, 0.8)',
            1, 'rgba(255, 0, 0, 0.9)'
          ],
          'heatmap-radius': 20,
          'heatmap-opacity': 0.7,
        },
      });

      // Optionally add a marker
      new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapRef.current);
    });

    // Try to get user location and re-center
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLng = pos.coords.longitude;
        const userLat = pos.coords.latitude;
        setLng(userLng);
        setLat(userLat);
        mapRef.current?.setCenter([userLng, userLat]);
        mapRef.current?.setZoom(7);
      },
      (err) => {
        console.error('Could not get location', err);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update algae heatmap data when it changes
  useEffect(() => {
    if (heatmapData && mapRef.current?.isStyleLoaded()) {
      const source = mapRef.current.getSource('algae') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(heatmapData);
      }
    }
  }, [heatmapData]);

  // Fetch algae data once on mount
  useEffect(() => {
    const fetchAlgaeData = async () => {
      try {
        const res = await fetch("/algae_heatmap.json");
        const data = await res.json();
        setHeatmapData(data);
      } catch (err) {
        console.error("Error fetching algae data:", err);
      }
    };
    fetchAlgaeData();
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Map;
