import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages, { DEFAULT_LOCALE, getStoredLocale } from 'src/i18n'
import { registerI18n } from 'src/i18n/runtime'

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
  registerI18n(i18n)
})
