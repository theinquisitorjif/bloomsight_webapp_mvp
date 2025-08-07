import type { LucideIcon } from "lucide-react";

export const WeatherDetail = ({
  icon: Icon,
  label,
  value,
  valueClassName = "",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  valueClassName?: string;
}) => (
  <dl className="flex justify-between items-center">
    <dt className="flex items-center gap-1">
      <Icon size={14} /> {label}
    </dt>
    <dd className={`text-xs font-semibold ${valueClassName}`}>{value}</dd>
  </dl>
);
