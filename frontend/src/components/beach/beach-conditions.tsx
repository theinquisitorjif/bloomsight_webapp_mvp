import {
  Droplet,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  WindArrowDown,
} from "lucide-react";
import { useSectionInView } from "@/hooks/use-section-in-view";
import { SeverityBadge } from "../severity-badge";
import { TideChart } from "./tide-chart";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { useEffect, useState } from "react";
import { FaLocationArrow } from "react-icons/fa";

const windData = [
  { direction: "N", speed: 8 },
  { direction: "NE", speed: 12 },
  { direction: "E", speed: 5 },
  { direction: "SE", speed: 9 },
  { direction: "S", speed: 14 },
  { direction: "SW", speed: 10 },
  { direction: "W", speed: 6 },
  { direction: "NW", speed: 11 },
];

export const BeachConditions = () => {
  const { ref } = useSectionInView("conditions", 0.5);

  const [windDirection, setWindDirection] = useState(90);

  useEffect(() => {
    // Simulate direction change
    const interval = setInterval(() => {
      setWindDirection(Math.floor(Math.random() * 360));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} id="conditions">
      <h3 className="text-2xl font-semibold tracking-tight">
        Current Conditions
      </h3>
      <p>What to expect when visiting Carlsbad Beach</p>

      <div className="mt-4 relative rounded-lg border border-border flex-1 h-40 overflow-hidden">
        <TideChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mt-4">
        <div className="p-4 rounded-lg border lg:col-span-3 border-border h-40 bg-white">
          <div className="grid grid-cols-2 gap-3 h-full">
            <dl>
              <dt className="text-sm text-muted-foreground flex items-center gap-1">
                <Sun size={14} /> UV Index
              </dt>
              <dd className="text-xl font-medium flex items-center gap-2">
                6 <SeverityBadge severity="warning" />
              </dd>
            </dl>
            <dl>
              <dt className="text-sm text-muted-foreground flex items-center gap-1">
                <Droplets size={14} />
                Precipitation
              </dt>
              <dd className="text-xl font-medium">12%</dd>
            </dl>
            <dl>
              <dt className="text-sm text-muted-foreground flex items-center gap-1">
                <Droplet size={14} /> Humidity
              </dt>
              <dd className="text-xl font-medium">63%</dd>
            </dl>
            <dl>
              <dt className="text-sm text-muted-foreground flex items-center gap-1">
                <WindArrowDown size={14} /> Air Quality
              </dt>
              <dd className="text-xl font-medium">920</dd>
            </dl>
          </div>
        </div>
        <div className="rounded-lg flex gap-6 items-start lg:col-span-4 justify-between border border-border h-40 p-4">
          <div>
            <span className="flex items-center gap-1">
              <Wind size={14} />
              <p className="text-sm text-muted-foreground">Wind</p>
            </span>
            <p className="text-2xl font-medium">
              8<span className="text-lg font-normal">mph E</span>
            </p>
            <p className="text-lg font-medium">
              3-5
              <span className="font-normal text-sm text-muted-foreground">
                mph gusts
              </span>
            </p>
          </div>

          <div className="overflow-hidden relative rounded-lg h-full">
            <RadarChart
              cx={100}
              cy={70}
              outerRadius={45}
              width={200}
              height={200}
              data={windData}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="direction" fontSize={12} />
              <Radar
                name="Wind Speed"
                dataKey="speed"
                fill="#8884d8"
                fillOpacity={0}
              />
            </RadarChart>

            <FaLocationArrow
              size={20}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 text-primary/80 transition-transform duration-500"
              style={{ transform: `rotate(${windDirection}deg)` }}
            />
          </div>
        </div>
        <div className="rounded-lg border border-border lg:col-span-3 flex-1 h-40 p-4">
          <span className="flex items-center gap-1">
            <Thermometer size={14} />
            <p className="text-sm text-muted-foreground">Water Temperature</p>
          </span>
          <p className="text-2xl font-medium">
            23 <span className="text-base text-muted-foreground">°F</span>
          </p>

          <div className="flex items-center gap-2 mt-5">
            <p className="text-muted-foreground text-xs">33°</p>
            <div className="relative rounded-full flex-1 bg-gradient-to-r from-blue-200 to-red-300 h-1.5">
              <div className="bg-background w-fit h-fit p-[1px] absolute top-1/2 -translate-y-1/2 left-1/2">
                |
              </div>
            </div>
            <p className="text-muted-foreground text-xs">73°</p>
          </div>
        </div>
      </div>
    </section>
  );
};
