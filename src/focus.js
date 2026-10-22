const MINUTE = 60_000;
export function newSession(minutes = 25, taskId = null) {
  const totalMs = minutes * MINUTE;
  return {
    status: "idle",
    totalMs,
    remainingMs: totalMs,
    endsAt: null,
    taskId,
  };
}
export function readSession(session, now = Date.now()) {
  const remainingMs =
    session.status === "running"
      ? Math.max(0, Math.min(session.totalMs, session.endsAt - now))
      : session.remainingMs;
  const elapsedMs = session.totalMs - remainingMs;
  const progress = elapsedMs / session.totalMs;
  const status = remainingMs === 0 ? "complete" : session.status;
  const chapter =
    progress >= 1
      ? "finish"
      : progress >= 0.9
        ? "boss"
        : progress >= 0.65
          ? "castle"
          : progress >= 0.3
            ? "forest"
            : "meadow";
  return {
    status,
    totalMs: session.totalMs,
    remainingMs,
    elapsedMs,
    progress,
    chapter,
    bossHealth: Math.max(0, Math.min(100, (1 - progress) * 1000)),
  };
}
export function resumeSession(session, now = Date.now()) {
  if (session.status === "running" || session.remainingMs <= 0) return false;
  session.endsAt = now + session.remainingMs;
  session.status = "running";
  return true;
}
export function pauseSession(session, now = Date.now()) {
  if (session.status !== "running") return false;
  session.remainingMs = readSession(session, now).remainingMs;
  session.endsAt = null;
  session.status = session.remainingMs === 0 ? "complete" : "paused";
  return true;
}
export function finishSession(session, now = Date.now()) {
  if (session.status !== "running" || readSession(session, now).remainingMs > 0)
    return false;
  session.status = "complete";
  session.remainingMs = 0;
  session.endsAt = null;
  return true;
}
export function restoreSession(value) {
  if (
    !value ||
    !["idle", "running", "paused", "complete"].includes(value.status) ||
    ![15, 25, 45].includes(value.totalMs / MINUTE) ||
    !Number.isFinite(value.remainingMs) ||
    value.remainingMs < 0 ||
    value.remainingMs > value.totalMs ||
    (value.status === "running" && !Number.isFinite(value.endsAt))
  )
    return newSession();
  return value;
}
export const chapterNames = {
  meadow: "Đồng cỏ khởi đầu",
  forest: "Khu rừng tập trung",
  castle: "Cổng thành deadline",
  boss: "Đối đầu Trì Hoãn",
  finish: "Về đích rồi!",
};
