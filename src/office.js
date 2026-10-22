import { daylight } from "./motivation.js";

// All coworker movement uses focused elapsed time, so pausing or restoring a
// session preserves the office activity without running a second clock.
export function officeActivity(snapshot) {
  return {
    working: snapshot.status === "running",
    seconds: snapshot.elapsedMs / 1000,
    status:
      snapshot.status === "complete"
        ? "break"
        : snapshot.status === "paused"
          ? "paused"
          : snapshot.status === "idle"
            ? "ready"
            : "working",
  };
}
export function startOffice(getSnapshot) {
  const canvas = document.querySelector("#journey-canvas"),
    ctx = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let frame, previousStatus, lastKey;
  const r = (x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  const text = (str, x, y, size = 10, color = "#dcd9bb") => {
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px monospace`;
    ctx.fillText(str, Math.round(x), Math.round(y));
  };
  function pot(x, y, size = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    r(-11, -3, 24, 9, "#a26f59");
    r(-8, 6, 18, 19, "#c09073");
    r(-5, 8, 4, 15, "#d5a887");
    r(-1, -36, 3, 35, "#4d7158");
    r(-18, -29, 18, 10, "#6f9270");
    r(-13, -35, 13, 8, "#82a17b");
    r(2, -43, 14, 14, "#769976");
    r(2, -27, 19, 9, "#5b8667");
    r(-10, -14, 12, 7, "#7b9e77");
    ctx.restore();
  }
  function mug(x, y, color = "#e0b77e") {
    r(x, y, 9, 11, color);
    r(x + 9, y + 3, 3, 6, color);
    r(x + 1, y, 6, 2, "#6c6857");
  }
  function monitor(x, y, t, night, variant) {
    r(x + 4, y + 4, 43, 32, "#514f47");
    r(x, y, 43, 31, "#b9b7a0");
    r(x + 3, y + 3, 35, 23, "#3c5a58");
    r(x + 5, y + 5, 31, 19, night ? "#7da69b" : "#8ea99b");
    r(x + 14, y + 31, 11, 4, "#969980");
    r(x + 8, y + 35, 24, 4, "#c0bca2");
    for (let i = 0; i < 4; i++)
      r(x + 8, y + 8 + i * 4, 8 + ((i + variant) % 3) * 6, 1, "#d5e1b8");
    r(x + 30, y + 20, 2, 2, Math.floor(t * 2) % 2 ? "#d9e3bc" : "#8ba598");
    r(x + 36, y + 28, 2, 2, "#99b582");
    if (night) {
      ctx.globalAlpha = 0.08;
      r(x - 4, y - 3, 49, 35, "#b9eac9");
      ctx.globalAlpha = 1;
    }
  }
  function desk(x, y, person, t, night, working) {
    const phase = t + person * 2.3,
      bob = working ? Math.sin(phase * 2) * 0.8 : 0;
    const shirt = [
      "#809a83",
      "#bd8b78",
      "#8c8fa7",
      "#b9a476",
      "#82a5a0",
      "#bd9ba3",
    ][person];
    const skin = ["#e1b692", "#c89471", "#f0cbaa"][person % 3];
    const hair = [
      "#4e4841",
      "#70533e",
      "#3f4846",
      "#8c6041",
      "#5c4e49",
      "#4e4842",
    ][person];
    // Cast shadow, desk legs and warm wooden desktop.
    r(x - 8, y + 58, 137, 11, "#6c5d4b22");
    r(x + 2, y + 24, 7, 36, "#6f614f");
    r(x + 105, y + 24, 7, 36, "#6f614f");
    r(x - 8, y - 6, 130, 39, "#796b53");
    r(x - 8, y - 12, 130, 36, "#c4a47b");
    r(x - 5, y - 9, 124, 2, "#dbc099");
    r(x - 4, y + 25, 121, 5, "#a4825e");
    for (let i = 0; i < 4; i++) r(x + 3 + i * 30, y + 4, 23, 1, "#b79972");
    monitor(x + 29, y - 42, phase, night, person);
    // Lamp, notebook, keyboard and personal belongings.
    r(x + 99, y - 28, 3, 26, "#6d7760");
    r(x + 91, y - 32, 18, 7, "#718771");
    r(x + 86, y - 26, 28, 5, "#8b9b7d");
    r(x + 90, y - 1, 22, 4, "#6d7760");
    if (night) {
      ctx.fillStyle = "#f3d59c18";
      ctx.beginPath();
      ctx.moveTo(x + 89, y - 20);
      ctx.lineTo(x + 113, y - 20);
      ctx.lineTo(x + 125, y + 19);
      ctx.lineTo(x + 77, y + 19);
      ctx.fill();
      r(x + 91, y - 23, 18, 2, "#f2d89a");
    }
    r(x + 4, y - 2, 16, 21, "#e6d8b3");
    r(x + 6, y + 2, 11, 1, "#c2b08e");
    r(x + 6, y + 7, 9, 1, "#c2b08e");
    r(x + 32, y + 2, 42, 12, "#b8b7a0");
    for (let i = 0; i < 8; i++) r(x + 35 + i * 4, y + 5, 2, 2, "#777d6c");
    r(x + 36, y + 9, 25, 2, "#777d6c");
    const sip = working && phase % 19 > 16;
    if (!sip) mug(x + 82, y + 8, ["#d7b57c", "#c4ccac", "#c89787"][person % 3]);
    // Chair and seated coworkers, seen from behind with tiny typing movements.
    r(x + 42, y + 43, 29, 24, "#56675a");
    r(x + 38, y + 52, 36, 9, "#6c806b");
    r(x + 53, y + 66, 5, 10, "#6c6b58");
    r(x + 38, y + 76, 35, 3, "#696757");
    r(x + 38, y + 21 + bob, 36, 30, shirt);
    r(x + 43, y + 43, 26, 5, shirt);
    r(x + 42, y + 48, 10, 15, "#555e55");
    r(x + 60, y + 48, 10, 15, "#555e55");
    const left = working ? Math.sin(phase * 10) * 2 : 3,
      right = working ? Math.sin(phase * 10 + 2) * 2 : 3;
    r(x + 30, y + 18 + bob, 9, 20, shirt);
    r(x + 31, y + 10 + left, 8, 11, skin);
    r(x + 72, y + 17 + bob, 8, 19, shirt);
    r(x + 72, y + (sip ? -1 : 10 + right), 7, 12, skin);
    if (sip) mug(x + 66, y - 2, "#d6b27c");
    r(x + 44, y - 2 + bob, 24, 25, skin);
    r(x + 41, y - 7 + bob, 28, 13, hair);
    r(x + 39, y + 2 + bob, 7, 18, hair);
    r(x + 65, y + 3 + bob, 6, 14, hair);
    r(x + 44, y - 10 + bob, 20, 5, hair);
    if (person === 2 || person === 4) {
      r(x + 38, y + 4 + bob, 5, 13, "#c1bb94");
      r(x + 68, y + 4 + bob, 5, 13, "#c1bb94");
      r(x + 41, y - 9 + bob, 28, 3, "#c1bb94");
    }
    if (working && !sip) {
      const steam = phase % 3;
      r(x + 85, y + 2 - steam * 4, 2, 4, "#e9ddc077");
    }
  }
  function windowPane(x, y, night, lighting, t) {
    r(x - 7, y - 7, 161, 111, "#897c63");
    r(x - 3, y - 3, 153, 103, "#d4c5a1");
    r(x, y, 147, 97, lighting.palette.sky);
    for (let i = 0; i < 5; i++) {
      const h = 20 + ((i * 17) % 40);
      r(x + i * 31, y + 97 - h, 28, h, night ? "#465a68" : "#a2b6a3");
      for (let j = 0; j < 3; j++)
        r(
          x + i * 31 + 6,
          y + 100 - h + j * 11,
          4,
          5,
          night ? "#d8bb7d" : "#c7d4b7",
        );
    }
    if (night) {
      r(x + 105, y + 13, 13, 13, "#e5ddb5");
      r(x + 111, y + 10, 10, 10, lighting.palette.sky);
      for (let i = 0; i < 9; i++)
        r(x + 8 + ((i * 37) % 130), y + 5 + ((i * 13) % 35), 1, 1, "#e7e1bf");
    } else {
      r(x + 105, y + 13, 16, 16, "#eee0a5");
      r(x + 15, y + 19, 35, 5, "#f3e9d0");
      r(x + 23, y + 13, 19, 8, "#f3e9d0");
    }
    // Thin rain on the window is a visual ambience, not a weather report.
    for (let i = 0; i < 10; i++) {
      const py = (i * 31 + t * 34) % 90;
      r(
        x + 9 + ((i * 37) % 133),
        y + py,
        1,
        7,
        night ? "#a0b6b44d" : "#f0f4df88",
      );
    }
    r(x + 71, y, 5, 97, "#c7b690");
    r(x, y + 48, 147, 4, "#c7b690");
    r(x - 10, y + 97, 168, 7, "#ad9472");
    r(x - 12, y - 9, 8, 111, "#a9967e");
    r(x + 151, y - 9, 8, 111, "#a9967e");
  }
  function draw(snapshot) {
    const activity = officeActivity(snapshot),
      t = activity.seconds,
      lighting = daylight(),
      night = lighting.phase === "night";
    const wall = night ? "#625f52" : "#b3b49a",
      floor = night ? "#87765f" : "#b39d7c";
    r(0, 0, 960, 540, night ? "#3c4543" : "#e0d9be");
    r(24, 42, 912, 212, wall);
    r(24, 42, 912, 9, night ? "#76735e" : "#c4c3a7");
    r(24, 245, 912, 14, night ? "#4d5247" : "#8e947b");
    r(24, 259, 912, 253, floor);
    for (let row = 0; row < 10; row++) {
      const y = 259 + row * 27;
      r(24, y, 912, 1, night ? "#756851" : "#9f8b6c");
      for (let col = 0; col < 10; col++)
        r(
          24 + col * 105 + (row % 2) * 51,
          y,
          1,
          27,
          night ? "#756851" : "#9f8b6c",
        );
    }
    // Window wall with city, warm curtains and late-night desk lights.
    windowPane(190, 71, night, lighting, t);
    windowPane(398, 71, night, lighting, t);
    windowPane(606, 71, night, lighting, t);
    if (!night) {
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "#fff7c9";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(190 + i * 208, 178);
        ctx.lineTo(337 + i * 208, 178);
        ctx.lineTo(427 + i * 208, 410);
        ctx.lineTo(290 + i * 208, 410);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // Bookcase, records, bulletin board and a tiny coffee corner.
    r(54, 83, 88, 155, "#706650");
    r(59, 89, 78, 143, "#a08e6b");
    for (let row = 0; row < 3; row++) {
      r(58, 126 + row * 48, 80, 6, "#d1b58a");
      for (let j = 0; j < 7; j++) {
        const h = 18 + ((j * 7) % 15);
        r(
          63 + j * 10,
          125 + row * 48 - h,
          7,
          h,
          ["#838f74", "#c29377", "#d4bd8b", "#879e99"][j % 4],
        );
        r(64 + j * 10, 126 + row * 48 - h + 4, 5, 1, "#e4d0a6");
      }
    }
    pot(94, 77, 0.65);
    r(808, 82, 85, 68, "#937b5c");
    r(813, 87, 75, 58, "#bda47d");
    r(823, 97, 25, 21, "#e5d8b0");
    r(851, 94, 24, 27, "#b9caad");
    r(841, 126, 29, 11, "#e0b593");
    r(802, 201, 94, 34, "#a88a66");
    r(802, 196, 94, 7, "#d0b38a");
    r(808, 235, 7, 22, "#786d56");
    r(884, 235, 7, 22, "#786d56");
    r(809, 166, 28, 30, "#5d6458");
    r(813, 171, 20, 13, "#c3bea0");
    mug(842, 184);
    r(863, 179, 21, 16, "#c5b08b");
    // Wall clock uses actual local time, independently of the focus session.
    r(772, 51, 30, 30, "#8f8469");
    r(775, 54, 24, 24, "#ded4b1");
    const now = new Date(),
      angle =
        (((now.getHours() % 12) + now.getMinutes() / 60) / 12) * Math.PI * 2 -
        Math.PI / 2;
    r(786, 65, 3, 3, "#625e4b");
    ctx.strokeStyle = "#625e4b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(787, 66);
    ctx.lineTo(787 + Math.cos(angle) * 6, 66 + Math.sin(angle) * 6);
    ctx.moveTo(787, 66);
    const minute = (now.getMinutes() / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.lineTo(787 + Math.cos(minute) * 9, 66 + Math.sin(minute) * 9);
    ctx.stroke();
    text("SMALL STEPS STUDIO", 332, 197, 12, night ? "#d4c7a3" : "#69755f");
    // Back row, then front row for natural overlap.
    desk(197, 255, 0, t, night, activity.working);
    desk(402, 255, 1, t, night, activity.working);
    desk(607, 255, 2, t, night, activity.working);
    r(150, 365, 641, 123, night ? "#696c5a" : "#929c7b");
    r(156, 371, 629, 111, night ? "#787d65" : "#a0a98a");
    for (let i = 0; i < 25; i++) r(165 + i * 25, 378, 12, 2, "#b8bd9744");
    desk(197, 399, 3, t, night, activity.working);
    desk(402, 399, 4, t, night, activity.working);
    desk(607, 399, 5, t, night, activity.working);
    pot(107, 306, 1.3);
    pot(850, 310, 1.3);
    pot(105, 459, 1.1);
    pot(851, 465, 1.2);
    // A sleeping office cat and a vintage radio.
    r(811, 381, 65, 37, "#ad9274");
    r(805, 376, 77, 9, "#d0b493");
    r(821, 361, 34, 14, "#c9b394");
    r(816, 352, 15, 18, "#c9b394");
    r(816, 348, 5, 8, "#c9b394");
    r(827, 348, 5, 8, "#c9b394");
    r(819, 359, 3, 1, "#6f6553");
    r(826, 359, 3, 1, "#6f6553");
    r(854, 365 + Math.sin(t) * 2, 12, 4, "#baa080");
    r(65, 389, 61, 32, "#806b55");
    r(69, 393, 53, 24, "#c2aa7f");
    r(74, 397, 21, 16, "#786c57");
    for (let i = 0; i < 5; i++) r(77 + i * 4, 398, 1, 13, "#baa17a");
    r(101, 397, 15, 6, "#8c9c7d");
    r(102, 408, 5, 5, "#7f745e");
    r(113, 408, 5, 5, "#7f745e");
    // Light dust and slow ceiling fan: quiet ambience, no distracting flashes.
    r(477, 39, 6, 18, "#9b9278");
    r(472, 54, 16, 8, "#8c8974");
    const fan = Math.sin(t * 2);
    r(445 + fan * 5, 55, 30, 4, "#b8b095");
    r(485 - fan * 5, 55, 30, 4, "#b8b095");
    for (let i = 0; i < 12; i++) {
      const x = 165 + ((i * 61) % 600) + Math.sin(t * 0.3 + i) * 3,
        y = 85 + ((i * 47 + t * 3) % 350);
      r(x, y, 1, 1, night ? "#eedfba55" : "#fff8da77");
    }
    r(24, 512, 912, 9, night ? "#5d5d4e" : "#99856a");
    text(
      activity.status === "break"
        ? "GOOD WORK. TIME FOR A LITTLE BREAK."
        : "A QUIET ROOM. A LITTLE COMPANY. ONE THING AT A TIME.",
      286,
      534,
      9,
      night ? "#d2c4a4" : "#8c8c71",
    );
    canvas.dataset.mode = "office";
    canvas.dataset.activity = activity.status;
    canvas.dataset.daylight = lighting.phase;
    canvas.dataset.status = snapshot.status;
    if (previousStatus !== snapshot.status) {
      document.querySelector("#journey-status").textContent = {
        idle: "Chỗ ngồi đã sẵn sàng. Cùng bắt đầu một phiên nhé.",
        running:
          "Mọi người đang làm việc cùng bạn. Cứ thong thả, từng việc một.",
        paused: "Cả phòng nghỉ một nhịp. Ly cà phê vẫn ở đây.",
        complete: "Xong một phiên rồi! Cả phòng cùng nghỉ một chút.",
      }[snapshot.status];
      previousStatus = snapshot.status;
    }
  }
  function loop() {
    const snapshot = getSnapshot();
    const key = `${snapshot.status}:${Math.floor(snapshot.elapsedMs / 1000)}:${Math.floor(Date.now() / 60000)}`;
    if (!reduced || lastKey !== key) {
      draw(
        reduced
          ? {
              ...snapshot,
              elapsedMs: Math.floor(snapshot.elapsedMs / 1000) * 1000,
            }
          : snapshot,
      );
      lastKey = key;
    }
    frame = requestAnimationFrame(loop);
  }
  frame = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(frame);
}

// Optional, locally synthesized rain. No external audio, autoplay or permissions.
export function createOfficeAmbience() {
  let context, source, gain;
  return {
    async play() {
      if (!context) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) throw new Error("Audio unavailable");
        context = new Audio();
        const buffer = context.createBuffer(
          1,
          context.sampleRate * 3,
          context.sampleRate,
        );
        const data = buffer.getChannelData(0);
        let previous = 0;
        for (let i = 0; i < data.length; i++) {
          previous = (previous + Math.random() * 0.04 - 0.02) / 1.02;
          data[i] = previous * 3.5;
        }
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1400;
        gain = context.createGain();
        gain.gain.value = 0.12;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        source.start();
      }
      await context.resume();
    },
    pause() {
      if (context && context.state === "running") return context.suspend();
    },
    close() {
      source?.stop();
      context?.close();
      context = null;
      source = null;
    },
  };
}
