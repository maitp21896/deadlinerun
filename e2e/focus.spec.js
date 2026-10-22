import { test, expect } from "@playwright/test";

let errors;
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install();
  await page.goto("/");
});
test.afterEach(() => expect(errors).toEqual([]));
async function begin(page) {
  await page.locator("[data-tab=focus]").click();
  await page.getByRole("button", { name: "15 phút", exact: true }).click();
  await page.locator("#toggle-timer").click();
  await page.clock.runFor(50);
}
async function advanceTo(page, progress) {
  const ms = await page.evaluate((p) => {
    const s = JSON.parse(localStorage.getItem("deadline-run-v1")).focusSession;
    return s.endsAt - s.totalMs + s.totalMs * p - Date.now();
  }, progress);
  if (ms > 0) await page.clock.fastForward(ms);
  await page.clock.runFor(50);
}

test("runner jumps and attacks automatically, freezes with pause and restores across reload", async ({
  page,
}) => {
  await begin(page);
  const canvas = page.locator("#journey-canvas");
  await expect(canvas).toHaveAttribute("data-action", "run");
  await advanceTo(page, 5.3 / 900);
  await expect(canvas).toHaveAttribute("data-action", "jump");
  await advanceTo(page, 22.9 / 900);
  await expect(canvas).toHaveAttribute("data-action", "attack");
  await page.locator("#toggle-timer").click();
  await page.clock.runFor(50);
  const frozen = await canvas.evaluate((el) => el.toDataURL());
  const time = await page.locator("#clock").textContent();
  await page.clock.fastForward(60000);
  await expect(page.locator("#clock")).toHaveText(time);
  expect(await canvas.evaluate((el) => el.toDataURL())).toBe(frozen);
  await page.reload();
  await expect(page.locator("#session-state")).toHaveText("Đang nghỉ một nhịp");
  await expect(page.locator("#clock")).toHaveText(time);
  await page.locator("#toggle-timer").click();
  await page.locator("[data-tab=quests]").click();
  await advanceTo(page, 0.4);
  await page.reload();
  await page.clock.runFor(50);
  await expect(canvas).toHaveAttribute("data-chapter", "forest");
  await expect(page.locator("#clock")).toHaveText("09:00");
  await page.locator("#reset-timer").click();
  await page.clock.runFor(50);
  await expect(canvas).toHaveAttribute("data-status", "idle");
  await expect(page.locator("#clock")).toHaveText("15:00");
});

test("boss follows timer; finishing is counted once and task rewards require confirmation", async ({
  page,
}) => {
  await page.locator("#add-task").click();
  await page.getByLabel("Bạn muốn làm gì?").fill("Viết phần mở đầu");
  await page.getByLabel("Deadline", { exact: true }).fill("2026-12-01T18:00");
  await page.getByRole("button", { name: "Thêm vào hành trình" }).click();
  await page.locator("[data-focus]").click();
  await page.getByRole("button", { name: "15 phút", exact: true }).click();
  await page.locator("#toggle-timer").click();
  await advanceTo(page, 0.94);
  await expect(page.locator("#journey-canvas")).toHaveAttribute(
    "data-action",
    "battle",
  );
  await expect(page.locator("#clock")).toHaveText("00:54");
  await page.screenshot({
    path: "test-results/focus-boss.png",
    fullPage: true,
  });
  await advanceTo(page, 1.01);
  await expect(page.locator("#journey-canvas")).toHaveAttribute(
    "data-action",
    "celebrate",
  );
  await expect(page.locator("#clock")).toHaveText("00:00");
  let s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("deadline-run-v1")),
  );
  expect(s.focusRuns).toBe(1);
  expect(s.coins).toBe(30);
  expect(s.tasks[0].done).toBe(false);
  await page.reload();
  await page.clock.fastForward(2000);
  s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("deadline-run-v1")),
  );
  expect(s.focusRuns).toBe(1);
  await page.locator("#complete-focus-task").click();
  s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("deadline-run-v1")),
  );
  expect(s.coins).toBe(50);
  expect(s.tasks[0].done).toBe(true);
  await page.locator("#toggle-timer").click();
  await page.clock.runFor(50);
  await expect(page.locator("#journey-canvas")).toHaveAttribute(
    "data-status",
    "running",
  );
  await expect(page.locator("#clock")).toHaveText("15:00");
});

test("finishing in the background preserves an ongoing reward spin", async ({
  page,
}) => {
  await begin(page);
  await advanceTo(page, 899 / 900);
  await page.locator("[data-tab=rewards]").click();
  await page.locator("#spin").click();
  await page.clock.fastForward(2200);
  await expect(page.locator("#open-bag")).toBeVisible();
  await page.locator("#open-bag").click();
  await page.locator("[data-use]").click();
  const s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("deadline-run-v1")),
  );
  expect(s.focusRuns).toBe(1);
  expect(s.coins).toBe(10);
  expect(s.tickets[0].used).toBe(true);
});

test("mobile focus has one start button, no gameplay input and no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await begin(page);
  await advanceTo(page, 5.3 / 900);
  await expect(page.locator("[data-control]")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/focus-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/focus-desktop.png",
    fullPage: true,
  });
});
