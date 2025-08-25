import BeachCard from '../components/beach/beach-card';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight} from 'lucide-react';
import { useGetBeaches } from '@/api/beach';
import { haversineDistanceMiles } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { BeachAPIResponse } from '@/types/beach';
import BeachSearch from '@/components/beach/beach-search';

const LandingPage = () => {
  const [userLocation, setUserLocation] = useState('your area');
  const [userLat, setUserLat] = useState<number>(28.5383);
  const [userLng, setUserLng] = useState<number>(-81.3792);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const handleBeachSelect = (beach: BeachAPIResponse & { 'properties'?: Record<string, string> }) => {
    const beachId = beach.properties?.['@mapbox_id'] || beach.mapbox_id;
    navigate(`/beaches/${beachId}`);
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

          {/* Search Bar with Dropdown */}
          <BeachSearch />
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
      
      {/* About Section */}
      <div className="bg-blue-100 py-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h5 className="text-3xl font-bold text-blue-900 mb-4">About BloomSight</h5>
          <p className="text-gray-700 leading-relaxed">
            BloomSight is your go-to source for beach information, focusing on red tide and harmful algae blooms (HABs). We provide up-to-the-minute data from scientific organizations like the FWC and NOAA, combined with real-time community reports. This dual-source approach ensures you have the most accurate information on beach conditions. Our location-aware search helps you quickly find beaches near you, so you're always informed before you go.
          </p>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 text-center">
            <div className="p-6 bg-gray-100 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Location-Based Search</h3>
              <p className="text-gray-700">
                Instantly find beaches near you with our location-aware search. The homepage shows you the closest beaches, and you can easily search for any other destination.
              </p>
            </div>
            <div className="p-6 bg-gray-100 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Community Insights</h3>
              <p className="text-gray-700">
                Join our community by sharing your on-the-ground observations. Your reports on conditions like respiratory irritation or fish kills help everyone stay informed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
export { LandingPage };