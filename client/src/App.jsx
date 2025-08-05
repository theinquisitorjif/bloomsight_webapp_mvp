import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [lng, setLng] = useState(-74.0242); // Default fallback (NYC)
  const [lat, setLat] = useState(40.6941);
  const [zoom, setZoom] = useState(10.12);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic29waGlhZGRsIiwiYSI6ImNtZHhycmc5cjJoODQybXB2ZDMzM2RzbTkifQ.8jEMsP2QeMvTwDUhhtomMQ';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLng(position.coords.longitude);
        setLat(position.coords.latitude);
        setZoom(14);

        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 14,
          style: 'mapbox://styles/mapbox/streets-v11',
        });

        new mapboxgl.Marker()
          .setLngLat([position.coords.longitude, position.coords.latitude])
          .addTo(mapRef.current);
      },
      (err) => {
        console.error('Could not get location', err);
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          center: [lng, lat],
          zoom,
          style: 'mapbox://styles/mapbox/streets-v11',
        });
      },
      { enableHighAccuracy: true }
    );

    return () => mapRef.current && mapRef.current.remove();
  }, []);

  return <div id="map-container" ref={mapContainerRef} />;
}

export default App;
