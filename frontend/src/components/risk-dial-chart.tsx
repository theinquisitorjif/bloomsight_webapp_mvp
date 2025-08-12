"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

export function RiskDialChart({
  label,
  currentValue,
  lowestValue,
  highestValue,
}: {
  label: string;
  currentValue: number;
  lowestValue: number;
  highestValue: number;
}) {
  const range = highestValue - lowestValue;
  const normalizedValue =
    range > 0
      ? Math.min(Math.max(currentValue, lowestValue), highestValue) -
        lowestValue
      : 0;
  const percentage = (normalizedValue / range) * 100;

  let fillColor = "var(--color-green)";
  if (percentage > 66) fillColor = "var(--color-red)";
  else if (percentage > 33) fillColor = "var(--color-yellow)";

  const chartData = [{ name: label, value: percentage, fill: fillColor }];

  const chartConfig = {
    label: { label },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="aspect-square size-10">
      <RadialBarChart
        data={chartData}
        startAngle={90}
        endAngle={-270}
        innerRadius={17}
        outerRadius={26}
      >
        <RadialBar
          dataKey="value"
          cornerRadius={10}
          background={{ fill: "#eee" }}
          fill={fillColor}
        />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-xs font-semibold"
                    >
                      {currentValue}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}
