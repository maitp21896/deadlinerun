import { test } from "node:test";
import assert from "node:assert/strict";
import { officeActivity } from "../src/office.js";
import {
  newSession,
  readSession,
  resumeSession,
  pauseSession,
} from "../src/focus.js";
test("office coworkers share the session clock and pause instead of starting another timer", () => {
  const session = newSession(15);
  assert.equal(officeActivity(readSession(session, 0)).status, "ready");
  resumeSession(session, 1000);
  assert.equal(officeActivity(readSession(session, 6000)).seconds, 5);
  assert.equal(officeActivity(readSession(session, 6000)).working, true);
  pauseSession(session, 6000);
  assert.deepEqual(
    officeActivity(readSession(session, 6000)),
    officeActivity(readSession(session, 60000)),
  );
  assert.equal(officeActivity(readSession(session, 6000)).working, false);
  resumeSession(session, 100000);
  assert.equal(officeActivity(readSession(session, 1000000)).status, "break");
});
