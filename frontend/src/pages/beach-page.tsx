import { Separator } from "@/components/ui/separator";
import { BeachHeader } from "@/components/beach/beach-header";
import { BeachNavigation } from "@/components/beach/beach-navigation";
import { BeachOverview } from "@/components/beach/beach-overview";
// import { BeachBreadcrumb } from "@/components/beach/beach-breadcrumb";
import { BeachComments } from "@/components/beach/beach-comments";
import { BeachSafety } from "@/components/beach/beach-safety";
// import { BeachNearby } from "@/components/beach/beach-nearby";
import { BeachReports } from "@/components/beach/beach-reports";
import { BeachParking } from "@/components/beach/beach-parking";
import { BeachAlgae } from "@/components/beach/beach-algae";
import { BeachConditions } from "@/components/beach/beach-conditions";
import { useState } from "react";
import { ActiveSectionContext } from "@/hooks/use-section-in-view";
import {
  useGetBeachByBeachID,
  useGetWeatherForecastByBeachID,
} from "@/api/beach";
import { useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export const BeachPage = () => {
  const [activeSection, setActiveSection] = useState<string>("Overview");
  const [timeOfLastClick, setTimeOfLastClick] = useState(0); // Used to disable the observer temporarily when user clicks on a link

  const id = useLocation().pathname.split("/")[2];

  const weatherForecastQuery = useGetWeatherForecastByBeachID(id);
  const beachQuery = useGetBeachByBeachID(id);

  if (beachQuery.isPending) {
    return (
      <div className="flex flex-col items-center pt-10 pb-20">
        <main className="container p-2 xl:max-w-[1000px] space-y-4">
          <Skeleton className="w-full h-[340px] rounded-lg" />

          <Skeleton className="w-full h-10 rounded-lg" />

          <Skeleton className="w-full h-10 rounded-lg" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="w-full h-80 rounded-lg" />
            <Skeleton className="w-full h-80 rounded-lg" />
          </div>
        </main>
      </div>
    );
  } else if (!beachQuery.data || !beachQuery.data.location) {
    return <p>Beach not found</p>;
  }

  return (
    <ActiveSectionContext.Provider
      value={{
        activeSection,
        setActiveSection,
        timeOfLastClick,
        setTimeOfLastClick,
      }}
    >
      <div className="flex flex-col items-center pt-10 pb-20">
        <main className="container p-2 xl:max-w-[1000px] space-y-4">
          {/* <BeachBreadcrumb /> */}
          <BeachHeader
            name={beachQuery.data.name}
            location={"Florida, USA"}
            lat={parseFloat(beachQuery.data.location.split(",")[0])}
            lng={parseFloat(beachQuery.data.location.split(",")[1])}
            beachId={id}
          />
        </main>
        <BeachNavigation />
        <main className="container p-2 xl:max-w-[1000px] space-y-4">
          <BeachOverview weatherForecastQuery={weatherForecastQuery} />
          <Separator className="my-10" />
          <BeachConditions
            beachId={id}
            beachName={beachQuery.data.name}
            weatherForecastQuery={weatherForecastQuery}
          />
          <Separator className="my-10" />
          <BeachAlgae beachId={id} />
          <Separator className="my-10" />
          <BeachParking beachId={id} />
          <Separator className="my-10" />
          <BeachReports beachId={id} />
          <Separator className="my-10" />
          <BeachComments beachId={id} />
          <Separator className="my-10" />
          <BeachSafety />
          {/* <Separator className="my-10" />
          <BeachNearby /> */}
        </main>
      </div>
    </ActiveSectionContext.Provider>
  );
};
