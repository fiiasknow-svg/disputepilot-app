import { expect, test } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3201";

test("get customers sidebar links navigate to expected pages", async ({ page }) => {
  const links = [
    ["Get Customers", "/get-customers/get-customers"],
    ["Start - Run - Grow", "/get-customers/start-run-grow"],
    ["Business Strategies", "/get-customers/business-strategies"],
  ] as const;

  for (const [label, path] of links) {
    await page.goto(`${BASE_URL}/get-customers`);
    await page.getByRole("link", { name: label, exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`${path.replace(/\//g, "\\/")}$`));
  }
});
