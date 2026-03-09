import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ptTranslations from './locales/pt.json'
import enTranslations from './locales/en.json'

const savedLanguage = localStorage.getItem('i18n_language') || 'pt'

i18n.use(initReactI18next).init({
  resources: {
    pt: {
      translation: ptTranslations,
    },
    en: {
      translation: enTranslations,
    },
  },
  lng: savedLanguage,
  fallbackLng: 'pt',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', lng => {
  localStorage.setItem('i18n_language', lng)
})

export default i18n
