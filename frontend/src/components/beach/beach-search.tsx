import { useGetBeaches } from "@/api/beach";
import { haversineDistanceMiles } from "@/lib/utils";
import type { BeachAPIResponse } from "@/types/beach";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const BeachSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userLat] = useState<number>(28.5383);
  const [userLng] = useState<number>(-81.3792);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); // or your navigation method

  const beaches = useGetBeaches();

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter beaches based on search query
  const getFilteredBeaches = () => {
    if (!beaches.data || !searchQuery.trim()) return [];

    return beaches.data
      .filter(
        (beach) =>
          beach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          beach.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          beach.state?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((beach) => {
        const lat = parseFloat(beach.location.split(",")[0]);
        const lng = parseFloat(beach.location.split(",")[1]);
        const distance = haversineDistanceMiles(lat, lng, userLat, userLng);
        return { ...beach, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // Show top 10 results
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.trim().length > 0);
  };

  const handleBeachSelect = (
    beach: BeachAPIResponse & { properties?: Record<string, string> }
  ) => {
    const beachId = beach.properties?.["@mapbox_id"] || beach.mapbox_id;
    navigate(`/beaches/${beachId}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const filteredBeaches = getFilteredBeaches();

  return (
    <div
      className="w-full min-w-xs md:min-w-md max-w-md relative"
      ref={searchRef}
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for beaches..."
          value={searchQuery}
          onChange={handleSearchInputChange}
          onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
          className="w-full pl-12 pr-12 py-4 text-lg border-2 border-blue-200 rounded-full focus:border-blue-500 focus:outline-none shadow-lg"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showSearchResults && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto mt-2">
          {filteredBeaches.length > 0 ? (
            <>
              {filteredBeaches.map((beach) => {
                const lat = parseFloat(beach.location.split(",")[0]);
                const lng = parseFloat(beach.location.split(",")[1]);
                const distance = Math.round(
                  haversineDistanceMiles(lat, lng, userLat, userLng)
                );

                return (
                  <div
                    key={beach.id}
                    onClick={() => handleBeachSelect(beach)}
                    className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <img
                      src={
                        beach.preview_picture ||
                        "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
                      }
                      alt={beach.name}
                      className="w-12 h-12 rounded-lg object-cover mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {beach.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {beach.city && beach.state
                          ? `${beach.city}, ${beach.state}`
                          : "Location"}{" "}
                        • {distance} mi away
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="p-3 border-t">
                <button
                  onClick={() => {
                    navigate(
                      `/beaches?search=${encodeURIComponent(searchQuery)}`
                    );
                    setShowSearchResults(false);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  See all results for "{searchQuery}"
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No beaches found matching "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BeachSearch;
