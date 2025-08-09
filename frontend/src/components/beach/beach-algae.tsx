import { useSectionInView } from "@/hooks/use-section-in-view";
import { RiskDialChart } from "../risk-dial-chart";
import { SeverityBadge } from "../severity-badge";

export const BeachAlgae = () => {
  const { ref } = useSectionInView("algae", 0.5);

  return (
    <section ref={ref} id="algae">
      <h2 className="text-2xl font-semibold tracking-tight">Water Quality</h2>

      <div className="md:gap-6 grid grid-cols-1 md:grid-cols-3">
        <div className="mt-4 rounded-lg border border-border flex-1 p-4">
          <p className="text-sm text-muted-foreground">Current & Rip Tides</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-2">
              <RiskDialChart
                label="Current Tide"
                currentValue={2}
                lowestValue={0}
                highestValue={4}
              />
              <span className="text-sm text-muted-foreground">Risk Score</span>
            </div>

            <SeverityBadge severity="warning" />
          </div>
          <p className="mt-3 text-sm font-medium text-primary/80">
            Some risk present. Be aware of changing conditions.
          </p>
        </div>
        <div className="mt-4 rounded-lg border border-border flex-1 p-4">
          <p className="text-sm text-muted-foreground">Chlorophyll-a</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-2">
              <RiskDialChart
                label="Current Tide"
                currentValue={2}
                lowestValue={0}
                highestValue={4}
              />
              <span className="text-sm text-muted-foreground">Risk Score</span>
            </div>

            <SeverityBadge severity="moderate" />
          </div>
          <p className="mt-3 text-sm font-medium text-primary/80">
            Some risk present. Be aware of changing conditions.
          </p>
        </div>
        <div className="mt-4 rounded-lg border border-border flex-1 p-4">
          <p className="text-sm text-muted-foreground">Red Tide</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-2">
              <RiskDialChart
                label="Current Tide"
                currentValue={2}
                lowestValue={0}
                highestValue={4}
              />
              <span className="text-sm text-muted-foreground">Risk Score</span>
            </div>

            <SeverityBadge severity="moderate" className="" />
          </div>

          <p className="mt-3 text-sm font-medium text-primary/80">
            Some risk present. Be aware of changing conditions.
          </p>
        </div>
      </div>
    </section>
  );
};
