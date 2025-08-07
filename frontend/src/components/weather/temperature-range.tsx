export const TemperatureRange = ({
  low,
  high,
}: {
  low: number | string;
  high: number | string;
}) => (
  <div className="w-1/2 flex items-center gap-2">
    <p className="text-muted-foreground text-xs">{low}°</p>
    <div className="relative rounded-full flex-1 bg-gradient-to-l from-red-400 to-orange-200 h-1.5">
      <div className="bg-background w-fit h-fit p-[1px] absolute top-1/2 -translate-y-1/2 left-1/2">
        |
      </div>
    </div>
    <p className="text-muted-foreground text-xs">{high}°</p>
  </div>
);
