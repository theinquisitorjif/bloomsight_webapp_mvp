import { Area, AreaChart, ReferenceLine, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { type TidePredictionAPIResponse } from "@/types/tide-prediction";

const chartConfig = {
  height: {
    label: "Tide Height",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function TideChart({ data }: { data: TidePredictionAPIResponse }) {
  // Convert API times into a short display format
  const formattedChartData = data.tides.map((t) => {
    const date = new Date(t.time.replace(" ", "T")); // ensure it's valid ISO
    const hours = date.getHours();
    const ampm = hours >= 12 ? "pm" : "am";
    const displayHour = ((hours + 11) % 12) + 1; // 0 → 12, 13 → 1
    return {
      time: `${displayHour}${ampm}`,
      height: Number(t.height.toFixed(2)), // rounding for display
    };
  });

  // Reference markers for high/low tide
  const highTideIndex = formattedChartData.findIndex(
    (p) => p.time === formatTimeLabel(data.high_tide.time)
  );
  const lowTideIndex = formattedChartData.findIndex(
    (p) => p.time === formatTimeLabel(data.low_tide.time)
  );

  const now = new Date();
  const currentHours = now.getHours();
  const currentAmpm = currentHours >= 12 ? "pm" : "am";
  const currentDisplayHour = ((currentHours + 11) % 12) + 1;
  const currentTimeLabel = `${currentDisplayHour}${currentAmpm}`;

  if (!data.tides) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-muted-foreground">No tide data found</p>
      </div>
    );
  }

  return (
    <>
      <ChartContainer className="h-full w-full" config={chartConfig}>
        <AreaChart
          accessibilityLayer
          data={formattedChartData}
          margin={{
            top: 60,
            bottom: 10,
          }}
        >
          <XAxis
            dataKey="time"
            axisLine={false}
            tickMargin={8}
            tick={({ x, y, payload, index }) =>
              index % 2 === 0 ? (
                <text
                  x={x}
                  y={y + 15}
                  textAnchor="middle"
                  fill="#666"
                  fontSize={12}
                >
                  {payload.value}
                </text>
              ) : (
                <></>
              )
            }
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />

          <defs>
            <linearGradient id="tideColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="30%" stopColor="#b3efe6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area
            dataKey="height"
            type="monotone"
            fill="url(#tideColor)"
            fillOpacity={1}
            stroke="#60a5fa"
            strokeWidth={2}
          />

          {highTideIndex >= 0 && (
            <ReferenceLine
              x={formattedChartData[highTideIndex].time}
              stroke="black"
              strokeDasharray="3 3"
              label={
                <TwoLineLabel
                  time={formatTimeLabel(data.high_tide.time)}
                  height={data.high_tide.height}
                />
              }
            />
          )}

          {lowTideIndex >= 0 && (
            <ReferenceLine
              x={formattedChartData[lowTideIndex].time}
              stroke="gray"
              strokeDasharray="3 3"
              label={
                <TwoLineLabel
                  time={formatTimeLabel(data.low_tide.time)}
                  height={data.low_tide.height}
                />
              }
            />
          )}

          {/** Current time line */}
          <ReferenceLine x={currentTimeLabel} stroke="black" strokeWidth={1} />
        </AreaChart>
      </ChartContainer>

      <div className="absolute top-4 left-4 ">
        <p className="text-sm font-medium text-muted-foreground">Tide</p>
        <div className="flex items-center gap-2">
          <p className="text-xl font-semibold">
            {data.low_tide.height.toFixed(2)} ft
          </p>
        </div>
      </div>
    </>
  );
}

function formatTimeLabel(dateTime: string) {
  const date = new Date(dateTime.replace(" ", "T"));
  const hours = date.getHours();
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHour = ((hours + 11) % 12) + 1;
  return `${displayHour}${ampm}`;
}

const TwoLineLabel = ({ time, height }: { time: string; height: number }) => {
  return (
    <g>
      <text
        y={-24}
        textAnchor="middle"
        fontWeight="bold"
        fontSize={12}
        fill="black"
      >
        {time}
      </text>
      <text y={-10} textAnchor="middle" fontSize={11} fill="black">
        {height.toFixed(2)} ft
      </text>
    </g>
  );
};
