import { Check } from "lucide-react";
import WeatherForecast from "../weather/weather-forecast";
import { useSectionInView } from "@/hooks/use-section-in-view";

export const BeachOverview = () => {
  const { ref } = useSectionInView("overview", 0.5);

  return (
    <section
      ref={ref}
      id="overview"
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10"
    >
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between">
          <h3 className="text-2xl font-semibold tracking-tight">Overview</h3>
        </div>
        <div className="p-2 rounded-lg border border-border mt-2">
          <p className="text-muted-foreground text-sm">Current Conditions</p>
          <div className="flex items-center gap-1">
            <p className="font-semibold text-green-800 text-xl mr-2">Good</p>

            <span className="w-9 h-3 rounded-lg bg-green-200"></span>
            <span className="w-9 h-3 rounded-lg bg-green-200"></span>
            <span className="w-9 h-3 rounded-lg bg-green-200"></span>
            <span className="w-9 h-3 rounded-lg bg-green-200"></span>
            <span className="w-9 h-3 rounded-lg bg-neutral-300"></span>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-border h-full mt-6 p-4 bg-background">
          <div className="flex items-center gap-2 border border-border text-green-800 bg-gradient-to-r from-green-100 to-blue-50 p-4 rounded-md">
            <p className="font-medium">Recommended visit</p>
            <Check size={16} />
          </div>
          <div className="mt-5">
            <div className="border-l-4 border-border pl-4">
              <p>Best Times</p>
              <p className="text-sm text-muted-foreground">
                Early Morning (7-10am) to Late Afternoon (4-7pm)
              </p>
            </div>
            <div className="mt-5 border-l-4 border-border pl-4">
              <p>What to bring</p>
              <p className="text-sm text-muted-foreground">
                Sunscreen (SPF 30+), umbrellas, plenty of water, and light rain
                jacket
              </p>
            </div>
            <div className="mt-5 border-l-4 border-border pl-4">
              <p>Activities</p>
              <p className="text-sm text-muted-foreground">
                Swimming, surfing, beach volleyball, and fishing
              </p>
            </div>
          </div>
        </div>
      </div>
      <WeatherForecast />
    </section>
  );
};
