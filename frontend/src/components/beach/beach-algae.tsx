import { useSectionInView } from "@/hooks/use-section-in-view";
import { RiskDialChart } from "../risk-dial-chart";
import { SeverityBadge } from "../severity-badge";
import {
  useGetRedtideRiskByBeachID,
  useGetRiptideRiskByBeachID,
} from "@/api/beach";
import { Loader2 } from "lucide-react";

export const BeachAlgae = ({ beachId }: { beachId: number | string }) => {
  const { ref } = useSectionInView("algae", 0.5);

  const riptideRiskQuery = useGetRiptideRiskByBeachID(beachId);
  const redtideRiskQuery = useGetRedtideRiskByBeachID(beachId);

  return (
    <section ref={ref} id="algae">
      <h3 className="text-2xl font-semibold tracking-tight">Water Quality</h3>

      <div className="md:gap-6 grid grid-cols-1 md:grid-cols-2">
        <div className="mt-4 rounded-lg border border-border flex-1 p-4 bg-background shadow-sm">
          <p className="text-sm text-muted-foreground">Current & Rip Tides</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-2">
              {riptideRiskQuery.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <RiskDialChart
                  label="Current Tide"
                  currentValue={riptideRiskQuery.data?.conditions.score ?? 0}
                  lowestValue={0}
                  highestValue={4}
                />
              )}
              <span className="text-sm text-muted-foreground">Risk Score</span>
            </div>

            {riptideRiskQuery.isPending ? (
              <Loader2 className="animate-spin" />
            ) : riptideRiskQuery.data &&
              riptideRiskQuery.data?.conditions.score >= 3 ? (
              <SeverityBadge severity={"warning"} />
            ) : null}
          </div>
          <p className="mt-3 text-sm font-medium text-primary/80">
            {riptideRiskQuery.isPending
              ? "Loading..."
              : riptideRiskQuery.data?.conditions.recommendation ??
                "Unknown conditions. Be aware of changing conditions."}
          </p>
        </div>
        {/* <div className="mt-4 rounded-lg border border-border flex-1 p-4">
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
        </div> */}
        <div className="mt-4 rounded-lg border border-border flex-1 p-4 bg-background shadow-sm">
          <p className="text-sm text-muted-foreground">Red Tide</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-2">
              {redtideRiskQuery.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <RiskDialChart
                  label="Current Tide"
                  currentValue={redtideRiskQuery.data?.karena_brevis_risk ?? 0}
                  lowestValue={0}
                  highestValue={4}
                />
              )}
              <span className="text-sm text-muted-foreground">Risk Score</span>
            </div>
          </div>

          <p className="mt-3 text-sm font-medium text-primary/80">
            {redtideRiskQuery.isPending
              ? "Loading..."
              : redtideRiskQuery.data?.abundance ??
                "Unknown conditions. Be aware of changing conditions."}
          </p>
        </div>
      </div>
    </section>
  );
};
