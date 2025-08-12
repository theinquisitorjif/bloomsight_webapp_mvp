import { Area, AreaChart, ReferenceLine, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChevronUp } from "lucide-react";

const chartData = [
  { time: "", height: 1 },
  { time: "", height: 2 },
  { time: "3pm", height: 3 },
  { time: "", height: 3 },
  { time: "5pm", height: 3 },
  { time: "", height: 2 },
  { time: "7pm", height: 3 },
  { time: "", height: 4 },
  { time: "9pm", height: 3 },
  { time: "", height: 2 },
  { time: "11pm", height: 3 },
  { time: "", height: 2 },
  { time: "", height: 1 },
];

const chartConfig = {
  height: {
    label: "Tide Height",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function TideChart() {
  return (
    <>
      <ChartContainer className="h-full w-full" config={chartConfig}>
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{
            top: 60,
            bottom: 10,
          }}
        >
          <XAxis
            dataKey="time"
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 4)}
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

          <ReferenceLine x={3} stroke="black" strokeWidth={1} />

          <ReferenceLine
            x={7}
            stroke="gray"
            strokeWidth={1}
            label={<TwoLineLabel viewBox={{ x: 0, y: 0 }} />}
          />
        </AreaChart>
      </ChartContainer>

      <div className="absolute top-4 left-4 ">
        <p className="text-sm font-medium text-muted-foreground">Tide</p>
        <div className="flex items-center gap-2">
          <p className="text-xl font-semibold">3.8 ft</p>
          <ChevronUp />
        </div>
      </div>
    </>
  );
}

const TwoLineLabel = ({ viewBox }: { viewBox: { x: number; y: number } }) => {
  const { x, y } = viewBox;
  return (
    <g>
      {/* Top line (bold) */}
      <text
        x={x}
        y={y - 24} // adjust vertical position
        textAnchor="middle"
        fontWeight="bold"
        fontSize={12}
        fill="black"
      >
        8:00pm
      </text>

      {/* Bottom line (normal weight) */}
      <text
        x={x}
        y={y - 10} // adjust vertical position
        textAnchor="middle"
        fontSize={11}
        fill="black"
      >
        4.5ft
      </text>
    </g>
  );
};
