import { test, expect } from '@playwright/test'

const KEY = 'mistersofts-cm-theme'
const LOGIN = '/#/login'

async function backgroundColor(page) {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor)
}

test.describe('dark theme', () => {
  test('applies a stored dark preference without a light flash', async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, 'dark'), KEY)
    await page.goto(LOGIN, { waitUntil: 'domcontentloaded' })

    await expect(page.locator('body')).toHaveClass(/body--dark/)
    expect(await backgroundColor(page)).toBe('rgb(18, 18, 18)')
  })

  test('a stored light preference wins over a dark system', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.addInitScript((key) => localStorage.setItem(key, 'light'), KEY)
    await page.goto(LOGIN, { waitUntil: 'domcontentloaded' })

    await expect(page.locator('body')).not.toHaveClass(/body--dark/)
    expect(await backgroundColor(page)).toBe('rgb(238, 235, 226)')
  })

  test('follows a dark system when nothing is stored', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.addInitScript((key) => localStorage.removeItem(key), KEY)
    await page.goto(LOGIN, { waitUntil: 'domcontentloaded' })

    await expect(page.locator('body')).toHaveClass(/body--dark/)
  })

  test('prints light even when the app is dark', async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, 'dark'), KEY)
    await page.goto(LOGIN, { waitUntil: 'domcontentloaded' })
    await page.emulateMedia({ media: 'print' })

    expect(await backgroundColor(page)).toBe('rgb(255, 255, 255)')
  })
})
