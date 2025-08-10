import WeatherForecast from "../weather/weather-forecast";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import { useSectionInView } from "@/hooks/use-section-in-view";

export const BeachOverview = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const { ref } = useSectionInView("overview", 0.5);

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
      style: "mapbox://styles/mapbox/satellite-v9",
    });

    // return () => {
    //   if (mapInstanceRef.current) mapInstanceRef.current.remove();
    // };
  }, []);

  return (
    <section
      ref={ref}
      id="overview"
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10"
    >
      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="text-2xl font-semibold tracking-tight">Overview</h3>
        </div>
        <div className="p-2 rounded-lg border border-border mt-2">
          <p className="text-muted-foreground text-sm">Current Conditions</p>
          <div className="flex items-center gap-1">
            <p className="font-semibold text-green-800 text-xl mr-2">Good</p>

            <span className="w-9 h-3 rounded-lg bg-green-800"></span>
            <span className="w-9 h-3 rounded-lg bg-green-800"></span>
            <span className="w-9 h-3 rounded-lg bg-green-800"></span>
            <span className="w-9 h-3 rounded-lg bg-green-800"></span>
            <span className="w-9 h-3 rounded-lg bg-neutral-300"></span>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden mt-6">
          <div ref={mapRef} style={{ width: "100%", height: "320px" }} />
        </div>
      </div>
      <WeatherForecast />
    </section>
  );
};
