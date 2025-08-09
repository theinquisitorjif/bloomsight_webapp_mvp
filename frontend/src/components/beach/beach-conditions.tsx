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

export const BeachConditions = () => {
  const { ref } = useSectionInView("conditions", 0.5);

  return (
    <section ref={ref} id="conditions">
      <h2 className="text-2xl font-semibold tracking-tight">
        Current Conditions
      </h2>
      <p>What to expect when visiting Carlsbad Beach</p>

      <div className="mt-4 rounded-lg border border-border flex-1 h-40 overflow-hidden">
        <img src="/tide.png" className="w-full h-full" />
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
            <img src="/wind.png" className="object-cover w-full h-full" />
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
        </div>
      </div>
    </section>
  );
};
