import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState('your area');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyBeaches, setNearbyBeaches] = useState<
    { name: string; lat: number; long: number; description?: string; distance: string }[]
  >([{
    name: 'Loading...', description: 'Finding beaches near you', distance: '...',
    lat: 0,
    long: 0
  }]);

  const scrollRef = useRef<HTMLDivElement>(null);

  interface Beach {
    location: any;
    name: string;
    lat: number;
    long: number;
    description?: string;
  }

  // Haversine formula to calculate distance in miles
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 0.621371; // convert to miles
  };

  // Fetch beaches from Supabase
  const fetchBeachesFromDB = async (search = ''): Promise<Beach[]> => {
    let query = supabase.from('beaches').select('*');
    if (search) query = query.ilike('name', `%${search}%`);
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching beaches from DB:', error);
      return [];
    }
    return data as Beach[];
  };

  const getClosestBeaches = (
    userLat: number,
    userLng: number,
    beaches: Beach[],
    count = 10
  ) => {
    const beachesWithDistance = beaches.map((beach) => {
      // Parse the location string "lat,long"
      let lat = 0;
      let long = 0;
      if (beach.location) {
        const parts = beach.location.split(',');
        if (parts.length === 2) {
          lat = parseFloat(parts[0]);
          long = parseFloat(parts[1]);
        }
      }

      const distanceValue = !isNaN(lat) && !isNaN(long)
        ? getDistance(userLat, userLng, lat, long)
        : Number.MAX_VALUE;

      return {
        ...beach,
        distanceValue,
        lat,
        long,
      };
    });

    const sorted = beachesWithDistance.sort((a, b) => a.distanceValue - b.distanceValue);

    const closest = sorted.slice(0, count).map((beach) => ({
      name: beach.name,
      distance: beach.distanceValue === Number.MAX_VALUE ? 'Unknown' : `${beach.distanceValue.toFixed(2)} mi away`,
      lat: beach.lat,
      long: beach.long,
    }));

    return closest;
  };

  // Initial load: get user location and closest beaches
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });

          try {
            // Reverse geocode to get city name
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            setUserLocation(data.city || data.locality || 'your area');

            const allBeaches = await fetchBeachesFromDB();

            // Set the closest beaches
            setNearbyBeaches(getClosestBeaches(latitude, longitude, allBeaches));
          } catch (error) {
            console.error('Error fetching beaches or city:', error);
          }
        },
        async (error) => {
          console.error('Geolocation error:', error);
          setUserLocation('your area');

          const allBeaches = await fetchBeachesFromDB();
          console.log('Fallback beaches:', allBeaches);
          setNearbyBeaches(
            allBeaches
              .slice(0, 10)
              .map((b) => ({ ...b, distance: 'Distance varies', lat: Number(b.lat), long: Number(b.long) }))
          );
        }
      );
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
    scrollRef.current.scrollTo({
      left: scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  };

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
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for beaches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-blue-200 rounded-full focus:border-blue-500 focus:outline-none shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>


      <div className="px-6 py-10 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          {/* Beaches near current city */}
          <div className="text-center pb-10">
            <span className="text-3xl text-gray-700">Beaches near </span>
            <a
              href="/beaches"
              className="text-3xl text-gray-700 underline hover:text-blue-600 transition-colors"
            >
              {userLocation}
            </a>
          </div>

          <div className="relative flex items-center">
            {/* Left Arrow */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-white p-3 rounded-full shadow-md hover:bg-gray-100 z-10"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            {/* Scrollable Row */}
            <div
              ref={scrollRef}
              className="flex space-x-8 overflow-x-hidden scroll-smooth px-6 py-4"
            >
              {nearbyBeaches.map((beach, index) => (
                <div
                  key={index}
                  className="min-w-[250px] bg-white rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 flex-shrink-0"
                >
                  <img
                    alt={beach.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{beach.name}</h3>
                    <p className="text-blue-900 text-sm mt-2">{beach.distance}</p>
                  </div>
                </div>
              ))}
              {/* Extra "Find More" card */}
              <div className="min-w-[250px] bg-white rounded-xl flex items-center justify-center flex-shrink-0 hover:shadow-xl transition-shadow duration-300">
                <a
              href="/beaches"
              className="text-3xl text-gray-700 underline hover:text-blue-600 transition-colors"
            >
              Find more
            </a>
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full bg-white p-3 rounded-full shadow-md hover:bg-gray-100 z-10"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export { LandingPage };
export default LandingPage;
