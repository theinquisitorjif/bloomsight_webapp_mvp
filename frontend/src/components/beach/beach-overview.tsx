import { Loader2 } from "lucide-react";
import WeatherForecast from "../weather/weather-forecast";
import { useSectionInView } from "@/hooks/use-section-in-view";
import type { WeatherForecastAPIResponse } from "@/types/weather-forecast";
import type { UseQueryResult } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { BeachRecommendation } from "./visit-recommendation";

export const BeachOverview = ({
  weatherForecastQuery,
}: {
  weatherForecastQuery: UseQueryResult<WeatherForecastAPIResponse[], Error>;
}) => {
  const { ref } = useSectionInView("overview", 0.5);

  const scores: {
    [key: number]: { label: string; color: string; textColor: string };
  } = {
    0: {
      label: "Bad",
      color: "bg-red-200",
      textColor: "text-red-300",
    },
    1: {
      label: "Poor",
      color: "bg-orange-200",
      textColor: "text-orange-300",
    },
    2: {
      label: "Okay",
      color: "bg-yellow-200",
      textColor: "text-yellow-400",
    },
    3: {
      label: "Good",
      color: "bg-blue-400",
      textColor: "text-blue-800",
    },
    4: {
      label: "Great",
      color: "bg-green-600",
      textColor: "text-green-800",
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

        <BeachRecommendation
          score={weatherForecastQuery.data[0].recommendation_score}
        />
      </div>
      <WeatherForecast weather={weatherForecastQuery.data} />
    </section>
  );
};
