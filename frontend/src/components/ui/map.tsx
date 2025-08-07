import { useRef, useEffect, useState } from 'react';
import mapboxgl, { type LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FeatureCollection, Feature, Point } from 'geojson';
import { createBeachWeatherPopup } from './popup.js';


type MapRef = mapboxgl.Map | null;

const Map = () => {
  const mapRef = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [lng, setLng] = useState<number>(-74.0242);
  const [lat, setLat] = useState<number>(40.6941);
  const [zoom, setZoom] = useState<number>(10.12);
  type HeatmapFeature = Feature<Point, { intensity: number }>;

  const [heatmapData, setHeatmapData] = useState<FeatureCollection<Point, { intensity: number }> | null>(null);

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
        // Load vector point layer
        mapRef.current?.addSource('my-points', {
          type: 'vector',
          url: 'mapbox://sophiadadla.cmdzazrza0kaw1old7xtl2drp-3l3jx',
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

        // Add hover popup for beach data
        mapRef.current?.on('mousemove', 'points-layer', (e) => {
          const feature = e.features?.[0];
          if (!feature || feature.geometry.type !== 'Point') return;

          const coords = (feature.geometry as Point).coordinates;
          const [lng, lat] = coords;

          fetch(`/beach-weather?lat=${lat}&lon=${lng}`)
            .then((res) => res.json())
            .then((data) => {
              createBeachWeatherPopup(mapRef, feature, data, lat, lng);
            })
            .catch((err) => {
              console.error('Weather fetch error:', err);
            });
        });

        if (heatmapData) {
          mapRef.current?.addSource('algae', {
            type: 'geojson',
            data: heatmapData,
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
        }
      });

      new mapboxgl.Marker().setLngLat([centerLng, centerLat]).addTo(mapRef.current);
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLng = position.coords.longitude;
        const userLat = position.coords.latitude;

        setLng(userLng);
        setLat(userLat);
        setZoom(20);

        initializeMap(userLng, userLat, 14);
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
  }, [heatmapData]); 


  return <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Map;
