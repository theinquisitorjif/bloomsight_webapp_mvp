// import { Bird, Car, Mountain, TreePine, Users } from "lucide-react";
// import { Button } from "../ui/button";
import { useSectionInView } from "@/hooks/use-section-in-view";
import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { useGetBeachByBeachID, useGetParkingSpotsByBeachID } from "@/api/beach";

export const BeachParking = ({ beachId }: { beachId: number }) => {
  const { ref } = useSectionInView("parking", 0.5);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const parkingSpotsQuery = useGetParkingSpotsByBeachID(beachId);
  const beachQuery = useGetBeachByBeachID(beachId);

  useEffect(() => {
    if (!mapRef.current || !beachQuery.data) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    let lat = null;
    let lng = null;

    if (beachQuery?.data?.location) {
      const parts = beachQuery.data.location.split(",");
      if (parts.length === 2) {
        lat = parseFloat(parts[0]);
        lng = parseFloat(parts[1]);
      }
    }

    if (!lat || !lng) {
      console.error("Invalid beach location format:", beachQuery.data.location);
      return;
    }

    const map = new mapboxgl.Map({
      container: mapRef.current,
      center: [lng, lat],
      zoom: 13,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
    });

    mapInstanceRef.current = map;

    new mapboxgl.Marker({ color: "blue" })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup().setHTML(`<h4>${beachQuery.data.name}</h4>`)
      )
      .addTo(map);
  }, [beachQuery.data]);

  // Add parking markers + directions
  useEffect(() => {
    if (!mapInstanceRef.current || !beachQuery.data || !parkingSpotsQuery.data)
      return;

    const map = mapInstanceRef.current;
    const [beachLat, beachLng] = beachQuery.data.location
      .split(",")
      .map(parseFloat);

    parkingSpotsQuery.data.top_access_points.forEach((spot, index) => {
      if (!spot.coordinates || !spot.address) return;

      const [lat, lng] = spot.coordinates.split(",").map(parseFloat);

      // Add marker
      new mapboxgl.Marker({ color: "red" })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div>
              <h4>${spot.address}</h4>
              <p>${spot.parking_fee_str}</p>
              <a 
                href="https://www.google.com/maps/dir/${beachLat},${beachLng}/${lat},${lng}" 
                target="_blank" 
                style="color: blue; text-decoration: underline;">
                Open in Google Maps
              </a>
            </div>
          `)
        )
        .addTo(map);

      // Draw route line
      map.addSource(`route-${index}`, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [beachLng, beachLat],
              [lng, lat],
            ],
          },
          properties: {},
        },
      });

      map.addLayer({
        id: `route-${index}`,
        type: "line",
        source: `route-${index}`,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#007aff", "line-width": 3 },
      });
    });
  }, [parkingSpotsQuery.data, beachQuery.data]);

  return (
    <section
      ref={ref}
      id="parking"
      className="grid grid-cols-1 lg:grid-cols-3 gap-10"
    >
      {/* <div className="lg:col-span-1">
        <h3 className="text-2xl font-semibold tracking-tight">
          Plan your visit
        </h3>

        <div className="mt-6 rounded-lg border border-border h-[455px] p-10">
          <ul className="flex flex-col gap-4">
            <li className="flex items-center gap-4">
              <Car
                size={50}
                className="border border-border bg-neutral-100 p-3 rounded-full"
              />{" "}
              <p className="font-medium text-primary/80">Good parking</p>
            </li>
            <li className="flex items-center gap-4">
              <Users
                size={50}
                className="border border-border bg-neutral-100 p-3 rounded-full"
              />{" "}
              <p className="font-medium text-primary/80">Kid-friendly</p>
            </li>
            <li className="flex items-center gap-4">
              <TreePine
                size={50}
                className="border border-border bg-neutral-100 p-3 rounded-full"
              />{" "}
              <p className="font-medium text-primary/80">Forests</p>
            </li>
            <li className="flex items-center gap-4">
              <Mountain
                size={50}
                className="border border-border bg-neutral-100 p-3 rounded-full"
              />{" "}
              <p className="font-medium text-primary/80">Mountains</p>
            </li>
            <li className="flex items-center gap-4">
              <Bird
                size={50}
                className="border border-border bg-neutral-100 p-3 rounded-full"
              />{" "}
              <p className="font-medium text-primary/80">Birding</p>
            </li>

            <Button className="rounded-full px-20 mt-4 w-fit" variant="brand">
              Show more
            </Button>
          </ul>
        </div>
      </div> */}
      <div className="lg:col-span-3">
        <h3 className="text-2xl font-semibold tracking-tight">Parking Spots</h3>

        <div
          ref={mapRef}
          style={{ width: "100%", height: "455px" }}
          className="rounded-lg mt-6 bg-neutral-200"
        />
      </div>
    </section>
  );
};
