import { test, expect, type Page } from '@playwright/test'

type Beacon = { n: string; d?: string; u?: string; p?: Record<string, string> }

// Intercept every analytics beacon (sendBeacon or fetch fallback) and record its
// parsed body, answering 202 so the app sees a successful send.
async function collect(page: Page): Promise<Beacon[]> {
  const events: Beacon[] = []
  await page.route('**/api/event', (route) => {
    events.push(JSON.parse(route.request().postData() || '{}'))
    return route.fulfill({ status: 202, body: '' })
  })
  return events
}

test('fires a pageview on load', async ({ page }) => {
  const events = await collect(page)
  await page.goto('/')
  await expect.poll(() => events.find((e) => e.n === 'pageview')?.d).toBe('example.com')
})

test('tracks a custom event on click', async ({ page }) => {
  const events = await collect(page)
  await page.goto('/')
  await page.click('#signup')
  await expect.poll(() => events.find((e) => e.n === 'Signup')?.p).toEqual({ plan: 'pro' })
})

test('tracks SPA navigation as a new pageview', async ({ page }) => {
  const events = await collect(page)
  await page.goto('/')
  // The Astro ClientRouter intercepts the link and navigates via history.pushState,
  // which core's SPA patch turns into a second pageview.
  await page.click('#nav')
  await page.waitForURL('**/about')
  await expect.poll(() => events.filter((e) => e.n === 'pageview').length).toBeGreaterThanOrEqual(2)
  // Settle: ensure no further (duplicate) pageviews trickle in for this single nav.
  await page.waitForTimeout(500)
  expect(events.filter((e) => e.n === 'pageview').length).toBe(2)
})
