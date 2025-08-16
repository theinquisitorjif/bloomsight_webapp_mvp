import { Check, Loader2 } from "lucide-react";
import WeatherForecast from "../weather/weather-forecast";
import { useSectionInView } from "@/hooks/use-section-in-view";
import type { WeatherForecastAPIResponse } from "@/types/weather-forecast";
import type { UseQueryResult } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export const BeachOverview = ({
  weatherForecastQuery,
}: {
  weatherForecastQuery: UseQueryResult<WeatherForecastAPIResponse[], Error>;
}) => {
  const { ref } = useSectionInView("overview", 0.5);

  const scores = {
    0: {
      label: "Very Bad",
      color: "bg-red-200",
      textColor: "text-red-300",
    },
    1: {
      label: "Bad",
      color: "bg-orange-200",
      textColor: "text-orange-300",
    },
    2: {
      label: "Good",
      color: "bg-green-200",
      text: "text-green-800",
    },
    3: {
      label: "Very Good",
      color: "bg-green-400",
      text: "text-green-800",
    },
    4: {
      label: "Excellent",
      color: "bg-green-600",
      text: "text-green-800",
    },
  };

  if (weatherForecastQuery.isPending)
    return <Loader2 className="animate-spin" />;

  if (!weatherForecastQuery.data) return null;

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
            <p
              className={cn(
                "font-semibold text-xl mr-2",
                scores[weatherForecastQuery.data[0].recommendation_score - 1]
                  .textColor
              )}
            >
              {
                scores[weatherForecastQuery.data[0].recommendation_score - 1]
                  .label
              }
            </p>
            {Array.from({
              length: weatherForecastQuery.data[0].recommendation_score,
            }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "w-9 h-3 rounded-lg",
                  scores[weatherForecastQuery.data[0].recommendation_score - 1]
                    .color
                )}
              ></span>
            ))}

            {Array.from({
              length: 5 - weatherForecastQuery.data[0].recommendation_score,
            }).map((_, i) => (
              <span
                key={i}
                className="w-9 h-3 rounded-lg bg-neutral-300"
              ></span>
            ))}
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
      <WeatherForecast weather={weatherForecastQuery.data} />
    </section>
  );
};
