import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newSession,
  readSession,
  pauseSession,
  resumeSession,
  finishSession,
  restoreSession,
} from "../src/focus.js";
import { journeyPose } from "../src/journey.js";

test("pause/resume preserves fractional time and cannot progress while paused", () => {
  const s = newSession(15);
  resumeSession(s, 1000);
  assert.equal(readSession(s, 6300).remainingMs, 894700);
  pauseSession(s, 6300);
  assert.deepEqual(readSession(s, 100000), readSession(s, 6300));
  resumeSession(s, 100000);
  assert.equal(readSession(s, 100300).elapsedMs, 5600);
});
test("a restored background session completes once, even after its end time", () => {
  const s = newSession(15);
  resumeSession(s, 1000);
  const restored = restoreSession(JSON.parse(JSON.stringify(s)));
  assert.equal(readSession(restored, 901100).status, "complete");
  assert.equal(finishSession(restored, 901100), true);
  assert.equal(finishSession(restored, 902000), false);
  assert.equal(resumeSession(restored, 903000), false);
  assert.equal(readSession(restored).chapter, "finish");
});
test("all durations reach the boss at 90%, and victory only when time expires", () => {
  for (const minutes of [15, 25, 45]) {
    const s = newSession(minutes);
    resumeSession(s, 0);
    for (const [progress, chapter] of [
      [0, "meadow"],
      [0.2, "forest"],
      [0.4, "cave"],
      [0.6, "ocean"],
      [0.8, "castle"],
      [0.9, "boss"],
      [0.99, "boss"],
      [1, "finish"],
    ]) {
      const snap = readSession(s, s.totalMs * progress);
      assert.equal(snap.chapter, chapter);
      if (progress === 0.9) assert.ok(Math.abs(snap.bossHealth - 100) < 0.001);
      if (progress === 1) assert.equal(snap.bossHealth, 0);
    }
  }
});
test("runner automatically jumps and attacks using elapsed time, without input or frame history", () => {
  const s = newSession(15);
  resumeSession(s, 0);
  const firstJump = journeyPose(readSession(s, (350 / 66) * 1000));
  assert.equal(firstJump.action, "jump");
  assert.ok(firstJump.jump > 80);
  const gap = journeyPose(readSession(s, (930 / 66) * 1000));
  assert.equal(gap.action, "jump");
  assert.ok(gap.jump > 110);
  const encounter = readSession(s, (1510 / 66) * 1000);
  assert.equal(journeyPose(encounter).action, "attack");
  assert.deepEqual(journeyPose(encounter), journeyPose(encounter));
  assert.equal(journeyPose(readSession(s, s.totalMs * 0.95)).action, "battle");
  assert.equal(journeyPose(readSession(s, s.totalMs)).action, "celebrate");
});
test("invalid persisted timer data falls back to an idle session", () => {
  assert.deepEqual(
    restoreSession({
      status: "running",
      totalMs: 900000,
      remainingMs: 900000,
      endsAt: null,
    }),
    newSession(),
  );
  assert.deepEqual(
    restoreSession({ status: "running", totalMs: -1 }),
    newSession(),
  );
});

test("cave crouching and ocean swimming are automatic, reproducible and yield to the boss", () => {
  const s = newSession(15);
  resumeSession(s, 0);
  const cave = { ...readSession(s, (350 / 66) * 1000), scenery: "cave" };
  assert.equal(journeyPose(cave).action, "duck");
  assert.equal(journeyPose(cave).jump, 0);
  const ocean = { ...readSession(s, (350 / 66) * 1000), scenery: "ocean" };
  assert.equal(journeyPose(ocean).action, "swim");
  assert.equal(journeyPose(ocean).jump, 0);
  assert.deepEqual(journeyPose(ocean), journeyPose(ocean));
  assert.equal(
    journeyPose({ ...readSession(s, s.totalMs * 0.95), scenery: "ocean" })
      .action,
    "battle",
  );
  assert.equal(
    journeyPose({ ...readSession(s, s.totalMs), scenery: "ocean" }).action,
    "celebrate",
  );
});
