import { test } from "node:test";
import assert from "node:assert/strict";
import { focusQuote, daylight } from "../src/motivation.js";
test("quotes rotate by focused minutes and manual offset, with separate opt-in push pool", () => {
  assert.equal(focusQuote("cute", 0), focusQuote("cute", 59999));
  assert.notEqual(focusQuote("cute", 0), focusQuote("cute", 60000));
  assert.equal(focusQuote("cute", 60000), focusQuote("cute", 0, 1));
  assert.notEqual(focusQuote("push", 0), focusQuote("mixed", 0));
  assert.match(focusQuote("push", 1, 0, "complete"), /nghỉ một chút/);
});
test("daylight blends continuously and returns to dawn at completion", () => {
  assert.equal(daylight(0).phase, "day");
  assert.equal(daylight(0.45).phase, "sunset");
  assert.equal(daylight(0.75).phase, "night");
  assert.equal(daylight(1).phase, "dawn");
  assert.equal(daylight(0.75).night, 1);
  assert.notEqual(daylight(0.4).palette.sky, daylight(0.41).palette.sky);
  assert.equal(daylight(0.75).palette.sky, "#1f304b");
  for (const p of [0, 0.3, 0.45, 0.6, 0.75, 0.9, 1])
    for (const hex of Object.values(daylight(p).palette))
      assert.match(hex, /^#[0-9a-f]{6}$/);
});
