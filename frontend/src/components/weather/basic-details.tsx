import { Droplets, Sunrise, Sunset } from "lucide-react";

export const BasicDetails = ({
  temperature,
  description,
  sunrise,
  sunset,
  precipitation,
}: {
  temperature: number | string;
  description: string;
  sunrise: string;
  sunset: string;
  precipitation: number;
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p>
          <span className="text-2xl font-semibold">{temperature}</span>
          <span className="text-muted-foreground text-xl ml-0.5">°F</span>
        </p>
        {description && <p>{description}</p>}
      </div>

      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1">
          <Sunrise size={14} className="text-muted-foreground" />
          <p className="text-muted-foreground text-xs">{sunrise}</p>
        </div>
        <div className="flex items-center gap-1">
          <Sunset size={14} className="text-muted-foreground" />
          <p className="text-muted-foreground text-xs">{sunset}</p>
        </div>
        <div className="flex items-center gap-1">
          <Droplets size={14} className="text-muted-foreground" />
          <p className="text-muted-foreground text-xs">{precipitation}%</p>
        </div>
      </div>
    </div>
  );
};
