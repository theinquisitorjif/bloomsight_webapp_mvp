import { Bird, Car, Mountain, TreePine, Users } from "lucide-react";
import { Button } from "../ui/button";
import { useSectionInView } from "@/hooks/use-section-in-view";
import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";

export const BeachParking = () => {
  const { ref } = useSectionInView("parking", 0.5);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    mapInstanceRef.current = new mapboxgl.Map({
      container: mapRef.current,
      center: [-117.3201, 33.1026],
      zoom: 13,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
    });

    // return () => {
    //   if (mapInstanceRef.current) mapInstanceRef.current.remove();
    // };
  }, []);

  return (
    <section
      ref={ref}
      id="parking"
      className="grid grid-cols-1 lg:grid-cols-3 gap-10"
    >
      <div className="lg:col-span-1">
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
      </div>
      <div className="lg:col-span-2">
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
