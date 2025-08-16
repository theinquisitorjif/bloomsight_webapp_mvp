import type { LucideIcon } from "lucide-react";
import { TemperatureRange } from "./temperature-range";

export const SimpleDayHeader = ({
  icon: Icon,
  day,
  current,
  low,
  high,
}: {
  icon: LucideIcon;
  day: string;
  current: string;
  low: string;
  high: string;
}) => (
  <div className="flex items-center justify-between w-full">
    <div className="flex items-center gap-2">
      <Icon size={18} />
      <p className="font-medium">{day}</p>
    </div>
    <TemperatureRange
      current={parseFloat(current)}
      low={parseFloat(low)}
      high={parseFloat(high)}
    />
  </div>
);
