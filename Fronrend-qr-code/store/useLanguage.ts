import { useAppSelector, useAppDispatch } from './hooks';
import { setLanguage, toggleLanguage, initializeLanguage } from './languageSlice';

export const useLanguage = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.language);

  const setLanguageData = (language: 'ar' | 'en') => {
    dispatch(setLanguage(language));
  };

  const toggleLanguageData = () => {
    dispatch(toggleLanguage());
  };

  const initializeLanguageData = () => {
    dispatch(initializeLanguage());
  };

  return {
    ...language,
    setLanguage: setLanguageData,
    toggleLanguage: toggleLanguageData,
    initializeLanguage: initializeLanguageData,
  };
}; 