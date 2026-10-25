import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en, psRTL } from '@neatly/i18n';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'ps-RTL': { translation: psRTL },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
