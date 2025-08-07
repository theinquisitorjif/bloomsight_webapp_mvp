import { useRef, useEffect, useState } from 'react';
import mapboxgl, { type LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { type Point } from 'geojson';

type MapRef = mapboxgl.Map | null;

const Map = () => {
  const mapRef = useRef<MapRef>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [lng, setLng] = useState<number>(-74.0242);
  const [lat, setLat] = useState<number>(40.6941);
  const [zoom, setZoom] = useState<number>(10.12);

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
      mapRef.current?.addSource('my-points', {
        type: 'vector',
        url: 'mapbox://sophiadadla.cmdzazrza0kaw1old7xtl2drp-3l3jx',
      });

      mapRef.current?.addLayer({
        id: 'points-layer',
        type: 'circle', 
        source: 'my-points',
        'source-layer': 'fl_beaches', // LAYER NAME INSIDE THE TILE SET
        paint: {
          'circle-radius': 6,
          'circle-color': '#007cbf',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      });

      mapRef.current?.on('mousemove', 'points-layer', (e) => {
        const feature = e.features?.[0];
        if (!feature || feature.geometry.type !== 'Point') return;

        const coords = (feature.geometry as Point).coordinates;
        const [lng, lat] = coords;

        const url = `/beach-weather?lat=${lat}&lon=${lng}`;
        console.log(" :", url);

        fetch(`/beach-weather?lat=${lat}&lon=${lng}`)
          .then((res) => res.json())
          .then((data) => {
            new mapboxgl.Popup()
              .setLngLat([lng, lat] as LngLatLike)
              .setHTML(`
                <h3>${feature.properties?.name}</h3>
                <p><strong>Overall:</strong> ${data.overall}</p>
                <p><strong>Recommendation:</strong> ${data.recommendation}</p>
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
        const userLng = position.coords.longitude;
        const userLat = position.coords.latitude;

        setLng(userLng);
        setLat(userLat);
        setZoom(14);

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
  }, []); // run once on mount

  useEffect(() => {
    
    fetch('http://localhost:5000/beach-weather')
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        // You can integrate these data points as markers or layers if you want
      })
      .catch(console.error);
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Map;
