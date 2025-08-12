import { ScrollArea } from "../ui/scroll-area";
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import { Button } from "../ui/button";
import { useSectionInView } from "@/hooks/use-section-in-view";
import { SeverityBadge } from "../severity-badge";
import { reportsExamples } from "@/types/report";

export const BeachReports = () => {
  const { ref } = useSectionInView("parking", 0.5);

  return (
    <section ref={ref} id="reports">
      <h3 className="text-2xl font-semibold tracking-tight">
        Reports{" "}
        <span className="text-muted-foreground text-base ml-2 underline">
          last 7 days
        </span>
      </h3>

      <ScrollArea className="max-h-[400px] h-[400px] mt-4">
        <div className="flex flex-col gap-7">
          {reportsExamples.map((report) => (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <report.icon
                  size={50}
                  className="border border-border bg-neutral-100 p-3 rounded-full"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-primary/80">
                      {report.title}
                    </p>

                    <SeverityBadge severity={report.severity} />
                  </div>
                  <p>{report.description}</p>
                </div>
              </div>

              <div className="flex -space-x-3">
                <img
                  className="ring-background rounded-full ring-2"
                  src={createAvatar(lorelei, {
                    seed: "Aidan",
                  }).toDataUri()}
                  width={40}
                  height={40}
                  alt="Avatar 01"
                />
                <img
                  className="ring-background rounded-full ring-2"
                  src={createAvatar(lorelei, {
                    seed: "Aidan",
                  }).toDataUri()}
                  width={40}
                  height={40}
                  alt="Avatar 02"
                />
                <img
                  className="ring-background rounded-full ring-2"
                  src={createAvatar(lorelei, {
                    seed: "Aidan",
                  }).toDataUri()}
                  width={40}
                  height={40}
                  alt="Avatar 03"
                />
                <img
                  className="ring-background rounded-full ring-2"
                  src={createAvatar(lorelei, {
                    seed: "Aidan",
                  }).toDataUri()}
                  width={40}
                  height={40}
                  alt="Avatar 04"
                />
                <Button
                  variant="secondary"
                  className="bg-secondary text-muted-foreground ring-background hover:bg-secondary hover:text-foreground flex size-10 items-center justify-center rounded-full text-xs ring-2"
                  size="icon"
                >
                  +3
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
};
