import BeachCard from '../components/beach/beach-card';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useGetBeaches } from '@/api/beach';
import { haversineDistanceMiles } from '@/lib/utils';
import { useNavigate } from 'react-router-dom'; // or your routing library
import type { BeachAPIResponse } from '@/types/beach';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userLocation, setUserLocation] = useState('your area');
  const [userLat, setUserLat] = useState<number>(28.5383);
  const [userLng, setUserLng] = useState<number>(-81.3792);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); // or your navigation method

  const beaches = useGetBeaches();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);

          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            setUserLocation(data.city || data.locality || 'your area');
          } catch (err) {
            console.error('Error fetching location name:', err);
          }
        },
        (err) => {
          console.warn('Geolocation failed, using default coords', err);
        }
      );
    }
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
    scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
  };

  const getSortedBeaches = () => {
    if (!Array.isArray(beaches.data) || beaches.data.length === 0) return [];

    return beaches.data
      .map((beach) => {
        const [lat, lng] = beach.location.split(",").map(parseFloat);
        const distance = haversineDistanceMiles(lat, lng, userLat, userLng);
        return { ...beach, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  };

  // Filter beaches based on search query
  const getFilteredBeaches = () => {
    if (!beaches.data || !searchQuery.trim()) return [];
    
    return beaches.data
      .filter(beach => 
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

  const handleBeachSelect = (beach: BeachAPIResponse & { 'properties'?: Record<string, string> }) => {
    const beachId = beach.properties?.['@mapbox_id'] || beach.mapbox_id;
    navigate(`/beaches/${beachId}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const sortedBeaches = getSortedBeaches();
  const filteredBeaches = getFilteredBeaches();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row items-center justify-center px-6 py-12 gap-12 max-w-6xl mx-auto">
        {/* Beach Video */}
        <div className="w-full lg:w-1/2">
          <video
            src="/BS_intro.mp4"
            autoPlay
            loop
            playsInline
            className="w-full h-full md:h-90 object-cover rounded-lg shadow-xl"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Right Side Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-8 text-center lg:text-left">
            Know Before You Go
          </h1>

          {/* Search Bar with Dropdown */}
          <div className="w-full max-w-md mb-6 relative" ref={searchRef}>
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
                      const distance = Math.round(haversineDistanceMiles(lat, lng, userLat, userLng));
                      
                      return (
                        <div
                          key={beach.id}
                          onClick={() => handleBeachSelect(beach)}
                          className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <img
                            src={beach.preview_picture || "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
                            alt={beach.name}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{beach.name}</h3>
                            <p className="text-sm text-gray-500">
                              {beach.city && beach.state ? `${beach.city}, ${beach.state}` : 'Location'} • {distance} mi away
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="p-3 border-t">
                      <button
                        onClick={() => {
                          navigate(`/beaches?search=${encodeURIComponent(searchQuery)}`);
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
        </div>
      </div>

      {/* Scrollable Beach Cards */}
      <div className="px-6 py-10 bg-blue-50">
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center pb-6">
            <span className="text-3xl text-gray-700">Beaches near </span>
            <a
              href="/beaches"
              className="text-3xl text-gray-700 underline hover:text-blue-600 transition-colors"
            >
              {userLocation}
            </a>
          </div>

          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-white p-3 rounded-full shadow-md hover:bg-gray-100 z-10"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <div
            ref={scrollRef}
            className="flex space-x-9 overflow-x-auto scroll-smooth scrollbar-hide px-6 py-4"
          >
            {beaches.isPending || sortedBeaches.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[250px] h-60 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"
                  />
                ))
              : sortedBeaches.map((beach) => {
                  const lat = parseFloat(beach.location.split(",")[0]);
                  const lng = parseFloat(beach.location.split(",")[1]);
                  return (
                    <div
                      className="w-[250px] flex-shrink-0 cursor-pointer"
                      key={beach.id}
                      onClick={() => handleBeachSelect(beach)}
                    >
                      <BeachCard
                        coords={[lng, lat]}
                        beachName={beach.name}
                        imgSrc={beach.preview_picture}
                        beachId={parseInt(beach.mapbox_id)}
                        distance={`${Math.round(haversineDistanceMiles(lat, lng, userLat, userLng))} mi`}
                      />
                    </div>
                  );
                })}

            <div className="w-[250px] flex-shrink-0 flex items-center justify-center bg-white rounded-xl shadow hover:shadow-xl">
              <a
                href="/beaches"
                className="text-lg font-medium text-gray-700 underline hover:text-blue-600"
              >
                Find More
              </a>
            </div>
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full bg-white p-3 rounded-full shadow-md hover:bg-gray-100 z-10"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
export { LandingPage };