import { test, expect } from "@playwright/test";

let errors;
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install({ time: new Date("2026-10-22T12:00:00+07:00") });
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
  await advanceTo(page, 0.35);
  await page.reload();
  await page.clock.runFor(50);
  await expect(canvas).toHaveAttribute("data-chapter", "forest");
  await expect(page.locator("#clock")).toHaveText("09:45");
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

test("progress, HUD clock, day/night, scenery and motivational quotes stay in sync", async ({
  page,
}) => {
  await begin(page);
  const canvas = page.locator("#journey-canvas");
  await expect(page.locator("#journey-clock")).toHaveText(
    await page.locator("#clock").textContent(),
  );
  await expect(page.locator("#focus-progress")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  const firstQuote = await page.locator("#focus-quote").textContent();
  await page.locator("#next-focus-quote").click();
  await expect(page.locator("#focus-quote")).not.toHaveText(firstQuote);
  await page.locator("#quote-mode").selectOption("funny");
  await expect(page.locator("#focus-quote")).toHaveText(
    "Làm 15 phút đi, rồi mình hoảng tiếp.",
  );
  await advanceTo(page, 61 / 900);
  await expect(page.locator("#focus-quote")).toContainText("final_final_v7");
  await advanceTo(page, 0.45);
  await expect(canvas).toHaveAttribute("data-daylight", "day");
  await expect(page.locator("#focus-progress")).toHaveAttribute(
    "aria-valuenow",
    "45",
  );
  await expect(page.locator("#journey-clock")).toHaveText(
    await page.locator("#clock").textContent(),
  );
  await page.locator("#journey-scenery").selectOption("coast");
  await page.clock.runFor(50);
  await expect(canvas).toHaveAttribute("data-scenery", "coast");
  await advanceTo(page, 0.75);
  await expect(canvas).toHaveAttribute("data-daylight", "day");
  await expect(page.locator("#daylight-label")).toHaveText("Ban ngày");
  await page.screenshot({
    path: "test-results/focus-night.png",
    fullPage: true,
  });
  await page.locator("#toggle-timer").click();
  const quote = await page.locator("#focus-quote").textContent();
  const clock = await page.locator("#journey-clock").textContent();
  await page.clock.fastForward(61000);
  await expect(page.locator("#focus-quote")).toHaveText(quote);
  await expect(page.locator("#journey-clock")).toHaveText(clock);
  await page.reload();
  await expect(page.locator("#quote-mode")).toHaveValue("funny");
  await expect(page.locator("#journey-scenery")).toHaveValue("coast");
  await page.locator("#toggle-timer").click();
  await advanceTo(page, 1);
  await expect(page.locator("#focus-progress")).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await expect(page.locator("#journey-clock")).toHaveText("00:00");
  await expect(canvas).toHaveAttribute("data-daylight", "day");
});

test("real-world sunset changes to night while focus is paused, including reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.setSystemTime(new Date("2026-10-22T18:59:50+07:00"));
  await begin(page);
  await page.locator("#toggle-timer").click();
  await page.clock.runFor(50);
  const canvas = page.locator("#journey-canvas");
  await expect(canvas).toHaveAttribute("data-daylight", "sunset");
  const clock = await page.locator("#clock").textContent();
  await page.clock.fastForward(15000);
  await page.clock.runFor(50);
  await expect(canvas).toHaveAttribute("data-daylight", "night");
  await expect(page.locator("#daylight-label")).toHaveText("Ban đêm");
  await expect(page.locator("#clock")).toHaveText(clock);
  await page.reload();
  await page.clock.runFor(50);
  await expect(canvas).toHaveAttribute("data-daylight", "night");
});

test("same instant uses each browser timezone, not UTC or server timezone", async ({
  browser,
}) => {
  for (const [timezoneId, phase] of [
    ["Asia/Bangkok", "night"],
    ["America/New_York", "day"],
  ]) {
    const context = await browser.newContext({ timezoneId });
    const page = await context.newPage();
    await page.clock.install({ time: new Date("2026-10-22T15:00:00Z") });
    await page.goto("http://127.0.0.1:5174");
    await page.locator("[data-tab=focus]").click();
    await page.clock.runFor(50);
    await expect(page.locator("#journey-canvas")).toHaveAttribute(
      "data-daylight",
      phase,
    );
    await context.close();
  }
});

test("automatic journey visits tunnels and ocean, with paused swimming and scenery overrides", async ({
  page,
}) => {
  await begin(page);
  const canvas = page.locator("#journey-canvas");
  await advanceTo(page, 0.43);
  await expect(canvas).toHaveAttribute("data-scenery", "cave");
  // Find the next low-ceiling passage based on the same world spacing.
  const target = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("deadline-run-v1")).focusSession;
    const elapsed = Date.now() - (s.endsAt - s.totalMs);
    const i = Math.ceil(((elapsed / 1000) * 66 - 350) / 580);
    return (((350 + i * 580) / 66) * 1000) / s.totalMs;
  });
  await advanceTo(page, target);
  await expect(canvas).toHaveAttribute("data-action", "duck");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/focus-cave.png",
    fullPage: true,
  });
  await advanceTo(page, 0.67);
  await expect(canvas).toHaveAttribute("data-scenery", "ocean");
  await expect(canvas).toHaveAttribute("data-action", "swim");
  await expect(page.locator("#journey-status")).toContainText("Đang bơi");
  await page.screenshot({
    path: "test-results/focus-ocean.png",
    fullPage: true,
  });
  await page.locator("#toggle-timer").click();
  await page.clock.runFor(50);
  const frozen = await canvas.evaluate((el) => el.toDataURL());
  await page.clock.fastForward(10000);
  expect(await canvas.evaluate((el) => el.toDataURL())).toBe(frozen);
  await page.locator("#journey-scenery").selectOption("cave");
  await page.clock.runFor(50);
  await expect(canvas).toHaveAttribute("data-scenery", "cave");
  await page.locator("#journey-scenery").selectOption("ocean");
  await page.reload();
  await page.clock.runFor(50);
  await expect(canvas).toHaveAttribute("data-scenery", "ocean");
  await expect(page.locator("#quote-mode")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
