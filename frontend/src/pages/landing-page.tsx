import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState('your area');
  const [nearbyBeaches, setNearbyBeaches] = useState([
    { name: 'Loading...', description: 'Finding beaches near you', distance: '...' }
  ]);

  // Get user's location on component mount
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use reverse geocoding to get city name
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const city = data.city || data.locality || 'your area';
            setUserLocation(city);
            
            // Simulate nearby beaches based on location
            setNearbyBeaches([
              { name: 'Nearby Beach 1', description: 'Beautiful coastal area', distance: '10 miles away' },
              { name: 'Nearby Beach 2', description: 'Perfect for swimming', distance: '15 miles away' },
              { name: 'Nearby Beach 3', description: 'Great for surfing', distance: '20 miles away' },
              { name: 'Nearby Beach 4', description: 'Family-friendly spot', distance: '25 miles away' }
            ]);
          } catch (error) {
            console.error('Error getting city name:', error);
            setUserLocation('your area');
          }
        },
        (error) => {
          console.log('Location access denied');
          setUserLocation('your area');
          setNearbyBeaches([
            { name: 'Popular Beach 1', description: 'Great for families', distance: 'Distance varies' },
            { name: 'Popular Beach 2', description: 'Excellent surfing', distance: 'Distance varies' },
            { name: 'Popular Beach 3', description: 'Crystal clear water', distance: 'Distance varies' },
            { name: 'Popular Beach 4', description: 'Scenic coastline', distance: 'Distance varies' }
          ]);
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
          {/* Slogan */}
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