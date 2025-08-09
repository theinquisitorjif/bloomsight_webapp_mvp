import { Button } from "../ui/button";
import { Image } from "lucide-react";

export const BeachPhotos = () => {
  return (
    <div className="grid grid-cols-6 gap-4 h-[340px] relative">
      <img
        src="/beach-1.jpg"
        className="w-full h-[340px] rounded-lg md:rounded-l-lg md:rounded-r-none col-span-6 md:col-span-4"
      />

      <div className="hidden md:flex col-span-2 h-[340px] flex-col gap-4">
        <img
          src="/beach-2.jpg"
          className="w-full object-cover rounded-tr-lg rounded-br-none rounded-l-none h-[calc(50%-8px)]"
        />

        <img
          src="/beach-3.webp"
          className="w-full object-cover rounded-br-lg rounded-tr-none rounded-l-none h-[calc(50%-8px)]"
        />
      </div>

      <Button className="absolute bottom-4 left-4" variant="outline">
        <Image /> 132 photos
      </Button>
    </div>
  );
};
