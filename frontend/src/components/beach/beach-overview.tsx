import WeatherForecast from "../weather/weather-forecast";
import { useSectionInView } from "@/hooks/use-section-in-view";
import type { WeatherForecastAPIResponse } from "@/types/weather-forecast";
import type { UseQueryResult } from "@tanstack/react-query";
import { BeachRecommendation } from "./beach-recommendation";
import WeatherForecastSkeleton from "../weather/weather-forecast-skeleton";
import { ConditionsScore } from "./conditions-score";
import { ConditionsScoreSkeleton } from "./conditions-score-skeleton";
import { BeachRecommendationSkeleton } from "./beach-recommendation-skeleton";

export const BeachOverview = ({
  weatherForecastQuery,
}: {
  weatherForecastQuery: UseQueryResult<WeatherForecastAPIResponse[], Error>;
}) => {
  const { ref } = useSectionInView("overview", 0.5);

  if (!weatherForecastQuery.isPending && !weatherForecastQuery.data)
    return (
      <div className="border border-border p-4 flex items-center justify-center rounded-lg">
        <p>Could not fetch weather forecast... </p>
      </div>
    );

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

        {weatherForecastQuery.isPending ? (
          <ConditionsScoreSkeleton />
        ) : (
          <ConditionsScore
            score={weatherForecastQuery.data[0].recommendation_score}
          />
        )}

        {weatherForecastQuery.isPending ? (
          <BeachRecommendationSkeleton />
        ) : (
          <BeachRecommendation
            score={weatherForecastQuery.data[0].recommendation_score}
          />
        )}
      </div>
      {weatherForecastQuery.isPending ? (
        <WeatherForecastSkeleton />
      ) : (
        <WeatherForecast weather={weatherForecastQuery.data} />
      )}
    </section>
  );
};
