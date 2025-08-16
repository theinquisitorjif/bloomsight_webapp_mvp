import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Skeleton } from "../ui/skeleton";

/**
 * Renders a skeleton loader for the WeatherForecast component.
 *
 * This component is used to display a loading state while the data is being fetched from the API.
 * It renders an Accordion with 7 AccordionItems, each containing a Skeleton component to represent
 * the weather forecast for a specific day. The Skeleton components are styled to match the design of
 * the WeatherForecast component.
 *
 * @returns {JSX.Element} The WeatherForecastSkeleton component.
 */
export default function WeatherForecastSkeleton() {
  return (
    <section
      id="weather"
      className="rounded-lg border border-border flex-1 px-4 py-2 space-y-4"
    >
      <Accordion defaultValue="day-0" type="single" className="w-full">
        {Array.from({ length: 7 }).map((_, index) => (
          <AccordionItem key={index} value={`day-${index}`}>
            <AccordionTrigger className="hover:no-underline py-4">
              <Skeleton className="w-full h-5 rounded-lg" />
            </AccordionTrigger>
            <AccordionContent className="pt-0">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="w-full h-10 rounded-lg" />
                  <Skeleton className="w-full h-4 rounded-lg" />
                </div>

                <div className="flex flex-col gap-1">
                  <Skeleton className="w-32 h-4 rounded-lg" />
                  <Skeleton className="w-32 h-4 rounded-lg" />
                  <Skeleton className="w-32 h-4 rounded-lg" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
