'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';

interface SubdomainContextType {
  subdomain: string | null;
  isMainDomain: boolean;
}

const SubdomainContext = createContext<SubdomainContextType>({
  subdomain: null,
  isMainDomain: true,
});

export const SubdomainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isMainDomain, setIsMainDomain] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const parts = host.split('.');
      
      // Check if we're on localhost or IP address
      if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
        setSubdomain(null);
        setIsMainDomain(true);
        return;
      }

      // Check if we have a subdomain
      if (parts.length > 2) {
        const sub = parts[0];
        if (sub !== 'www') {
          setSubdomain(sub);
          setIsMainDomain(false);
          return;
        }
      }
      
      setSubdomain(null);
      setIsMainDomain(true);
    }
  }, []);

  return (
    <SubdomainContext.Provider value={{ subdomain, isMainDomain }}>
      {children}
    </SubdomainContext.Provider>
  );
};

export const useSubdomain = () => useContext(SubdomainContext); 