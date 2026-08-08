import { expect, test, type Page, type TestInfo } from '@playwright/test'

const password = 'password123'

function dateMonthsAgo(months: number): string {
  const date = new Date()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() - months)

  return date.toISOString().slice(0, 10)
}

async function register(page: Page, testInfo: TestInfo): Promise<string> {
  const name = `E2E Investor ${testInfo.workerIndex}`
  const email = `e2e-${Date.now()}-${testInfo.workerIndex}@example.test`

  await page.goto('/register')
  await page.getByLabel('Name').fill(name)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page).toHaveURL(/\/investments$/)
  await expect(page.getByText(name, { exact: true })).toBeVisible()

  return name
}

async function createSixMonthInvestment(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'New' }).click()
  await expect(page.getByRole('heading', { name: 'Create Investment' })).toBeVisible()

  await page.getByLabel('Date').fill(dateMonthsAgo(6))
  await page.getByLabel('Amount (BRL)').fill('1000.00')
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page).toHaveURL(/\/investments\/\d+$/)
  await expect(page.getByText('R$ 1.031,61', { exact: true })).toBeVisible()
}

test('registers and creates an investment with its compounded balance', async ({ page }, testInfo) => {
  const owner = await register(page, testInfo)

  await createSixMonthInvestment(page)

  await expect(page.getByRole('main').getByText(owner, { exact: true })).toBeVisible()
  await expect(page.getByText('R$ 1.000,00', { exact: true })).toBeVisible()
  await expect(page.getByText('+R$ 31,61', { exact: true })).toBeVisible()
})

test('previews taxes and completes a full withdrawal', async ({ page }, testInfo) => {
  await register(page, testInfo)
  await createSixMonthInvestment(page)

  await page.getByRole('button', { name: 'Withdraw investment' }).click()
  const dialog = page.getByRole('dialog', { name: 'Withdrawn Investment' })

  await expect(dialog.getByText('Tax (22.5%)', { exact: true })).toBeVisible()
  await expect(dialog.getByText('-R$ 7,11', { exact: true })).toBeVisible()
  await expect(dialog.getByText('R$ 1.024,50', { exact: true })).toBeVisible()

  await dialog.getByRole('button', { name: 'Save' }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByText('Withdrawn', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Withdrawal settlement' })).toBeVisible()
  await expect(page.getByText('R$ 1.024,50', { exact: true })).toBeVisible()
})
