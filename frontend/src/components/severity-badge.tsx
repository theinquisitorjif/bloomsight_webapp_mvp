import { AlertTriangle, Info } from "lucide-react";
import { Badge } from "./ui/badge";
import clsx from "clsx";

export const SeverityBadge = ({
  severity,
  className,
}: {
  severity: "info" | "warning" | "critical" | "moderate" | "normal";
  className?: string;
}) => {
  const icons: Record<
    "info" | "warning" | "critical" | "moderate" | "normal",
    React.ReactNode
  > = {
    info: <Info />,
    warning: <AlertTriangle />,
    critical: <AlertTriangle />,
    moderate: <AlertTriangle />,
    normal: <Info />,
  };

  const colors: Record<
    "info" | "warning" | "critical" | "moderate" | "normal",
    string
  > = {
    info: "text-blue-600 bg-blue-100",
    warning: "text-orange-600 bg-orange-100",
    critical: "text-red-600 bg-red-100",
    moderate: "text-orange-600 bg-orange-100",
    normal: "text-blue-600 bg-blue-100",
  };

  return (
    <Badge
      className={clsx(
        "w-fit px-2 py-0.5 rounded-sm flex items-center gap-1",
        colors[severity],
        className
      )}
    >
      {icons[severity]}
      {severity}
    </Badge>
  );
};
