import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SubdomainState {
  subdomain: string | null;
  isMainDomain: boolean;
}

const initialState: SubdomainState = {
  subdomain: null,
  isMainDomain: true,
};

const subdomainSlice = createSlice({
  name: 'subdomain',
  initialState,
  reducers: {
    setSubdomain: (state, action: PayloadAction<string | null>) => {
      state.subdomain = action.payload;
      state.isMainDomain = action.payload === null;
    },
    setIsMainDomain: (state, action: PayloadAction<boolean>) => {
      state.isMainDomain = action.payload;
    },
    initializeSubdomain: (state) => {
      if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        const parts = host.split('.');
        
        // Check if we're on localhost or IP address
        if (host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
          // For localhost, check if there's a subdomain (e.g., restaurant.localhost:3000)
          if (host.includes('localhost') && parts.length > 1) {
            const sub = parts[0];
            if (sub !== 'localhost' && sub !== 'www') {
              state.subdomain = sub;
              state.isMainDomain = false;
              return;
            }
          }
          state.subdomain = null;
          state.isMainDomain = true;
          return;
        }

        // Check if we have a subdomain
        if (parts.length > 2) {
          const sub = parts[0];
          if (sub !== 'www') {
            state.subdomain = sub;
            state.isMainDomain = false;
            return;
          }
        }
        
        state.subdomain = null;
        state.isMainDomain = true;
      }
    },
  },
});

export const { setSubdomain, setIsMainDomain, initializeSubdomain } = subdomainSlice.actions;
export default subdomainSlice.reducer; 