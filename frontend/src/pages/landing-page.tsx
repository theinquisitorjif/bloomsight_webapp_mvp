import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import redTideData from '../../../fwc_redtide.json'; // Make sure this path is correct

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState('your area');
  const [nearbyBeaches, setNearbyBeaches] = useState([
    { name: 'Loading...', description: 'Finding beaches near you', distance: '...' }
  ]);

  interface Beach {
    name: string;
    lat: number;
    long: number;
    description?: string;
  }

  // Calculate distance between two points in miles
    const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    const distanceMi = distanceKm * 0.621371; // convert to miles
    return distanceMi;
    };


  // Get closest beaches
  const getClosestBeaches = (userLat: number, userLng: number, allBeaches: Beach[], count = 4) => {
    return allBeaches
      .map((beach) => ({
        ...beach,
        distanceValue: getDistance(userLat, userLng, beach.lat, beach.long)
      }))
      .sort((a, b) => a.distanceValue - b.distanceValue)
      .slice(0, count)
      .map((beach) => ({
        name: beach.name,
        description: beach.description || 'Beautiful coastal area',
        distance: `${beach.distanceValue.toFixed(1)} mi away`,
      }));
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Reverse geocode to get city name
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const city = data.city || data.locality || 'your area';
            setUserLocation(city);

            // Get closest 4 beaches
            const closestBeaches = getClosestBeaches(latitude, longitude, redTideData as Beach[]);
            setNearbyBeaches(closestBeaches);
          } catch (error) {
            console.error('Error getting city name or beaches:', error);
            setUserLocation('your area');
          }
        },
        (error) => {
          console.log('Location access denied');
          setUserLocation('your area');
          // Fallback: show any 4 beaches from redTideData
          const fallbackBeaches = (redTideData as Beach[]).slice(0, 4).map((beach) => ({
            name: beach.name,
            description: beach.description || 'Beautiful coastal area',
            distance: 'Distance varies',
          }));
          setNearbyBeaches(fallbackBeaches);
        }
      );
    }
  }, []);

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
            className="w-full h-full md:h-90 object-cover rounded-2xl shadow-xl"
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

      {/* Local Favorites Section */}
      <div className="px-6 py-10 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          {/* Beaches near current city */}
          <div className="text-center pb-10">
            <span className="text-3xl text-gray-700">Beaches near </span>
            <a href="/" className="text-3xl text-gray-700 underline hover:text-blue-600 transition-colors">
              {userLocation}
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyBeaches.map((beach, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <img
                  src={`https://images.unsplash.com/photo-${
                    ['1544551763-46a013bb70d5', '1559827260-dc66d52bef19', '1571019613454-1cb2f99b2d8b', '1506905925346-21bda4d32df4'][index]
                  }?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`}
                  alt={beach.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{beach.name}</h3>
                  <p className="text-gray-600 text-sm">{beach.description}</p>
                  <p className="text-blue-600 text-sm mt-2">{beach.distance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { LandingPage };
export default LandingPage;
