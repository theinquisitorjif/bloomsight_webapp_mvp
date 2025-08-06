import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type MapRef = mapboxgl.Map | null;

const Map = () => {
  const mapRef = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [lng, setLng] = useState<number>(-74.0242);
  const [lat, setLat] = useState<number>(40.6941);
  const [zoom, setZoom] = useState<number>(10.12);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLng = position.coords.longitude;
        const userLat = position.coords.latitude;

        setLng(userLng);
        setLat(userLat);
        setZoom(14);

        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current as HTMLDivElement,
          center: [userLng, userLat],
          zoom: 14,
          style: 'mapbox://styles/mapbox/streets-v11',
        });

        new mapboxgl.Marker()
          .setLngLat([userLng, userLat])
          .addTo(mapRef.current);
      },
      (err) => {
        console.error('Could not get location', err);

        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current as HTMLDivElement,
          center: [lng, lat],
          zoom,
          style: 'mapbox://styles/mapbox/streets-v11',
        });
      },
      { enableHighAccuracy: true }
    );

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Map;
