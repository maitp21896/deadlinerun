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
const at = (h, m = 0, s = 0) => new Date(2026, 9, 22, h, m, s);
test("daylight follows local clock boundaries rather than focus progress", () => {
  for (const [h, m, phase] of [
    [0, 0, "night"],
    [4, 59, "night"],
    [5, 0, "dawn"],
    [6, 59, "dawn"],
    [7, 0, "day"],
    [16, 59, "day"],
    [17, 0, "sunset"],
    [18, 59, "sunset"],
    [19, 0, "night"],
    [23, 59, "night"],
  ])
    assert.equal(daylight(at(h, m)).phase, phase);
  assert.equal(daylight(at(22)).night, 1);
  assert.equal(daylight(at(12)).night, 0);
  assert.notEqual(
    daylight(at(18)).palette.sky,
    daylight(at(18, 1)).palette.sky,
  );
  assert.deepEqual(daylight(at(23, 59, 59)).palette, daylight(at(0)).palette);
  for (let h = 0; h < 24; h++)
    for (const hex of Object.values(daylight(at(h)).palette))
      assert.match(hex, /^#[0-9a-f]{6}$/);
});
