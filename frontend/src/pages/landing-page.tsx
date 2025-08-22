import BeachCard from '../components/beach/beach-card';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetBeaches } from '@/api/beach';
import { haversineDistanceMiles } from '@/lib/utils';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState('your area');
  const [userLat, setUserLat] = useState<number>(28.5383);
  const [userLng, setUserLng] = useState<number>(-81.3792);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use the same hook as the Map component
  const beaches = useGetBeaches();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);

          // Reverse geocode to get city name
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

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
    scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
  };

  // Get sorted beaches by distance, exactly like in Map component
  const getSortedBeaches = () => {
    if (!beaches.data || beaches.data.length === 0) return [];
    
    return beaches.data
      .map((beach) => {
        const lat = parseFloat(beach.location.split(",")[0]);
        const lng = parseFloat(beach.location.split(",")[1]);
        const distance = haversineDistanceMiles(lat, lng, userLat, userLng);
        return { ...beach, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // closest 10
  };

  const sortedBeaches = getSortedBeaches();

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

          {/* Search Bar */}
          <div className="w-full max-w-md mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for beaches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-4 text-lg border-2 border-blue-200 rounded-full focus:border-blue-500 focus:outline-none shadow-lg"
              />
            </div>
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

            {/* "Find More" card */}
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

export { LandingPage};