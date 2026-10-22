import { daylight, quoteModes, focusQuote } from "./motivation.js";
let focusQuoteOffset = 0;
import "./style.css";
import {
  newSession,
  readSession,
  resumeSession,
  pauseSession,
  finishSession,
  restoreSession,
  chapterNames,
} from "./focus.js";
import { startJourney } from "./journey.js";
let stopJourney = null;
import { defaults, completeTask, pickReward } from "./model.js";
let state;
try {
  state = JSON.parse(localStorage.getItem("deadline-run-v1"));
} catch {}
if (!state?.rewards?.length) state = defaults();
state.focusSession = restoreSession(state.focusSession);
let tab = state.focusSession.status === "idle" ? "quests" : "focus",
  filter = "all",
  spinning = false,
  focusId = state.focusSession.taskId,
  quoteIndex = 0;
const quotes = [
  "Chưa cần làm xong. Mở file lên trước đã.",
  "Làm 15 phút đi, rồi mình hoảng tiếp.",
  "Một bước nhỏ hôm nay, bớt một đêm thức trắng.",
];
const save = () =>
  localStorage.setItem("deadline-run-v1", JSON.stringify(state));
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icon = (name) =>
  ({ quests: "⚑", focus: "◷", rewards: "✦", bag: "▣" })[name];
function render() {
  stopJourney?.();
  stopJourney = null;
  const active = state.tasks.filter((t) => !t.done);
  const progress = state.tasks.length
    ? Math.round(
        (state.tasks.filter((t) => t.done).length / state.tasks.length) * 100,
      )
    : 0;
  document.querySelector("#app").innerHTML =
    `<aside class="sidebar"><a class="brand" href="#"><span class="brand-mark">D<span>→</span></span><span>DEADLINE<span class="brand-run">RUN<span class="tiny">™</span></span></span></a><div class="workspace-label">YOUR LITTLE ADVENTURE</div><nav>${[
      ["quests", "Bảng nhiệm vụ"],
      ["focus", "Trạm tập trung"],
      ["rewards", "Tiệm phần thưởng"],
      ["bag", "Túi đồ của bạn"],
    ]
      .map(
        ([id, label]) =>
          `<button class="nav-item ${tab === id ? "selected" : ""}" data-tab="${id}"><span>${icon(id)}</span>${label}${id === "bag" && state.tickets.some((t) => !t.used) ? `<i>${state.tickets.filter((t) => !t.used).length}</i>` : ""}</button>`,
      )
      .join(
        "",
      )}</nav><div class="sidebar-bottom"><div class="mini-flower">✿</div><p>Đi chậm cũng được.<br>Miễn là mình vẫn đi.</p><span>MADE FOR YOUR NEXT SMALL WIN</span></div><div class="profile"><div class="avatar">🐸</div><div><strong>Deadline warrior</strong><small>Level ${1 + Math.floor(state.xp / 100)} · Người mới phiêu lưu</small></div><span class="online"></span></div></aside>
<div class="main-wrap"><header><div><span class="status-dot"></span> MỘT NGÀY TỐT ĐỂ BẮT ĐẦU</div><div class="header-right"><span class="coin">✦</span><strong>${state.coins}</strong><span class="header-divider"></span><span class="date">${new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long" }).format(new Date())}</span><span class="header-avatar">🐸</span></div></header><main>
<div class="page-heading"><div class="eyebrow">LET'S MAKE A LITTLE PROGRESS</div><div class="title-row"><div><h1>${{ quests: "Deadline đang chờ.<br>Mình bắt đầu nhé?", focus: "Bạn lo deadline.<br>Mình lo hành trình.", rewards: "Làm hết mình.<br>Thưởng thật xứng.", bag: "Niềm vui nhỏ.<br>Dành riêng cho bạn." }[tab]}</h1><p>${{ quests: "Không cần hoàn hảo. Chỉ cần tiến thêm một bước nhỏ.", focus: "Mỗi phút bạn tập trung, người bạn nhỏ lại tiến thêm một đoạn đường.", rewards: "Một vòng quay, một chút niềm vui ngoài đời.", bag: "Những phần thưởng bạn đã tự mình kiếm được." }[tab]}</p></div><button class="button dark" id="add-task"><span>＋</span> Thêm nhiệm vụ</button></div></div>
${
  tab === "quests"
    ? `<section class="hero"><div class="hero-copy"><span class="hero-badge"><span></span> YOUR NEXT CHAPTER STARTS NOW</span><h2>Boss cuối không đáng sợ.<br>Để mai mới đáng sợ.</h2><p>Bạn tập trung làm việc, nhân vật tự vượt chướng ngại.<br>Cùng nhau đi đến cuối hành trình.</p><button class="button dark" id="hero-focus">Bắt đầu hành trình <span>→</span></button></div><div class="pixel-scene"><div class="scene-tag">LEVEL 01 <span>•</span> THE BEGINNING</div><div class="cloud c1"></div><div class="cloud c2"></div><div class="sun"></div><div class="mountain m1"></div><div class="mountain m2"></div><div class="pixel-tree t1"></div><div class="pixel-tree t2"></div><div class="flag"><span>⚑</span></div><div class="frog"><div class="eyes"></div><div class="mouth"></div><div class="blush"></div></div><span class="spark s1">✦</span><span class="spark s2">✧</span><div class="ground"></div><div class="scene-caption">ONE SMALL STEP. ONE BIG WIN.</div></div></section>
<section class="stats"><div><span class="stat-icon mint">⚑</span><div><small>Nhiệm vụ đang chạy</small><strong>${active.length.toString().padStart(2, "0")} <span>nhiệm vụ</span></strong></div></div><div><span class="stat-icon peach">✓</span><div><small>Đã vượt qua</small><strong>${state.completed.toString().padStart(2, "0")} <span>nhiệm vụ</span></strong></div></div><div><span class="stat-icon yellow">✧</span><div><small>Kinh nghiệm tích lũy</small><strong>${state.xp} <span>XP</span></strong></div></div></section>
<div class="content-grid"><section class="quest-section"><div class="section-heading"><h2>Nhiệm vụ của bạn <span>${state.tasks.length}</span></h2><span class="small-muted">Từng bước một, nhé.</span></div><div class="filters">${[
        ["all", "Tất cả"],
        ["active", "Đang chạy"],
        ["done", "Hoàn thành"],
      ]
        .map(
          ([v, l]) =>
            `<button class="${filter === v ? "active" : ""}" data-filter="${v}">${l}</button>`,
        )
        .join("")}</div><div class="task-list">${
        state.tasks
          .filter(
            (t) => filter === "all" || (filter === "done" ? t.done : !t.done),
          )
          .map(taskCard)
          .join("") ||
        `<div class="empty"><div class="empty-flag">⚑</div><h3>Cuộc phiêu lưu bắt đầu từ đây</h3><p>Thêm một việc bạn muốn hoàn thành.<br>Nhỏ thôi cũng được, mình làm cùng nhau.</p><button class="button outline" id="empty-add">＋ Tạo nhiệm vụ đầu tiên</button></div>`
      }</div><div class="progress-caption"><span>HÀNH TRÌNH HÔM NAY</span><strong>${progress}%</strong></div><div class="progress-track"><div style="width:${progress}%"></div></div></section><aside class="right-column"><div class="quote-card"><div class="card-kicker">✳ MỘT CHÚT ĐỘNG LỰC <button id="next-quote" aria-label="Đổi câu động viên">↻</button></div><div class="quote-mark">“</div><blockquote>${quotes[quoteIndex]}</blockquote><span>— Đồng đội pixel của bạn</span><div class="quote-dots">${quotes.map((_, i) => `<i class="${i === quoteIndex ? "active" : ""}"></i>`).join("")}</div></div><div class="reward-teaser"><span class="card-kicker">LÀM XONG CÓ QUÀ</span><div class="teaser-slot">🍿 <span>★</span> 🎬</div><h3>Một chút vui sau deadline</h3><p>Đổi xu lấy một vòng quay.<br>Biết đâu tối nay có kèo xem phim?</p><button id="visit-shop">Ghé tiệm phần thưởng <span>→</span></button></div></aside></div>`
    : tab === "focus"
      ? focusView()
      : tab === "rewards"
        ? rewardView()
        : bagView()
}
<footer><span>✳ LITTLE PROGRESS IS STILL PROGRESS.</span><span>Hít thở. Uống nước. Rồi mình tiếp tục.</span></footer></main></div><dialog id="task-dialog"><form id="task-form"><div class="modal-top"><span class="eyebrow">NEW QUEST</span><button type="button" class="close-dialog" aria-label="Đóng">×</button></div><h2>Một bước nhỏ mới</h2><label>Bạn muốn làm gì?<input name="title" required maxlength="100" placeholder="Ví dụ: Viết phần mở đầu báo cáo"></label><label>Deadline<input name="due" type="datetime-local" required></label><label>Mức độ ưu tiên<select name="priority"><option value="normal">Từ từ nhưng chắc</option><option value="high">Cần ưu tiên</option></select></label><p class="small-muted">Hoàn thành nhiệm vụ: +20 xu và +30 XP.</p><button class="button dark" type="submit">Thêm vào hành trình →</button></form></dialog><dialog id="reward-dialog"><form id="reward-form"><div class="modal-top"><span class="eyebrow">YOUR LITTLE JOY</span><button type="button" class="close-dialog" aria-label="Đóng">×</button></div><h2>Thêm phần thưởng</h2><label>Tên phần thưởng<input name="name" required maxlength="60" placeholder="Một ly trà sữa"></label><label>Chi tiết<input name="detail" required maxlength="100" placeholder="Ghé quán yêu thích vào cuối tuần"></label><label>Tần suất xuất hiện<select name="weight"><option value="4">Thường xuyên</option><option value="2">Thỉnh thoảng</option><option value="1">Hiếm</option></select></label><button class="button dark">Lưu phần thưởng ✦</button></form></dialog><div id="toast" role="status"></div>`;
  bind();
  updateClock();
  if (tab === "focus")
    stopJourney = startJourney(() => ({
      ...readSession(state.focusSession),
      scenery: state.journeyScenery || "auto",
    }));
}
function taskCard(t) {
  const hours = (new Date(t.due) - Date.now()) / 36e5;
  const label = t.done
    ? "Đã hoàn thành"
    : hours < 0
      ? "Đã quá hạn"
      : hours < 1
        ? "Còn dưới 1 giờ"
        : hours < 24
          ? `Còn ${Math.ceil(hours)} giờ`
          : `Còn ${Math.ceil(hours / 24)} ngày`;
  return `<article class="task-card ${t.done ? "done" : ""}"><button class="check-task" data-complete="${t.id}" ${t.done ? "disabled" : ""} aria-label="Hoàn thành nhiệm vụ">${t.done ? "✓" : ""}</button><div class="task-copy"><h3>${esc(t.title)}</h3><div><span class="deadline ${!t.done && hours < 24 ? "urgent" : ""}">◷ ${label}</span>${t.priority === "high" ? '<span class="priority">Ưu tiên</span>' : ""}<span>✦ +20</span></div></div>${!t.done ? `<button class="task-focus" data-focus="${t.id}" aria-label="Tập trung vào nhiệm vụ">▷</button>` : ""}<button class="delete-task" data-delete="${t.id}" aria-label="Xóa nhiệm vụ">×</button></article>`;
}
function focusView() {
  const session = state.focusSession,
    snapshot = readSession(session),
    selected = state.tasks.find((t) => t.id === session.taskId);
  const ongoing = ["running", "paused"].includes(snapshot.status);
  return `<section class="focus-adventure"><div class="focus-session-heading"><div><span class="eyebrow">YOUR FOCUS, THEIR ADVENTURE</span><h2>${esc(selected?.title || "Một chặng đường dành riêng cho bạn")}</h2></div><span class="session-state" id="session-state"></span></div><div class="journey-landscape"><canvas id="journey-canvas" width="960" height="420" role="img" aria-label="Hành trình pixel tự động: nhân vật chạy, nhảy qua chướng ngại và đánh boss theo tiến độ phiên tập trung."></canvas><div class="journey-scene-label"><span class="scene-live-dot"></span><span id="chapter-label"></span><span class="auto-label" id="daylight-label"></span></div><div class="journey-hud"><span>THỜI GIAN CÒN LẠI</span><strong id="journey-clock"></strong><small id="hud-percent"></small></div><div class="journey-quote"><span>🐸 ĐỒNG ĐỘI NHẮN BẠN</span><blockquote id="focus-quote"></blockquote><button id="next-focus-quote" aria-label="Đổi quote tập trung">↻</button></div></div><div class="journey-settings"><label>Cảnh nền<select id="journey-scenery">${[
    ["auto", "Theo hành trình"],
    ["meadow", "Đồng cỏ"],
    ["forest", "Khu rừng"],
    ["coast", "Bờ biển"],
  ]
    .map(
      ([v, l]) =>
        `<option value="${v}" ${(state.journeyScenery || "auto") === v ? "selected" : ""}>${l}</option>`,
    )
    .join(
      "",
    )}</select></label><label>Giọng động viên<select id="quote-mode">${Object.entries(
    quoteModes,
  )
    .map(
      ([v, l]) =>
        `<option value="${v}" ${(state.quoteMode || "mixed") === v ? "selected" : ""}>${l}</option>`,
    )
    .join(
      "",
    )}</select></label><span>Quote đổi mỗi phút tập trung · Ngày/đêm theo tiến độ phiên</span></div><div class="session-progress"><div><span>HÀNH TRÌNH CỦA BẠN</span><strong id="progress-percent"></strong></div><div id="focus-progress" role="progressbar" aria-label="Tiến độ phiên tập trung" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="focus-progress-fill"></span></div><small id="progress-time"></small></div><div class="journey-route"><div class="route-line"><span id="route-fill"></span></div>${[
    ["meadow", "01", "Đồng cỏ", 0],
    ["forest", "02", "Khu rừng", 0.3],
    ["castle", "03", "Cổng thành", 0.65],
    ["boss", "04", "Boss cuối", 0.9],
  ]
    .map(
      ([id, n, label, at]) =>
        `<div class="route-stop" data-at="${at}" data-chapter="${id}"><span>${n}</span><small>${label}</small></div>`,
    )
    .join(
      "",
    )}</div><div class="focus-console"><div class="focus-clock-wrap"><span class="eyebrow">${snapshot.status === "complete" ? "MỘT CHẶNG ĐƯỜNG ĐÃ HOÀN THÀNH" : "THỜI GIAN DÀNH CHO ĐIỀU QUAN TRỌNG"}</span><div class="timer" id="clock" role="timer" aria-label="Thời gian tập trung còn lại"></div><p id="journey-status" role="status" aria-live="polite"></p></div><div class="focus-console-controls"><div class="duration-picker">${[15, 25, 45].map((n) => `<button data-duration="${n}" class="${session.totalMs === n * 60000 ? "active" : ""}" ${ongoing ? "disabled" : ""}>${n} phút</button>`).join("")}</div><div class="focus-actions"><button class="button dark" id="toggle-timer">${snapshot.status === "running" ? "Tạm dừng" : snapshot.status === "paused" ? "Tiếp tục hành trình →" : snapshot.status === "complete" ? "Bắt đầu phiên mới →" : "Bắt đầu tập trung →"}</button><button class="button outline" id="reset-timer" aria-label="Đặt lại phiên tập trung">↻</button></div>${snapshot.status === "complete" && selected && !selected.done ? '<button class="text-button" id="complete-focus-task">Tôi đã làm xong nhiệm vụ · Nhận 20 xu ✓</button>' : '<span class="focus-hint">Cứ làm việc của bạn. Nhân vật sẽ tự lo phần còn lại.</span>'}</div></div><div class="focus-bottom"><span>✦ ${state.focusRuns || 0} hành trình đã hoàn thành</span><span>Tiến độ vẫn tiếp tục khi bạn chuyển tab làm việc.</span></div></section><div class="journey-note"><span>☁</span><p>Mỗi phút tập trung là một đoạn đường đã đi.<small>Bạn làm việc, người bạn nhỏ tiếp tục hành trình. Nghỉ một chút bất cứ khi nào bạn cần.</small></p></div>`;
}
function rewardView() {
  return `<section class="shop-grid"><div class="slot-panel"><span class="eyebrow">THE LITTLE JOY MACHINE</span><h2>Một vòng quay. Một niềm vui.</h2><p>20 xu mỗi lượt · Lượt nào cũng có quà</p><div class="slot-machine"><div class="slot-top">★ LUCKY LITTLE BREAK ★</div><div class="reels"><span>🎬</span><span>🍪</span><span>🎮</span></div><div class="slot-bottom">GOOD WORK DESERVES GOOD THINGS</div></div><button class="button dark spin-button" id="spin" ${state.coins < 20 || spinning ? "disabled" : ""}>${spinning ? "Đang quay…" : "✦ Quay thưởng · 20 xu"}</button><div id="spin-result" role="status"></div><p class="small-muted">${state.coins < 20 ? "Hoàn thành một nhiệm vụ để kiếm thêm xu." : "Bạn có " + state.coins + " xu. Chúc bạn có một khoảng nghỉ thật vui!"}</p></div><div class="reward-options"><div class="section-heading"><h2>Menu niềm vui</h2><button class="text-button" id="add-reward">＋ Thêm</button></div><p class="small-muted">Tự chọn những điều khiến bạn vui. Xác suất theo tần suất đã chọn.</p>${state.rewards
    .map(
      (r) =>
        `<div class="reward-option"><span>${r.icon}</span><div><strong>${esc(r.name)}</strong><small>${esc(r.detail)}</small></div><select aria-label="Tần suất ${esc(r.name)}" data-weight="${r.id}">${[
          [4, "Thường"],
          [3, "Vừa"],
          [2, "Ít"],
          [1, "Hiếm"],
        ]
          .map(
            ([v, l]) =>
              `<option value="${v}" ${r.weight === v ? "selected" : ""}>${l}</option>`,
          )
          .join("")}</select></div>`,
    )
    .join(
      "",
    )}<div class="gentle-note">☁ Nghỉ ngơi là nhu cầu, không cần kiếm quyền được nghỉ. Phần thưởng này chỉ là một chút vui thêm.</div></div></section>`;
}
function bagView() {
  return `<section><div class="section-heading"><h2>Vé niềm vui <span>${state.tickets.filter((t) => !t.used).length}</span></h2><span class="small-muted">Dùng ngay hoặc để dành tối nay.</span></div><div class="ticket-grid">${
    state.tickets
      .slice()
      .reverse()
      .map(
        (t) =>
          `<article class="ticket ${t.used ? "used" : ""}"><span class="ticket-icon">${t.icon}</span><div class="eyebrow">YOU EARNED THIS</div><h3>${esc(t.name)}</h3><p>${esc(t.detail)}</p><button class="button ${t.used ? "outline" : "dark"}" data-use="${t.id}" ${t.used ? "disabled" : ""}>${t.used ? "Đã tận hưởng ✓" : "Dùng phần thưởng →"}</button></article>`,
      )
      .join("") ||
    '<div class="empty"><div class="empty-flag">▣</div><h3>Túi đồ đang chờ niềm vui</h3><p>Hoàn thành nhiệm vụ và ghé tiệm quay thưởng nhé.</p><button class="button outline" id="visit-shop">Ghé tiệm phần thưởng →</button></div>'
  }</div></section>`;
}
function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3500);
}
function updateClock() {
  const snapshot = readSession(state.focusSession),
    seconds = Math.ceil(snapshot.remainingMs / 1000),
    clock = document.querySelector("#clock");
  if (clock)
    clock.textContent = `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  const hudClock = document.querySelector("#journey-clock");
  if (hudClock && clock) hudClock.textContent = clock.textContent;
  const percent =
    snapshot.status === "complete" ? 100 : Math.floor(snapshot.progress * 100);
  for (const id of ["hud-percent", "progress-percent"]) {
    const el = document.getElementById(id);
    if (el) el.textContent = `${percent}% hoàn thành`;
  }
  const progressBar = document.querySelector("#focus-progress");
  if (progressBar) {
    progressBar.setAttribute("aria-valuenow", String(percent));
    document.querySelector("#focus-progress-fill").style.width =
      `${snapshot.progress * 100}%`;
    document.querySelector("#progress-time").textContent =
      `${Math.floor(snapshot.elapsedMs / 60000)} / ${state.focusSession.totalMs / 60000} phút đã tập trung`;
  }
  const lightingLabel = document.querySelector("#daylight-label");
  if (lightingLabel)
    lightingLabel.textContent = daylight(snapshot.progress).label;
  const quote = document.querySelector("#focus-quote");
  if (quote) {
    const message = focusQuote(
      state.quoteMode || "mixed",
      snapshot.elapsedMs,
      focusQuoteOffset,
      snapshot.status,
    );
    if (quote.textContent !== message) quote.textContent = message;
  }
  const badge = document.querySelector("#session-state");
  if (badge) {
    badge.textContent = {
      idle: "Sẵn sàng xuất phát",
      running: "Đang tập trung",
      paused: "Đang nghỉ một nhịp",
      complete: "Đã về đích ✓",
    }[snapshot.status];
    badge.dataset.status = snapshot.status;
  }
  const label = document.querySelector("#chapter-label");
  if (label) label.textContent = chapterNames[snapshot.chapter];
  const fill = document.querySelector("#route-fill");
  if (fill)
    fill.style.width = `${Math.min(100, (snapshot.progress / 0.9) * 100)}%`;
  document
    .querySelectorAll(".route-stop")
    .forEach((el) =>
      el.classList.toggle(
        "reached",
        snapshot.progress >= Number(el.dataset.at),
      ),
    );
}
function tickFocus() {
  if (finishSession(state.focusSession)) {
    state.focusRuns = (state.focusRuns || 0) + 1;
    save();
    if (tab === "focus") render();
    toast("Về đích rồi! Boss đã bị đánh bại. Nghỉ một chút nhé 🌱");
  }
  updateClock();
}
function bind() {
  document.querySelector("#next-focus-quote")?.addEventListener("click", () => {
    focusQuoteOffset++;
    updateClock();
  });
  document.querySelector("#quote-mode")?.addEventListener("change", (e) => {
    state.quoteMode = e.target.value;
    focusQuoteOffset = 0;
    save();
    updateClock();
  });
  document
    .querySelector("#journey-scenery")
    ?.addEventListener("change", (e) => {
      state.journeyScenery = e.target.value;
      save();
    });

  document.querySelectorAll("[data-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        if (spinning) return;
        tab = b.dataset.tab;
        render();
      }),
  );
  const openTask = () => document.querySelector("#task-dialog").showModal();
  document.querySelector("#add-task").onclick = openTask;
  document.querySelector("#empty-add")?.addEventListener("click", openTask);
  document
    .querySelectorAll(".close-dialog")
    .forEach((b) => (b.onclick = () => b.closest("dialog").close()));
  document.querySelector("#task-form").onsubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const title = data.get("title").trim();
    if (!title) return;
    state.tasks.push({
      id: crypto.randomUUID(),
      title,
      due: data.get("due"),
      priority: data.get("priority"),
      done: false,
    });
    save();
    render();
    toast("Nhiệm vụ mới đã sẵn sàng. Bắt đầu nhỏ thôi!");
  };
  document.querySelectorAll("[data-filter]").forEach(
    (b) =>
      (b.onclick = () => {
        filter = b.dataset.filter;
        render();
      }),
  );
  document.querySelectorAll("[data-complete]").forEach(
    (b) =>
      (b.onclick = () => {
        if (completeTask(state, b.dataset.complete)) {
          save();
          render();
          toast("Bạn làm được rồi! +20 xu · +30 XP ✦");
        }
      }),
  );
  document.querySelectorAll("[data-delete]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!confirm("Xóa nhiệm vụ này khỏi danh sách?")) return;
        state.tasks = state.tasks.filter((t) => t.id !== b.dataset.delete);
        save();
        render();
      }),
  );
  document.querySelectorAll("[data-focus]").forEach(
    (b) =>
      (b.onclick = () => {
        focusId = b.dataset.focus;
        state.focusSession.taskId = focusId;
        save();
        tab = "focus";
        render();
      }),
  );
  document.querySelector("#hero-focus")?.addEventListener("click", () => {
    tab = "focus";
    render();
  });
  document.querySelector("#visit-shop")?.addEventListener("click", () => {
    tab = "rewards";
    render();
  });
  document.querySelector("#next-quote")?.addEventListener("click", () => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    render();
  });
  document.querySelectorAll("[data-duration]").forEach(
    (b) =>
      (b.onclick = () => {
        state.focusSession = newSession(Number(b.dataset.duration), focusId);
        save();
        render();
      }),
  );
  document.querySelector("#toggle-timer")?.addEventListener("click", () => {
    if (state.focusSession.status === "running") {
      if (readSession(state.focusSession).remainingMs === 0) {
        tickFocus();
        return;
      }
      pauseSession(state.focusSession);
    } else {
      if (state.focusSession.status === "complete")
        state.focusSession = newSession(
          state.focusSession.totalMs / 60000,
          focusId,
        );
      resumeSession(state.focusSession);
    }
    save();
    render();
  });
  document.querySelector("#reset-timer")?.addEventListener("click", () => {
    state.focusSession = newSession(
      state.focusSession.totalMs / 60000,
      focusId,
    );
    save();
    render();
  });
  document
    .querySelector("#complete-focus-task")
    ?.addEventListener("click", () => {
      if (completeTask(state, state.focusSession.taskId)) {
        save();
        render();
        toast("Nhiệm vụ hoàn tất! +20 xu · +30 XP ✦");
      }
    });
  document
    .querySelector("#add-reward")
    ?.addEventListener("click", () =>
      document.querySelector("#reward-dialog").showModal(),
    );
  document.querySelector("#reward-form").onsubmit = (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    if (!d.get("name").trim() || !d.get("detail").trim()) return;
    state.rewards.push({
      id: crypto.randomUUID(),
      icon: "🎁",
      name: d.get("name").trim(),
      detail: d.get("detail").trim(),
      weight: Number(d.get("weight")),
    });
    save();
    render();
    toast("Đã thêm một niềm vui mới!");
  };
  document.querySelectorAll("[data-weight]").forEach(
    (b) =>
      (b.onchange = () => {
        state.rewards.find((r) => r.id === b.dataset.weight).weight = Number(
          b.value,
        );
        save();
      }),
  );
  document.querySelectorAll("[data-use]").forEach(
    (b) =>
      (b.onclick = () => {
        const t = state.tickets.find((t) => t.id === b.dataset.use);
        if (t && !t.used) {
          t.used = true;
          save();
          render();
          toast("Tận hưởng nhé. Bạn xứng đáng mà!");
        }
      }),
  );
  document.querySelector("#spin")?.addEventListener("click", spin);
}
function spin() {
  if (spinning || state.coins < 20) return;
  spinning = true;
  state.coins -= 20;
  const reward = pickReward(state.rewards);
  const ticket = { ...reward, id: crypto.randomUUID(), used: false };
  state.tickets.push(ticket);
  save();
  render();
  const reels = document.querySelectorAll(".reels span");
  const animation = setInterval(
    () =>
      reels.forEach(
        (el) =>
          (el.textContent =
            state.rewards[
              Math.floor(Math.random() * state.rewards.length)
            ].icon),
      ),
    90,
  );
  setTimeout(() => {
    clearInterval(animation);
    reels.forEach((el) => (el.textContent = reward.icon));
    spinning = false;
    const b = document.querySelector("#spin");
    if (b) {
      b.disabled = state.coins < 20;
      b.textContent = "✦ Quay tiếp · 20 xu";
    }
    document.querySelector("#spin-result").innerHTML =
      `<div class="win"><strong>${esc(reward.name)} ✨</strong><p>${esc(reward.detail)}</p><button class="text-button" id="open-bag">Cất vào túi đồ →</button></div>`;
    document.querySelector("#open-bag").onclick = () => {
      tab = "bag";
      render();
    };
    toast("Đã nhận thưởng! Vé đã được cất vào túi.");
  }, 1800);
}
if (finishSession(state.focusSession)) {
  state.focusRuns = (state.focusRuns || 0) + 1;
  save();
}
render();
setInterval(tickFocus, 250);
