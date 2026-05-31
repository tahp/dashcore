/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

const RECENT_DESTINATIONS = [
  { id: 1, name: 'Home', address: '123 Maple St, Springfield', time: '12 min', distance: '4.2 mi' },
  { id: 2, name: 'Work', address: '456 Business Ave, Downtown', time: '25 min', distance: '12.8 mi' },
  { id: 3, name: 'Grocery Store', address: '789 Market Rd, Uptown', time: '8 min', distance: '2.1 mi' },
];

const POI_CATEGORIES = [
  { id: 'gas', name: 'Gas', icon: 'Fuel' },
  { id: 'food', name: 'Food', icon: 'Utensils' },
  { id: 'parking', name: 'Parking', icon: 'CircleParking' },
  { id: 'charging', name: 'Charging', icon: 'Zap' },
];

const MOCK_SEARCH_RESULTS = [
  { id: 101, name: 'Starbucks', address: '555 Coffee Ln, Springfield', distance: '0.8 mi', time: '3 min' },
  { id: 102, name: 'Shell Station', address: '200 Highway Dr, Springfield', distance: '1.5 mi', time: '5 min' },
  { id: 103, name: 'Central Park', address: '1 Park Blvd, Downtown', distance: '3.2 mi', time: '10 min' },
  { id: 104, name: 'City Hospital', address: '100 Medical Way, Uptown', distance: '4.8 mi', time: '15 min' },
  { id: 105, name: 'Whole Foods', address: '400 Organic St, Midtown', distance: '2.4 mi', time: '8 min' },
  { id: 106, name: 'Best Buy', address: '300 Tech Ave, Retail District', distance: '5.1 mi', time: '12 min' },
  { id: 107, name: 'Tesla Supercharger', address: '50 Energy Rd, Industrial Area', distance: '1.2 mi', time: '4 min' },
  { id: 108, name: 'Apple Store', address: '1 Infinite Loop, Cupertino', distance: '10.5 mi', time: '25 min' },
  { id: 109, name: 'McDonalds', address: '77 Golden Arches Way', distance: '1.1 mi', time: '4 min' },
];

export const NavigationProvider = ({ children }) => {
  const [isRouting, setIsRouting] = useState(false);
  const [destination, setDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('3D'); // 2D or 3D
  const [isMuted, setIsMuted] = useState(false);
  
  const searchResults = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length === 0) return [];
    
    return MOCK_SEARCH_RESULTS.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.address.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const startRouting = (dest) => {
    setDestination(dest);
    setIsRouting(true);
    setSearchQuery('');
  };

  const cancelRouting = () => {
    setDestination(null);
    setIsRouting(false);
  };

  const toggleViewMode = () => setViewMode(prev => prev === '2D' ? '3D' : '2D');
  const toggleMute = () => setIsMuted(prev => !prev);

  return (
    <NavigationContext.Provider value={{
      isRouting,
      destination,
      searchQuery,
      setSearchQuery,
      searchResults,
      recentDestinations: RECENT_DESTINATIONS,
      poiCategories: POI_CATEGORIES,
      viewMode,
      isMuted,
      startRouting,
      cancelRouting,
      toggleViewMode,
      toggleMute
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within a NavigationProvider');
  return context;
};
