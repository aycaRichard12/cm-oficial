import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages, { DEFAULT_LOCALE, getStoredLocale } from 'src/i18n'

export default defineBoot(({ app }) => {
  const i18n = createI18n({
    legacy: false,
    locale: getStoredLocale(),
    fallbackLocale: DEFAULT_LOCALE,
    globalInjection: true,
    messages,
  })

  // Set i18n instance on app
  app.use(i18n)
})
