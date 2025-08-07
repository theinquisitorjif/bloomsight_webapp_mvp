import type { LucideIcon } from "lucide-react";
import { TemperatureRange } from "./temperature-range";

export const SimpleDayHeader = ({
  icon: Icon,
  day,
  low,
  high,
}: {
  icon: LucideIcon;
  day: string;
  low: string | number;
  high: string | number;
}) => (
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center gap-2">
      <Icon size={18} />
      <p className="font-medium">{day}</p>
    </div>
    <TemperatureRange low={low} high={high} />
  </div>
);
