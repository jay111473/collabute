import { useState, useEffect } from 'react';

const FLOATING_NAV_KEY = 'collabute-floating-navigation';

export const useFloatingNav = () => {
  const [isFloatingNavEnabled, setIsFloatingNavEnabled] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem(FLOATING_NAV_KEY);
    if (savedPreference !== null) {
      setIsFloatingNavEnabled(JSON.parse(savedPreference));
    }
  }, []);

  // Function to toggle the navigation preference
  const toggleFloatingNav = (enabled: boolean) => {
    setIsFloatingNavEnabled(enabled);
    localStorage.setItem(FLOATING_NAV_KEY, JSON.stringify(enabled));
  };

  return {
    isFloatingNavEnabled,
    toggleFloatingNav,
  };
}; 