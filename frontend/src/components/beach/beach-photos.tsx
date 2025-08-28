import { Button } from "../ui/button";
import { Image, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetPicturesByBeachID } from "@/api/beach";
import { Skeleton } from "../ui/skeleton";
import FullscreenImageCarousel from "../fullscreen-image-carousel";
import { useState } from "react";

export const BeachPhotos = ({
  beachId,
  name = "No Name",
}: {
  name: string;
  beachId: number | string;
}) => {
  const photosQuery = useGetPicturesByBeachID(beachId);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);

  if (photosQuery.isPending || !photosQuery.data) {
    return <Skeleton className="w-full h-[340px] rounded-lg" />;
  }

  if (!photosQuery.data[0]) {
    return (
      <div className="border border-border bg-neutral-100 rounded-lg w-full h-[340px] flex flex-col items-center justify-center">
        <ImageIcon />
        <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
        <p className="text-muted-foreground text-sm">No photos yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-4 h-[340px] relative bg-background shadow-sm rounded-lg">
      <img
        src={photosQuery.data[0].image_url}
        className={cn(
          "w-full h-[340px] rounded-lg object-cover",
          photosQuery.data.length > 2
            ? "md:rounded-l-lg md:rounded-r-none col-span-6 md:col-span-4"
            : photosQuery.data.length == 2
            ? " md:rounded-l-lg md:rounded-r-none col-span-6 md:col-span-3"
            : "col-span-6"
        )}
      />

      <div
        className={cn(
          "hidden md:flex col-span-2 h-[340px] flex-col gap-4",
          photosQuery.data.length > 2 ? "col-span-2" : "md:col-span-3"
        )}
      >
        {photosQuery.data[1] && photosQuery.data[2] ? (
          <>
            <img
              src={photosQuery.data[1].image_url}
              className="w-full object-cover rounded-tr-lg rounded-br-none rounded-l-none h-[calc(50%-8px)]"
            />

            <img
              src={photosQuery.data[2].image_url}
              className="w-full object-cover rounded-br-lg rounded-tr-none rounded-l-none h-[calc(50%-8px)]"
            />
          </>
        ) : photosQuery.data[1] ? (
          <img
            src={photosQuery.data[1].image_url}
            className="w-full object-cover rounded-r-lg rounded-l-none h-full"
          />
        ) : null}
      </div>

      <Button
        className="absolute bottom-4 left-4"
        variant="outline"
        onClick={() => setIsCarouselOpen(true)}
      >
        <Image /> {photosQuery.data.length}{" "}
        {photosQuery.data.length === 1 ? "photo" : "photos"}
      </Button>

      <FullscreenImageCarousel
        images={photosQuery.data.map((photo) => photo.image_url)}
        isCarouselOpen={isCarouselOpen}
        setIsCarouselOpen={setIsCarouselOpen}
      />
    </div>
  );
};
