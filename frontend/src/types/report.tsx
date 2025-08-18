import {
  AlertTriangle,
  Dog,
  Droplet,
  Fish,
  Leaf,
  StopCircle,
  Toilet,
  Trash,
  Turtle,
  Users,
  Waves,
  WindArrowDown,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { JSX } from "react";

export type ReportType = {
  icon: LucideIcon;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
};

type IconProps = LucideProps & { className?: string };

export const ReportsIconMap: Record<string, (props: IconProps) => JSX.Element> =
  {
    "alert-triangle": (props) => <AlertTriangle {...props} />,
    dog: (props) => <Dog {...props} />,
    droplet: (props) => <Droplet {...props} />,
    fish: (props) => <Fish {...props} />,
    leaf: (props) => <Leaf {...props} />,
    "stop-circle": (props) => <StopCircle {...props} />,
    toilet: (props) => <Toilet {...props} />,
    trash: (props) => <Trash {...props} />,
    turtle: (props) => <Turtle {...props} />,
    users: (props) => <Users {...props} />,
    waves: (props) => <Waves {...props} />,
    "wind-arrow-down": (props) => <WindArrowDown {...props} />,
  };

export interface ReportAPIResponse {
  id: number;
  created_at: string;
  icon_name: string;
  severity: number;
  threshold: string;
  type: number;
  description: string;
  name: string;
}

export const SeverityNumberToString = {
  1: "info",
  2: "warning",
  3: "critical",
} as const;

export interface BeachReportsAPIResponse {
  beach_id: string;
  comment_id: number;
  condition_id: number;
  created_at: string;
  id: number;
  user: {
    email: string;
    id: string;
    name: string;
    picture: string | null;
  };
}
