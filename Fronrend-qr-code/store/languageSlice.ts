import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Language = 'ar' | 'en';

interface LanguageState {
  language: Language;
  isRTL: boolean;
}

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('language') as Language) || 'ar';
  }
  return 'ar';
};

const initialState: LanguageState = {
  language: getInitialLanguage(),
  isRTL: getInitialLanguage() === 'ar',
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      state.isRTL = action.payload === 'ar';
      
      // Update localStorage when language changes
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', action.payload);
        // Update document direction
        document.documentElement.dir = state.isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = action.payload;
      }
    },
    toggleLanguage: (state) => {
      const newLanguage = state.language === 'ar' ? 'en' : 'ar';
      state.language = newLanguage;
      state.isRTL = newLanguage === 'ar';
      
      // Update localStorage when language changes
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', newLanguage);
        // Update document direction
        document.documentElement.dir = state.isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = newLanguage;
      }
    },
    initializeLanguage: (state) => {
      const language = getInitialLanguage();
      state.language = language;
      state.isRTL = language === 'ar';
      
      // Update document direction on initialization
      if (typeof window !== 'undefined') {
        document.documentElement.dir = state.isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
      }
    },
  },
});

export const { setLanguage, toggleLanguage, initializeLanguage } = languageSlice.actions;
export default languageSlice.reducer; 