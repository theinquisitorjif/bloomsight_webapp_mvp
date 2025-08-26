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
import { FaLongArrowAltRight } from "react-icons/fa";
import type { UseQueryResult } from "@tanstack/react-query";
import type { WeatherForecastAPIResponse } from "@/types/weather-forecast";
import { useGetTidePredictionByBeachID } from "@/api/beach";
import { Skeleton } from "../ui/skeleton";

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

export const BeachConditions = ({
  beachId,
  beachName = "No Name",
  weatherForecastQuery,
}: {
  beachId: number;
  beachName: string;
  weatherForecastQuery: UseQueryResult<WeatherForecastAPIResponse[], Error>;
}) => {
  const { ref } = useSectionInView("conditions", 0.5);

  const tidePredictionQuery = useGetTidePredictionByBeachID(beachId);

  function degreesToDirection(deg: number): string {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    // Each direction covers 360/16 = 22.5 degrees
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  }

  if (!weatherForecastQuery.isPending && !weatherForecastQuery.data) {
    return null;
  }

  return (
    <section ref={ref} id="conditions">
      <h3 className="text-2xl font-semibold tracking-tight">
        Current Conditions
      </h3>
      <p>What to expect when visiting {beachName}</p>

      <div className="mt-4 relative rounded-lg border border-border flex-1 h-40 overflow-hidden bg-background shadow-sm">
        {tidePredictionQuery.data ? (
          <TideChart data={tidePredictionQuery.data} />
        ) : tidePredictionQuery.isPending ? (
          <Skeleton className="w-full h-62 rounded-lg" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No Tide Data</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mt-4">
        {weatherForecastQuery.isPending ? (
          <Skeleton className="rounded-lg lg:col-span-3 h-40" />
        ) : (
          <AtmosphereData
            uv_index={
              weatherForecastQuery.data?.[0]?.uv_index != null
                ? weatherForecastQuery.data[0].uv_index.toFixed(1)
                : "N/A"
            }
            precipitation={
              weatherForecastQuery.data?.[0]?.precipitation ?? "N/A"
            }
            humidity={weatherForecastQuery.data?.[0]?.humidity ?? "N/A"}
            air_quality={
              weatherForecastQuery.data?.[0]?.air_quality != null
                ? weatherForecastQuery.data[0].air_quality.toFixed(1)
                : "N/A"
            }
          />
        )}

        {weatherForecastQuery.isPending ? (
          <Skeleton className="rounded-lg lg:col-span-4 h-40" />
        ) : (
          <WindSpeeds
            wind_speeds={
              weatherForecastQuery.data?.[0]?.wind_speed != null
                ? (weatherForecastQuery.data[0].wind_speed * 2.23694).toFixed(1)
                : "N/A"
            }
            direction={
              weatherForecastQuery.data?.[0]?.wind_dir != null
                ? degreesToDirection(weatherForecastQuery.data[0].wind_dir)
                : "N/A"
            }
            degrees={weatherForecastQuery.data?.[0]?.wind_dir ?? 0}
            gust_speeds={
              weatherForecastQuery.data?.[0]?.gust_speed != null
                ? (weatherForecastQuery.data[0].gust_speed * 2.23694).toFixed(1)
                : "N/A"
            }
          />
        )}

        <div className="rounded-lg border border-border lg:col-span-3 flex-1 h-40 p-4 bg-background shadow-sm">
          <span className="flex items-center gap-1">
            <Thermometer size={14} />
            <p className="text-sm text-muted-foreground">Water Temperature</p>
          </span>
          <p className="text-2xl font-medium text-muted-foreground">
            Coming soon
          </p>
          {/* <p className="text-2xl font-medium">
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
          </div> */}
        </div>
      </div>
    </section>
  );
};

const AtmosphereData = ({
  uv_index,
  precipitation,
  humidity,
  air_quality,
}: {
  uv_index: string | number;
  precipitation: string | number;
  humidity: string | number;
  air_quality: string | number;
}) => {
  return (
    <div className="p-4 rounded-lg border lg:col-span-3 border-border h-40 bg-white bg-background shadow-sm">
      <div className="grid grid-cols-2 gap-3 h-full">
        <dl>
          <dt className="text-sm text-muted-foreground flex items-center gap-1">
            <Sun size={14} /> UV Index
          </dt>
          <dd className="text-xl font-medium flex items-center gap-2">
            {uv_index ?? "N/A"}
            <SeverityBadge severity="warning" />
          </dd>
        </dl>
        <dl>
          <dt className="text-sm text-muted-foreground flex items-center gap-1">
            <Droplets size={14} />
            Precipitation
          </dt>
          <dd className="text-xl font-medium">{precipitation ?? "N/A"}%</dd>
        </dl>
        <dl>
          <dt className="text-sm text-muted-foreground flex items-center gap-1">
            <Droplet size={14} /> Humidity
          </dt>
          <dd className="text-xl font-medium">{humidity ?? "N/A"}%</dd>
        </dl>
        <dl>
          <dt className="text-sm text-muted-foreground flex items-center gap-1">
            <WindArrowDown size={14} /> Air Quality
          </dt>
          <dd className="text-xl font-medium">{air_quality ?? "N/A"}</dd>
        </dl>
      </div>
    </div>
  );
};

const WindSpeeds = ({
  wind_speeds,
  gust_speeds,
  degrees,
  direction,
}: {
  wind_speeds: string | number;
  gust_speeds: string | number;
  degrees: string | number;
  direction: string | number;
}) => {
  return (
    <div className="rounded-lg flex gap-6 items-start lg:col-span-4 justify-between border border-border h-40 p-4 bg-background shadow-sm">
      <div>
        <span className="flex items-center gap-1">
          <Wind size={14} />
          <p className="text-sm text-muted-foreground">Wind</p>
        </span>
        <p className="text-2xl font-medium">
          {wind_speeds ?? "N/A"}
          <span className="text-lg font-normal">mph {direction ?? "N/A"}</span>
        </p>
        <p className="text-lg font-medium">
          {gust_speeds ?? "N/A"}
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

        <FaLongArrowAltRight
          size={20}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 text-primary/80 transition-transform duration-500"
          style={{
            transform: `rotate(-${degrees ?? 0}deg)`,
          }}
        />
      </div>
    </div>
  );
};
