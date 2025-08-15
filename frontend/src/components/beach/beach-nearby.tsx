import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { Skeleton } from "../ui/skeleton";

export const BeachNearby = () => {
  return (
    <section id="nearby">
      <h3 className="text-2xl font-semibold tracking-tight">Nearby Beaches</h3>
      <p>Explore other beaches near this one</p>

      <Carousel className="mt-4">
        <CarouselContent className="-ml-4">
          <CarouselItem className="pl-4 basis-1/4">
            <Skeleton className="aspect-square bg-neutral-300" />
          </CarouselItem>
          <CarouselItem className="pl-4 basis-1/4">
            <Skeleton className="aspect-square bg-neutral-300" />
          </CarouselItem>
          <CarouselItem className="pl-4 basis-1/4">
            <Skeleton className="aspect-square bg-neutral-300" />
          </CarouselItem>
          <CarouselItem className="pl-4 basis-1/4">
            <Skeleton className="aspect-square bg-neutral-300" />
          </CarouselItem>
        </CarouselContent>

        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
    </section>
  );
};
