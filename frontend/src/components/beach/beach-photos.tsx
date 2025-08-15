import { Button } from "../ui/button";
import { Image, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { cn } from "@/lib/utils";

export const BeachPhotos = ({ name = "No Name" }: { name: string }) => {
  const photos: string[] = ["/beach-1.jpg", "/beach-2.jpg", "/beach-3.webp"];

  if (!photos[0]) {
    return (
      <div className="border border-border bg-neutral-100 rounded-lg w-full h-[340px] flex flex-col items-center justify-center">
        <ImageIcon />
        <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
        <p className="text-muted-foreground text-sm">No photos yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-4 h-[340px] relative">
      <img
        src={photos[0]}
        className={cn(
          "w-full h-[340px] rounded-lg",
          photos.length > 2
            ? "md:rounded-l-lg md:rounded-r-none col-span-6 md:col-span-4"
            : photos.length == 2
            ? " md:rounded-l-lg md:rounded-r-none col-span-6 md:col-span-3"
            : "col-span-6"
        )}
      />

      <div
        className={cn(
          "hidden md:flex col-span-2 h-[340px] flex-col gap-4",
          photos.length > 2 ? "col-span-2" : "md:col-span-3"
        )}
      >
        {photos[1] && photos[2] ? (
          <>
            <img
              src={photos[1]}
              className="w-full object-cover rounded-tr-lg rounded-br-none rounded-l-none h-[calc(50%-8px)]"
            />

            <img
              src={photos[2]}
              className="w-full object-cover rounded-br-lg rounded-tr-none rounded-l-none h-[calc(50%-8px)]"
            />
          </>
        ) : photos[1] ? (
          <img
            src={photos[1]}
            className="w-full object-cover rounded-r-lg rounded-l-none h-full"
          />
        ) : null}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="absolute bottom-4 left-4" variant="outline">
            <Image /> 132 photos
          </Button>
        </DialogTrigger>

        <DialogContent className="grid grid-cols-2 overflow-y-auto h-3/4 sm:max-w-7xl">
          <DialogTitle className="col-span-2">Beach photos</DialogTitle>
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
          <img
            src="/beach-1.jpg"
            className="w-full h-full object-cover rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
