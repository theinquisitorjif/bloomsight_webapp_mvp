import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface BeachCardProps {
  beachName: string;
  coords: [number, number];
}

interface BeachData {
  id: number;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

const BeachCard: React.FC<BeachCardProps> = ({ beachName, coords }) => {
  const [beachData, setBeachData] = useState<BeachData | null>(null);

  useEffect(() => {
    const fetchBeach = async () => {
      if (!beachName) return;

      const { data, error } = await supabase
        .from("beaches")
        .select("*")
        .ilike("name", beachName) // case-insensitive match
        .maybeSingle();

      if (error) {
        console.error("Error fetching beach:", error.message);
      } else {
        setBeachData(data);
      }
    };

    fetchBeach();
  }, [beachName]);

  return (
    <div className="p-4 rounded-2xl shadow-md bg-white border border-gray-200">
      <h2 className="text-xl font-bold">{beachName}</h2>
      <p className="text-sm text-gray-600">
        Coords: {coords[0]}, {coords[1]}
      </p>

      {beachData ? (
        <div className="mt-2">
          <p className="text-gray-800">{beachData.description ?? "No description available"}</p>
          <p className="text-xs text-gray-500">
            DB coords: {beachData.latitude}, {beachData.longitude}
          </p>
        </div>
      ) : (
        <p className="text-red-500 mt-2">Beach data not available</p>
      )}
    </div>
  );
};

export default BeachCard;
