import { cn } from "@/lib/utils";

export const ConditionsScore = ({ score }: { score: number }) => {
  const scores: {
    [key: number]: { label: string; color: string; textColor: string };
  } = {
    1: {
      label: "Bad",
      color: "bg-red-200",
      textColor: "text-red-300",
    },
    2: {
      label: "Poor",
      color: "bg-orange-200",
      textColor: "text-orange-300",
    },
    3: {
      label: "Okay",
      color: "bg-yellow-200",
      textColor: "text-yellow-400",
    },
    4: {
      label: "Good",
      color: "bg-blue-400",
      textColor: "text-blue-800",
    },
    5: {
      label: "Great",
      color: "bg-green-600",
      textColor: "text-green-800",
    },
  };

  return (
    <div className="p-2 rounded-lg border border-border mt-2 bg-background shadow-sm">
      <p className="text-muted-foreground text-sm">Current Conditions</p>
      <div className="flex items-center gap-1">
        <p
          className={cn("font-semibold text-xl mr-2", scores[score].textColor)}
        >
          {scores[score].label}
        </p>
        {Array.from({
          length: score,
        }).map((_, i) => (
          <span
            key={i}
            className={cn("w-9 h-3 rounded-lg", scores[score].color)}
          ></span>
        ))}

        {Array.from({
          length: 5 - score,
        }).map((_, i) => (
          <span key={i} className="w-9 h-3 rounded-lg bg-neutral-300"></span>
        ))}
      </div>
    </div>
  );
};
