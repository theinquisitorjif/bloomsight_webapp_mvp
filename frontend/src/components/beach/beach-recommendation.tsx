import { Check, AlertTriangle, Info } from "lucide-react";

interface RecommendationProps {
  score: number;
}

export function BeachRecommendation({ score }: RecommendationProps) {
  let title = "";
  let icon = null;
  let colorClasses = "";
  let bestTimes = "";
  let itemsToBring = "";
  let activities = "";

  if (score >= 4) {
    title = "Recommended visit";
    icon = <Check size={16} />;
    colorClasses = "text-green-800 bg-gradient-to-r from-green-100 to-blue-50";
    bestTimes = "Early Morning (7-10am) to Late Afternoon (4-7pm)";
    itemsToBring =
      "Sunscreen (SPF 30+), umbrellas, plenty of water, and light rain jacket";
    activities = "Swimming, surfing, beach volleyball, and fishing";
  } else if (score === 3) {
    title = "Could be okay";
    icon = <Info size={16} />;
    colorClasses =
      "text-yellow-800 bg-gradient-to-r from-yellow-100 to-orange-50";
    bestTimes = "Late Morning (9-12am) or Late Afternoon (3-6pm)";
    itemsToBring = "Sunscreen, water, hat, and light jacket";
    activities = "Walking, beachcombing, casual swimming";
  } else {
    title = "Not recommended";
    icon = <AlertTriangle size={16} />;
    colorClasses = "text-red-800 bg-gradient-to-r from-red-100 to-pink-50";
    bestTimes = "Avoid going";
    itemsToBring = "Minimal outdoor exposure, water, umbrella";
    activities = "None recommended";
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border h-full mt-6 p-4 bg-background shadow-sm">
      <div
        className={`flex items-center gap-2 border border-border p-4 rounded-md ${colorClasses}`}
      >
        <p className="font-medium">{title}</p>
        {icon}
      </div>
      <div className="mt-5">
        <div className="border-l-4 border-border pl-4">
          <p>Best Times</p>
          <p className="text-sm text-muted-foreground">{bestTimes}</p>
        </div>
        <div className="mt-5 border-l-4 border-border pl-4">
          <p>What to bring</p>
          <p className="text-sm text-muted-foreground">{itemsToBring}</p>
        </div>
        <div className="mt-5 border-l-4 border-border pl-4">
          <p>Activities</p>
          <p className="text-sm text-muted-foreground">{activities}</p>
        </div>
      </div>
    </div>
  );
}
