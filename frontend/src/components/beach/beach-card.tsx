import { Button } from "../ui/button";
import { Link } from "react-router-dom";

interface BeachCardProps {
  beachName: string;
  coords: [number, number];
  imgSrc: string | null;
  beachId: number | string;
  distance?: string;
}

const BeachCard: React.FC<BeachCardProps> = ({
  beachName,
  imgSrc,
  beachId,
  distance,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border">
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={beachName}
          className="w-full h-48 object-cover rounded-t-xl"
        />
      ) : (
        <img
          src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
          alt={beachName}
          className="w-full h-48 object-cover rounded-t-xl"
        />
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
