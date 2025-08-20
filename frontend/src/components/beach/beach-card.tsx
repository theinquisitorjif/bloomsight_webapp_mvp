import { useGetPicturesByBeachID } from "@/api/beach";
import { Skeleton } from "../ui/skeleton";
import { ImageIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

interface BeachCardProps {
  beachName: string;
  coords: [number, number];
  beachId: number;
  distance?: string;
}

const BeachCard: React.FC<BeachCardProps> = ({
  beachName,
  beachId,
  distance,
}) => {
  const picturesQuery = useGetPicturesByBeachID(beachId);

  let imgSrc = "";
  if (picturesQuery.data?.length) {
    imgSrc = picturesQuery.data[0].image_url;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border">
      {picturesQuery.isPending ? (
        <Skeleton className="w-full h-48"/>
      ) : imgSrc ? (
        <img
          src={imgSrc}
          alt={beachName}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center gap-2 bg-neutral-100">
          <ImageIcon />
          <p className="text-muted-foreground text-sm">No photos yet</p>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2">{beachName}</h3>
        <p className="text-blue-900 text-sm mt-2">{distance}</p>
      </div>

      <div className="px-4 pb-4">
        <Link to={`/beaches/${beachId}`} onClick={(e) => e.stopPropagation()}>
          <Button variant="brand" className="rounded-full w-full">
            View
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BeachCard;
