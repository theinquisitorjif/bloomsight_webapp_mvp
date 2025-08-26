import { SimpleDayHeader } from "./day-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { BasicDetails } from "./basic-details";
import type { WeatherForecastAPIResponse } from "@/types/weather-forecast";
import { WeatherCode } from "@/types/weather-code";

export default function WeatherForecast({
  weather,
}: {
  weather: WeatherForecastAPIResponse[];
}) {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const today = new Date();
  const upcomingDays = [];

  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);
    const dayName = dayNames[nextDay.getDay()];
    upcomingDays.push(dayName);
  }

  const formatTime = (time: string) => {
    const date = new Date(time);

    const timeFormatted = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return timeFormatted;
  };

  return (
    <section
      id="weather"
      className="rounded-lg border border-border flex-1 px-4 py-2 space-y-4 bg-background shadow-sm"
    >
      <Accordion defaultValue="day-0" type="single" className="w-full">
        {upcomingDays.map((day, index) => (
          <AccordionItem key={day} value={`day-${index}`}>
            <AccordionTrigger className="hover:no-underline py-4">
              <SimpleDayHeader
                icon={WeatherCode[weather[index].weather_code].icon}
                day={day}
                current={weather[index].temp.toFixed(0)}
                low={weather[index].temp_min.toFixed(0)}
                high={weather[index].temp_max.toFixed(0)}
              />
            </AccordionTrigger>
            <AccordionContent className="pt-0">
              <BasicDetails
                temperature={weather[index].temp.toFixed(0)}
                description={WeatherCode[weather[index].weather_code].name}
                sunrise={formatTime(weather[index].sunrise)}
                sunset={formatTime(weather[index].sunset)}
                precipitation={weather[index].precipitation || 0}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
