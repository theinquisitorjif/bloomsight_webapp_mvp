import { Car, MapPin, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { BeachPhotos } from "./beach-photos";

interface BeachHeaderProps {
  name: string;
  location: string;
  lat: number;
  lng: number;
}

export const BeachHeader = ({
  name = "No Name",
  location = "Unknown",
  lat,
  lng,
}: BeachHeaderProps) => {
  return (
    <section id="beach-header">
      <BeachPhotos name={name} />

      <div className="flex justify-between mt-4">
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold tracking-tight">
            {name}
          </h1>
          <div className="flex-col sm:flex-row flex sm:items-center gap-4">
            <div className="flex items-center gap-2">
              4.6
              <Star fill="black" size={18} />
              <Link to="#" className="underline underline-offset-2">
                336 reviews
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <p>{location}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start sm:items-center gap-4">
          {/* <Tooltip>
            <TooltipTrigger>
              <Button
                variant="outline"
                className="rounded-full size-14 cursor-pointer"
              >
                <Bookmark className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bookmark Beach</TooltipContent>
          </Tooltip> */}
          {/* <Tooltip>
            <TooltipTrigger>
              <Button
                variant="outline"
                className="rounded-full size-14 cursor-pointer"
              >
                <Share className="size-5" />
              </Button>
              <TooltipContent>Share Beach</TooltipContent>
            </TooltipTrigger>
          </Tooltip> */}
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className={!lat || !lng ? "pointer-events-none" : ""}
                aria-disabled={!lat || !lng}
              >
                <Button
                  variant="outline"
                  className="rounded-full size-14 cursor-pointer"
                  disabled={!lat || !lng}
                >
                  <Car className="size-5" />
                </Button>
              </a>
            </TooltipTrigger>
            <TooltipContent>
              {!lat || !lng ? "No Location" : "Get Directions"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </section>
  );
};
