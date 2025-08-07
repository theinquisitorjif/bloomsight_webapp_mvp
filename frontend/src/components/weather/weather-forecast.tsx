import {
  Cloud,
  CloudRain,
  CloudSun,
  Droplet,
  Droplets,
  Sun,
  Wind,
} from "lucide-react";
import { SimpleDayHeader } from "./day-header";
import { WeatherDetail } from "./weather-detail";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { BasicDetails } from "./basic-details";

export default function WeatherForecast() {
  const weatherDetails = [
    {
      icon: Sun,
      label: "UV Index",
      value: "4",
      valueClassName: "text-blue-500",
    },
    { icon: Droplet, label: "Humidity", value: "24%" },
    { icon: Wind, label: "Wind", value: "8mph" },
    { icon: Droplets, label: "Precipitation", value: "10%" },
  ];

  const upcomingDays = [
    { day: "Thursday", icon: CloudSun, temperature: 83, low: 69, high: 94 },
    { day: "Friday", icon: Sun, temperature: 83, low: 69, high: 94 },
    { day: "Saturday", icon: Cloud, temperature: 83, low: 69, high: 94 },
    { day: "Sunday", icon: CloudRain, temperature: 83, low: 69, high: 94 },
    { day: "Monday", icon: CloudSun, temperature: 83, low: 69, high: 94 },
    { day: "Tuesday", icon: Sun, temperature: 83, low: 69, high: 94 },
    { day: "Wednesday", icon: CloudSun, temperature: 83, low: 69, high: 94 },
  ];

  return (
    <section
      id="weather"
      className="rounded-lg border border-border flex-1 px-4 py-2 space-y-4"
    >
      <Accordion defaultValue="day-0" type="single" className="w-full">
        {upcomingDays.map((dayData, index) => (
          <AccordionItem key={dayData.day} value={`day-${index}`}>
            <AccordionTrigger className="hover:no-underline py-4">
              <SimpleDayHeader
                icon={dayData.icon}
                day={dayData.day}
                low={dayData.low}
                high={dayData.high}
              />
            </AccordionTrigger>
            <AccordionContent className="pt-0">
              <BasicDetails
                temperature={dayData.temperature}
                description="Partly Cloudy"
                sunrise="6:00 AM"
                sunset="7:32 PM"
                precipitation={12}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
