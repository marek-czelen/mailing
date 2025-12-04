import { createI18n } from 'vue-i18n'
import pl from '../locales/pl.json'
import en from '../locales/en.json'

const messages = {
  pl,
  en
}

const savedLocale = localStorage.getItem('app_locale') || 'pl'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages
})

export default i18n
