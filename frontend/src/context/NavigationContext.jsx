/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

const RECENT_DESTINATIONS = [
  { id: 1, name: 'Home', address: '123 Maple St, Springfield', time: '12 min' },
  { id: 2, name: 'Work', address: '456 Business Ave, Downtown', time: '25 min' },
  { id: 3, name: 'Grocery Store', address: '789 Market Rd, Uptown', time: '8 min' },
];

export const NavigationProvider = ({ children }) => {
  const [isRouting, setIsRouting] = useState(false);
  const [destination, setDestination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const startRouting = (dest) => {
    setDestination(dest);
    setIsRouting(true);
  };

  const cancelRouting = () => {
    setDestination(null);
    setIsRouting(false);
  };

  return (
    <NavigationContext.Provider value={{
      isRouting,
      destination,
      searchQuery,
      setSearchQuery,
      recentDestinations: RECENT_DESTINATIONS,
      startRouting,
      cancelRouting
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
