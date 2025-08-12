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
} from "lucide-react";

export type ReportType = {
  icon: LucideIcon;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
};

export const reportsExamples: ReportType[] = [
  {
    icon: Users,
    severity: "info",
    title: "Crowded",
    description: "There are a lot of people on the beach",
  },
  {
    icon: WindArrowDown,
    severity: "warning",
    title: "Poor Air Quality",
    description: "The air quality is not good",
  },
  {
    icon: Droplet,
    severity: "warning",
    title: "Water Quality Issues",
    description: "The water quality is not good and may be dangerous",
  },
  {
    icon: Leaf,
    severity: "critical",
    title: "Red Tide / Algal Bloom Signs",
    description: "There are critical levels of algal blooms",
  },
  {
    icon: Waves,
    severity: "warning",
    title: "High Surf / Dangerous Waves",
    description: "There are dangerous levels of surf",
  },
  {
    icon: Fish,
    severity: "warning",
    title: "Stinging Animals Present",
    description: "There are fishes that sting people",
  },
  {
    icon: Trash,
    severity: "info",
    title: "Trash / Litter Present",
    description: "Trash or litter is present on the beach",
  },

  {
    icon: Toilet,
    severity: "info",
    title: "Facilities Closed",
    description: "Facilities are closed",
  },
  {
    icon: StopCircle,
    severity: "warning",
    title: "Beach Access Blocked",
    description: "The beach is not publically accessible",
  },
  {
    icon: Dog,
    severity: "info",
    title: "Wildlife Sightings",
    description: "There have been sightings of wildlife",
  },
  {
    icon: Turtle,
    severity: "info",
    title: "Nesting Areas Active",
    description: "Nesting areas are active, do not approach",
  },
  {
    icon: Fish,
    severity: "critical",
    title: "Shark Sighting",
    description: "Sharks were sighted on the beach",
  },
  {
    icon: AlertTriangle,
    severity: "critical",
    title: "Dangerous Conditions",
    description: "Something is dangerous on the beach. Do not approach.",
  },
];
