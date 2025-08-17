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
import { useGetWeatherForecastByBeachID } from "@/api/beach";

const ExampleBeach = {
  name: "Palm Beach",
  location: "Palm Beach, FL",
  lat: 26.7,
  lng: -80.1,
};

export const BeachPage = () => {
  const [activeSection, setActiveSection] = useState<string>("Overview");
  const [timeOfLastClick, setTimeOfLastClick] = useState(0); // Used to disable the observer temporarily when user clicks on a link

  const weatherForecastQuery = useGetWeatherForecastByBeachID(7);

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
            name={ExampleBeach.name}
            location={ExampleBeach.location}
            lat={ExampleBeach.lat}
            lng={ExampleBeach.lng}
          />
          <BeachNavigation />
          <BeachOverview weatherForecastQuery={weatherForecastQuery} />
          <Separator className="my-10" />
          <BeachConditions
            beachName={ExampleBeach.name}
            weatherForecastQuery={weatherForecastQuery}
          />
          <Separator className="my-10" />
          <BeachAlgae />
          <Separator className="my-10" />
          <BeachParking />
          <Separator className="my-10" />
          <BeachReports />
          <Separator className="my-10" />
          <BeachComments />
          <Separator className="my-10" />
          <BeachSafety />
          {/* <Separator className="my-10" />
          <BeachNearby /> */}
        </main>
      </div>
    </ActiveSectionContext.Provider>
  );
};
