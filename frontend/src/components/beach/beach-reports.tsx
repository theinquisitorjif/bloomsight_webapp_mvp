import { ScrollArea } from "../ui/scroll-area";
import { createAvatar } from "@dicebear/core";
import { initials } from "@dicebear/collection";
import { Button } from "../ui/button";
import { useSectionInView } from "@/hooks/use-section-in-view";
import { SeverityBadge } from "../severity-badge";
import { useGetBeachReportsByBeachID, useGetCommentReports } from "@/api/beach";
import { Loader2 } from "lucide-react";
import { ReportsIconMap, SeverityNumberToString } from "@/types/report";
import { cn } from "@/lib/utils";

export const BeachReports = ({ beachId }: { beachId: number }) => {
  const { ref } = useSectionInView("parking", 0.5);

  const reportTypes = useGetCommentReports();
  const beachReports = useGetBeachReportsByBeachID(beachId);

  if (reportTypes.isPending || beachReports.isPending) {
    return <Loader2 className="animate-spin" />;
  }

  if (!reportTypes.data || !beachReports.data)
    return (
      <div className="border border-border p-4 flex items-center justify-center rounded-lg">
        <p>Could not fetch reports... </p>
      </div>
    );

  if (beachReports.data.length === 0) {
    return (
      <h3 className="text-2xl font-semibold tracking-tight">
        No Reports{" "}
        <span className="text-muted-foreground text-base ml-2 underline">
          last 7 days
        </span>
      </h3>
    );
  }

  const reportCounts = reportTypes.data
    .map((report) => {
      const combinedReports = beachReports.data.filter(
        (r) => r.condition_id === report.id
      );

      if (combinedReports.length === 0) return null;

      return {
        report,
        count: combinedReports.length,
      };
    })
    .filter(Boolean);

  const reportContainerHeight =
    reportCounts.length < 2
      ? "max-h-[50px] h-[50px]"
      : reportCounts.length < 3
      ? "max-h-[120px] h-[120px]"
      : reportCounts.length < 4
      ? "max-h-[175px] h-[175px]"
      : "max-h-[330px] h-[330px]";

  return (
    <section ref={ref} id="reports">
      <h3 className="text-2xl font-semibold tracking-tight">
        Reports{" "}
        <span className="text-muted-foreground text-base ml-2 underline">
          last 7 days
        </span>
      </h3>

      <ScrollArea className={cn("mt-4", reportContainerHeight)}>
        <div className="flex flex-col gap-7">
          {reportTypes.data.map((report) => {
            const combinedReports = beachReports.data.filter(
              (r) => r.condition_id === report.id
            );

            if (combinedReports.length === 0) return null;

            const Icon = ReportsIconMap[report.icon_name];

            return (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Icon
                    size={50}
                    className="border border-border bg-neutral-100 p-3 rounded-full"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-primary/80">
                        {report.name}
                      </p>

                      <SeverityBadge
                        severity={
                          SeverityNumberToString[report.severity as 1 | 2 | 3]
                        }
                      />
                    </div>
                    <p>{report.description}</p>
                  </div>
                </div>

                <div className="flex -space-x-3">
                  {combinedReports.map((userReport, index) => {
                    if (index > 3) {
                      return null;
                    }
                    return (
                      <img
                        className="ring-background rounded-full ring-2 size-10"
                        src={
                          userReport.user.picture ||
                          createAvatar(initials, {
                            seed: userReport.user.name || "User",
                          }).toDataUri()
                        }
                        width={40}
                        height={40}
                        alt="Avatar 01"
                      />
                    );
                  })}
                  {combinedReports.length > 4 && (
                    <Button
                      variant="secondary"
                      className="bg-secondary text-muted-foreground ring-background hover:bg-secondary hover:text-foreground flex size-10 items-center justify-center rounded-full text-xs ring-2"
                      size="icon"
                    >
                      +{combinedReports.length - 4}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </section>
  );
};
