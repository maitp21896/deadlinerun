import { chapterNames } from "./focus.js";
import { daylight } from "./motivation.js";

// Every position is derived from focused elapsed time. Pausing, navigation and
// background-tab throttling cannot advance or rewind the scenery independently.
export function journeyPose(snapshot) {
  const seconds = snapshot.elapsedMs / 1000;
  const distance = seconds * 66;
  const obstacleIndex = Math.round((distance - 350) / 580);
  const obstacleDistance = 350 + obstacleIndex * 580 - distance;
  const type = ((obstacleIndex % 4) + 4) % 4;
  const encounter = obstacleIndex >= 0 && Math.abs(obstacleDistance) < 105;
  const combat = snapshot.chapter === "boss";
  const finished = snapshot.chapter === "finish";
  const scenery =
    snapshot.scenery && snapshot.scenery !== "auto"
      ? snapshot.scenery
      : snapshot.chapter;
  const swim = scenery === "ocean" && !combat && !finished;
  const cave = scenery === "cave" && !combat && !finished;
  const duck = cave && obstacleIndex >= 0 && Math.abs(obstacleDistance) < 155;
  const flight = (105 - obstacleDistance) / 210;
  const landingAge = (-105 - obstacleDistance) / 66;
  const landing =
    !swim &&
    !cave &&
    !combat &&
    !finished &&
    obstacleIndex >= 0 &&
    type !== 2 &&
    landingAge >= 0 &&
    landingAge < 0.28
      ? 1 - landingAge / 0.28
      : 0;
  const jump =
    !combat && !finished && !swim && !cave && encounter && type !== 2
      ? 4 * flight * (1 - flight) * (type === 1 ? 116 : 88)
      : 0;
  return {
    seconds,
    distance,
    obstacleDistance,
    type,
    jump,
    landing,
    swim,
    duck,
    action: finished
      ? "celebrate"
      : combat
        ? "battle"
        : snapshot.status === "idle"
          ? "idle"
          : swim
            ? "swim"
            : duck
              ? "duck"
              : jump > 1
                ? "jump"
                : encounter && type === 2
                  ? "attack"
                  : "run",
  };
}

export function startJourney(getSnapshot) {
  const canvas = document.querySelector("#journey-canvas");
  const ctx = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let frame,
    previousStatus,
    previousChapter,
    previousScenery,
    previousStatusScenery,
    transitionStart = 0,
    lastStaticKey;
  const rect = (x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  const text = (s, x, y, size = 12, color = "#f4edcd", align = "left") => {
    ctx.font = `bold ${size}px monospace`;
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.fillText(s, Math.round(x), Math.round(y));
  };
  const ground = 337,
    heroX = 245;
  function cloud(x, y, scale, color) {
    rect(x, y, 65 * scale, 16 * scale, color);
    rect(x + 12 * scale, y - 12 * scale, 34 * scale, 16 * scale, color);
    rect(x + 30 * scale, y - 20 * scale, 17 * scale, 20 * scale, color);
  }
  function pine(x, y, s, leaf, trunk) {
    rect(x + 21 * s, y + 37 * s, 9 * s, 83 * s, trunk);
    rect(x, y + 29 * s, 53 * s, 32 * s, leaf);
    rect(x + 8 * s, y + 4 * s, 37 * s, 45 * s, leaf);
    rect(x + 17 * s, y - 17 * s, 20 * s, 47 * s, leaf);
    rect(x + 7 * s, y + 37 * s, 39 * s, 5 * s, "#ffffff10");
  }
  function star(x, y, color, size = 3) {
    rect(x - size, y - size * 3, size * 2, size * 6, color);
    rect(x - size * 3, y - size, size * 6, size * 2, color);
    rect(x - size * 2, y - size * 2, size * 4, size * 4, color);
  }
  function hero(y, pose, snapshot) {
    const running = pose.action === "run" || pose.action === "duck",
      attack = pose.action === "attack" || pose.action === "battle";
    const stride =
      running || pose.swim
        ? Math.round(
            Math.sin(pose.seconds * (pose.swim ? 5 : 11)) * (pose.swim ? 8 : 5),
          )
        : 0;
    const bob = running ? Math.abs(Math.sin(pose.seconds * 14)) * 2 : 0;
    const x = heroX;
    y -= bob;
    ctx.save();
    if (pose.swim) {
      ctx.translate(x + 12, y + 27);
      ctx.rotate(1.15 + Math.sin(pose.seconds * 2) * 0.08);
      ctx.translate(-x - 12, -y - 27);
    } else {
      const squash = pose.duck ? 0.56 : 1 - pose.landing * 0.16;
      ctx.translate(x + 12, y + 54);
      ctx.scale(pose.duck ? 1.15 : 1 + pose.landing * 0.12, squash);
      ctx.translate(-x - 12, -y - 54);
    }
    // Little frog adventurer: scarf, backpack, boots and a wooden sword.
    rect(x - 12, y + 20, 14, 25, "#82684b");
    rect(x - 16, y + 23, 7, 19, "#b89767");
    rect(x - 3, y + 19, 31, 27, "#62865a");
    rect(x + 3, y + 25, 20, 17, "#afc68c");
    rect(x - 4, y + 43, 11, 10 + stride, "#344e43");
    rect(x + 18, y + 43, 11, 10 - stride, "#344e43");
    rect(x - 8, y + 48 + stride, 15, 6, "#35483f");
    rect(x + 17, y + 48 - stride, 17, 6, "#35483f");
    rect(x - 8, y + 1, 40, 26, "#8ab96b");
    rect(x - 4, y - 8, 13, 18, "#8ab96b");
    rect(x + 18, y - 8, 13, 18, "#8ab96b");
    rect(x - 1, y - 4, 8, 10, "#f6f0cf");
    rect(x + 21, y - 4, 8, 10, "#f6f0cf");
    rect(x + 3, y - 1, 4, 6, "#2e453d");
    rect(x + 25, y - 1, 4, 6, "#2e453d");
    rect(x + 8, y + 16, 12, 3, "#456347");
    rect(x - 5, y + 13, 6, 4, "#d49a83");
    rect(x + 26, y + 13, 5, 4, "#d49a83");
    rect(x - 5, y + 25, 36, 6, "#d28b65");
    rect(x - 15, y + 29 + Math.sin(pose.seconds * 7) * 2, 16, 7, "#bf765e");
    if (attack) {
      const swing = Math.sin(pose.seconds * 9) > -0.2;
      rect(x + 28, y + 28, 14, 8, "#8ab96b");
      rect(x + 38, y + 15, 5, 25, "#967444");
      rect(x + 35, y + 28, 12, 5, "#e6c183");
      if (swing) {
        rect(x + 44, y + 20, 45, 6, "#fcf0c1");
        rect(x + 78, y + 11, 7, 22, "#fcf0c1");
        star(x + 92, y + 22, "#ffe5a3", 2);
      } else rect(x + 41, y + 4, 6, 28, "#d6dec6");
    } else if (pose.swim) {
      rect(x + 28, y + 23 + Math.sin(pose.seconds * 5) * 5, 10, 15, "#8ab96b");
      rect(x - 10, y + 26 - Math.sin(pose.seconds * 5) * 5, 8, 15, "#8ab96b");
    } else {
      rect(x + 26, y + 30, 8, 11, "#8ab96b");
      rect(x + 33, y + 12, 5, 29, "#c3cfb3");
      rect(x + 29, y + 35, 13, 4, "#bda06b");
    }
    if (snapshot.status === "complete") {
      star(x - 28, y + 4, "#e8bd63", 3);
      star(x + 51, y - 5, "#e8bd63", 3);
    }
    ctx.restore();
  }
  function slime(x, y, t, hit = false) {
    const bounce = Math.abs(Math.sin(t * 3)) * 5;
    rect(x, y + 10 - bounce, 34, 19, hit ? "#f0ddbb" : "#ab8ba5");
    rect(x + 5, y + 3 - bounce, 24, 26, hit ? "#f0ddbb" : "#ab8ba5");
    rect(x + 7, y + 13 - bounce, 5, 5, "#4a3c52");
    rect(x + 23, y + 13 - bounce, 5, 5, "#4a3c52");
    rect(x + 14, y + 22 - bounce, 8, 3, "#6b536e");
  }
  function obstacle(x, type, t) {
    if (type === 0) {
      rect(x - 7, ground - 46, 61, 11, "#78916b");
      rect(x, ground - 35, 47, 35, "#8e7860");
      rect(x + 8, ground - 30, 8, 27, "#a58b67");
      rect(x + 34, ground - 30, 5, 27, "#715e53");
      rect(x + 15, ground - 51, 4, 9, "#b9c894");
    }
    if (type === 1) {
      rect(x - 34, ground, 91, 83, "#263f45");
      rect(x - 37, ground + 11, 7, 72, "#77684e");
      rect(x + 57, ground + 11, 7, 72, "#77684e");
      for (let j = 0; j < 3; j++)
        star(
          x - 19 + j * 28,
          ground - 96 - Math.sin((j / 2) * Math.PI) * 24,
          "#e8d39b",
          2,
        );
    }
    if (type === 2) {
      if (x > heroX + 47) slime(x, ground - 29, t);
      else if (x > heroX - 22) {
        for (let j = 0; j < 6; j++)
          star(x + j * 9, ground - 28 - (j % 3) * 13, "#e8cfac", 1);
      }
    }
    if (type === 3) {
      for (let j = 0; j < 2; j++) {
        rect(x + j * 27, ground - 29, 25, 29, "#9d8b73");
        rect(x + j * 27 + 3, ground - 27, 19, 4, "#beaa84");
        rect(x + j * 27 + 11, ground - 22, 3, 22, "#786b5d");
      }
      rect(x + 13, ground - 56, 26, 25, "#a49175");
      rect(x + 16, ground - 54, 20, 4, "#c2ad87");
    }
  }
  function underground(scroll, t) {
    rect(0, 0, 960, 420, "#243137");
    rect(0, 105, 960, 232, "#34464a");
    for (let i = -1; i < 10; i++) {
      const x = i * 135 - ((scroll * 0.24) % 135);
      rect(x, 52, 82, 216, "#2c3a40");
      rect(x + 12, 34, 54, 40, "#2c3a40");
      rect(x + 16, 205, 37, 132, "#3e5052");
    }
    for (let i = -1; i < 10; i++) {
      const x = i * 127 - ((scroll * 0.65) % 127);
      rect(x, 0, 75, 58, "#192a30");
      rect(x + 17, 55, 39, 31, "#192a30");
      rect(x + 29, 82, 15, 20, "#192a30");
      if (i % 2 === 0) {
        star(x + 65, 290, "#71c4bc", 4);
        rect(x + 59, 288, 9, 49, "#57918d");
        rect(x + 72, 306, 7, 31, "#8ccebc");
      } else {
        rect(x + 10, 153, 6, 31, "#a27a57");
        rect(x + 7, 144 - Math.sin(t * 7 + i) * 3, 12, 15, "#e0b96f");
        rect(x + 10, 147, 6, 11, "#f5df9a");
      }
    }
  }
  function underwater(scroll, t, night) {
    rect(0, 0, 960, 420, night ? "#183e56" : "#427f91");
    rect(0, 94, 960, 326, night ? "#20495b" : "#448b98");
    rect(0, 212, 960, 208, night ? "#255366" : "#3b7e8a");
    ctx.globalAlpha = night ? 0.05 : 0.09;
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = "#d4f2dd";
      ctx.beginPath();
      const x = i * 180 + Math.sin(t * 0.3 + i) * 15;
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 42, 0);
      ctx.lineTo(x + 120, 337);
      ctx.lineTo(x + 48, 337);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = -1; i < 12; i++) {
      const x = i * 103 - ((scroll * 0.4) % 103),
        sway = Math.sin(t * 1.8 + i) * 6;
      rect(x, 280, 6, 57, "#3f7974");
      rect(x + sway, 260, 6, 25, "#4d9384");
      rect(x + sway + 4, 250, 7, 17, "#68a693");
      if (i % 2 === 0) {
        rect(x + 32, 302, 5, 35, "#b08893");
        rect(x + 24, 311, 21, 5, "#c79a9e");
        rect(x + 24, 297, 5, 17, "#c79a9e");
        rect(x + 41, 301, 5, 13, "#c79a9e");
      }
    }
    for (let i = 0; i < 6; i++) {
      const x =
          ((((i * 201 - scroll * 0.18 + t * 12) % 1100) + 1100) % 1100) - 60,
        y = 135 + (i % 3) * 43 + Math.sin(t + i) * 6;
      rect(x, y, 23, 11, i % 2 ? "#b7b68f" : "#91baba");
      rect(x - 7, y - 3, 7, 17, i % 2 ? "#a5a57e" : "#7ba7a9");
      rect(x + 18, y + 3, 3, 3, "#2a545d");
    }
    for (let i = 0; i < 20; i++) {
      const x = (i * 137 - scroll * 0.12 + Math.sin(t + i) * 5 + 9600) % 960,
        y = 330 - ((t * 18 + i * 43) % 320);
      ctx.strokeStyle = "#a9dfd55c";
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(x), Math.round(y), (i % 3) + 2, (i % 3) + 2);
    }
  }
  function draw(snapshot) {
    const pose = journeyPose(snapshot);
    const scenery =
      snapshot.scenery && snapshot.scenery !== "auto"
        ? snapshot.scenery
        : snapshot.chapter;
    const forest = scenery === "forest",
      coast = scenery === "coast";
    const castle = ["castle", "boss"].includes(scenery),
      finish = snapshot.chapter === "finish";
    const lighting = daylight(),
      palette = lighting.palette;
    canvas.dataset.daylight = lighting.phase;
    canvas.dataset.scenery = scenery;
    const boss = snapshot.chapter === "boss";
    // Keep the boss arena stationary while its health follows session progress.
    const scroll =
      (boss || finish
        ? ((snapshot.totalMs * 0.9) / 1000) * 66
        : pose.distance) || 0;
    rect(0, 0, 960, 420, palette.sky);
    rect(0, 162, 960, 175, palette.haze);
    if (lighting.night > 0) {
      ctx.globalAlpha = lighting.night;
      for (let i = 0; i < 44; i++) {
        const x = (i * 137 + 17) % 960,
          y = 35 + ((i * 53) % 115);
        rect(x, y, 2, 2, "#f0e8c9");
      }
      ctx.globalAlpha = 1;
    }
    const celestialY =
      lighting.phase === "sunset" ? 122 : lighting.phase === "dawn" ? 104 : 53;
    rect(
      759,
      celestialY,
      40,
      40,
      lighting.phase === "night" ? "#e7e5c6" : "#f3d49b",
    );
    rect(
      752,
      celestialY + 7,
      54,
      26,
      lighting.phase === "night" ? "#e7e5c6" : "#f3d49b",
    );
    if (lighting.phase === "night") {
      rect(777, celestialY - 3, 30, 25, palette.sky);
      rect(787, celestialY + 15, 20, 13, palette.sky);
    }
    for (let i = -1; i < 6; i++)
      cloud(
        i * 247 - ((scroll * 0.1) % 247),
        69 + (i % 3) * 19,
        0.8,
        palette.cloud,
      );
    for (let i = -1; i < 7; i++) {
      const x = i * 210 - ((scroll * 0.2) % 210);
      rect(x, 211 - (i % 2) * 28, 210, 125, palette.far);
      rect(x + 26, 184 - (i % 2) * 28, 150, 153, palette.far);
      rect(x + 52, 168 - (i % 2) * 28, 96, 169, palette.far);
    }
    if (scenery === "cave") {
      underground(scroll, pose.seconds);
    } else if (scenery === "ocean") {
      underwater(scroll, pose.seconds, lighting.phase === "night");
    } else if (coast) {
      rect(
        0,
        225,
        960,
        112,
        lighting.phase === "night" ? "#375872" : "#80b6b2",
      );
      for (let i = 0; i < 18; i++) {
        const x = i * 85 - ((scroll * 0.4) % 85);
        rect(
          x,
          245 + (i % 3) * 25,
          40,
          3,
          lighting.phase === "night" ? "#668897" : "#c0ded1",
        );
      }
      rect(0, 312, 960, 25, "#c3b28c");
    } else if (castle) {
      for (let i = -1; i < 4; i++) {
        const x = i * 380 - ((scroll * 0.35) % 380);
        rect(x, 179, 154, 158, "#51676b");
        rect(x + 14, 155, 27, 35, "#51676b");
        rect(x + 62, 155, 27, 35, "#51676b");
        rect(x + 111, 155, 27, 35, "#51676b");
        rect(x + 61, 252, 35, 85, "#354b54");
        rect(x + 64, 210, 25, 20, "#bac4a0");
      }
    } else
      for (let i = -1; i < 7; i++) {
        const x = i * 191 - ((scroll * 0.35) % 191);
        pine(
          x,
          forest ? 168 : 196,
          forest ? 1.4 : 1.1,
          palette.tree,
          "#7c8061",
        );
      }
    const undergroundScene = scenery === "cave",
      underwaterScene = scenery === "ocean";
    rect(
      0,
      ground,
      960,
      83,
      undergroundScene
        ? "#435151"
        : underwaterScene
          ? "#b8b18b"
          : palette.earth,
    );
    rect(
      0,
      ground,
      960,
      9,
      undergroundScene
        ? "#657374"
        : underwaterScene
          ? "#d1c79d"
          : palette.grass,
    );
    rect(
      0,
      ground + 9,
      960,
      7,
      undergroundScene
        ? "#354747"
        : underwaterScene
          ? "#a8a17e"
          : castle
            ? "#6d805b"
            : "#789964",
    );
    for (let i = -1; i < 35; i++) {
      const x = i * 34 - (scroll % 34);
      rect(
        x,
        ground + 26 + (i % 3) * 13,
        15,
        5,
        undergroundScene
          ? "#344647"
          : underwaterScene
            ? "#a5a180"
            : castle
              ? "#635c50"
              : "#9d8968",
      );
      if (i % 3 === 0 && !undergroundScene && !underwaterScene) {
        rect(x, ground - 7, 3, 7, palette.grass);
        rect(x + 5, ground - 4, 3, 4, palette.grass);
      }
    }
    if (scenery === "cave" && !boss && !finish) {
      const first = Math.max(0, Math.floor((pose.distance - 500) / 580));
      for (let i = first; i < first + 4; i++) {
        const x = heroX + 350 + i * 580 - pose.distance;
        rect(x - 90, 0, 220, ground - 43, "#203237");
        rect(x - 90, ground - 61, 220, 18, "#526466");
        for (let j = 0; j < 6; j++)
          rect(x - 83 + j * 37, ground - 58, 24, 5, "#607373");
      }
    }
    if (!boss && !finish && !["cave", "ocean"].includes(scenery)) {
      const first = Math.max(0, Math.floor((pose.distance - 500) / 580));
      for (let i = first; i < first + 4; i++) {
        const x = heroX + 350 + i * 580 - pose.distance;
        if (x > -100 && x < 1050) obstacle(x, i % 4, pose.seconds);
      }
      for (let i = 0; i < 4; i++) {
        const x = i * 310 - ((scroll * 0.8) % 310);
        rect(x, ground - 6, 3, 6, "#648855");
        rect(x - 3, ground - 9, 9, 4, i % 2 ? "#d5aa86" : "#e9d49a");
      }
    }
    if (boss) {
      const bx = heroX + 115 + Math.sin(pose.seconds * 3) * 3,
        by = ground - 87;
      rect(bx + 8, by + 17, 63, 65, "#8e7799");
      rect(bx, by + 30, 79, 37, "#8e7799");
      rect(bx + 10, by, 15, 24, "#bda6b0");
      rect(bx + 53, by, 15, 24, "#bda6b0");
      rect(bx + 17, by + 37, 14, 9, "#f5d3a4");
      rect(bx + 49, by + 37, 14, 9, "#f5d3a4");
      rect(bx + 30, by + 62, 20, 6, "#59465e");
      rect(bx + 5, ground - 8, 23, 8, "#5e506e");
      rect(bx + 52, ground - 8, 23, 8, "#5e506e");
      text("TRI HOAN", 480, 69, 13, "#eee2c8", "center");
      rect(330, 81, 300, 9, "#59616a");
      rect(330, 81, (300 * snapshot.bossHealth) / 100, 9, "#d8a5a6");
      text(
        `${Math.ceil(snapshot.bossHealth)}%`,
        480,
        108,
        11,
        "#d4d8c4",
        "center",
      );
      for (let i = 0; i < 5; i++)
        star(
          343 + i * 8,
          ground - 35 + (i % 3) * 12 - Math.sin(pose.seconds * 9) * 4,
          "#e7c992",
          1,
        );
    }
    if (finish) {
      const x = 450;
      rect(x, ground - 144, 5, 144, "#7a8c63");
      rect(x + 5, ground - 142, 72, 43, "#bc9a5d");
      rect(x + 11, ground - 135, 57, 29, "#e8d69b");
      star(x + 40, ground - 120, "#9b824e", 4);
      for (let i = 0; i < 24; i++)
        rect(
          90 + i * 33,
          100 + ((i * 47) % 170),
          4,
          7,
          ["#b5c78a", "#d3a383", "#ead593"][i % 3],
        );
      text("QUEST CLEAR", 610, 158, 23, "#4b654f", "center");
      text("BAN DA LAM DUOC!", 610, 182, 12, "#6e805e", "center");
    }
    const heroY = pose.swim
      ? ground - 145 + Math.sin(pose.seconds * 2.2) * 9
      : ground - 54 - pose.jump;
    ctx.globalAlpha = 0.13;
    rect(heroX - 12, ground - 3, 52, 4, "#152b31");
    ctx.globalAlpha = 1;
    if (pose.landing > 0) {
      for (let i = 0; i < 5; i++)
        rect(
          heroX - 15 + i * 14 + (i - 2) * (1 - pose.landing) * 12,
          ground - 5 - (1 - pose.landing) * 12,
          4,
          3,
          "#d6c6a2",
        );
    }
    hero(heroY, pose, snapshot);
    if (pose.swim) {
      for (let i = 0; i < 3; i++) {
        const age = (pose.seconds * 1.3 + i * 0.33) % 1;
        ctx.strokeStyle = "#c2e8df99";
        ctx.strokeRect(
          heroX + 35 + age * 15,
          heroY + 20 - age * 38,
          3 + age * 3,
          3 + age * 3,
        );
      }
    }
    if (previousScenery !== scenery) {
      if (previousScenery) transitionStart = snapshot.elapsedMs;
      previousScenery = scenery;
    }
    const transitionAge = (snapshot.elapsedMs - transitionStart) / 1000;
    if (transitionStart && transitionAge < 1.2) {
      ctx.globalAlpha = 0.17 * (1 - transitionAge / 1.2);
      rect(0, 0, 960, 420, "#edf0d5");
      ctx.globalAlpha = 1;
    }

    if (snapshot.status === "idle") {
      text("SAN SANG KHI BAN SAN SANG", 480, 389, 11, "#fff0cd", "center");
    } else if (snapshot.status === "paused") {
      rect(0, 0, 960, 420, "#1c302730");
      rect(367, 143, 226, 51, "#29453ee8");
      text("TAM DUNG MOT CHUT", 480, 173, 14, "#e9edcf", "center");
    } else
      text(
        finish
          ? "A LITTLE PROGRESS. A REAL WIN."
          : "YOU FOCUS. YOUR LITTLE HERO KEEPS GOING.",
        480,
        389,
        10,
        "#f2e7ca",
        "center",
      );
    canvas.dataset.action = pose.action;
    canvas.dataset.chapter = snapshot.chapter;
    canvas.dataset.status = snapshot.status;
    if (
      previousChapter !== snapshot.chapter ||
      previousStatus !== snapshot.status ||
      previousStatusScenery !== scenery
    ) {
      document.querySelector("#journey-status").textContent =
        snapshot.status === "idle"
          ? "Bạn bắt đầu làm, mình bắt đầu chạy."
          : snapshot.status === "paused"
            ? "Đã tạm dừng. Nhân vật đang đợi bạn."
            : finish
              ? "Boss đã bị đánh bại. Bạn đã hoàn thành phiên tập trung!"
              : boss
                ? "Nhân vật đang tự đánh boss. Cứ tiếp tục tập trung nhé."
                : scenery === "ocean"
                  ? "Đang bơi qua biển xanh. Bạn cứ tập trung, mình tự lo đường đi."
                  : scenery === "cave"
                    ? "Đang chui qua đường hầm pha lê. Từng bước nhỏ thôi nhé."
                    : `Đang đi qua ${(chapterNames[scenery] || "bờ biển").toLowerCase()}.`;
      previousChapter = snapshot.chapter;
      previousStatus = snapshot.status;
      previousStatusScenery = scenery;
    }
  }
  function loop() {
    const snap = getSnapshot();
    const key = `${Math.floor(Date.now() / 60000)}:${snap.status}:${snap.chapter}:${snap.scenery}:${Math.floor(snap.elapsedMs / 1000)}`;
    if (!reduced || key !== lastStaticKey) {
      draw(
        reduced
          ? { ...snap, elapsedMs: Math.floor(snap.elapsedMs / 1000) * 1000 }
          : snap,
      );
      lastStaticKey = key;
    }
    frame = requestAnimationFrame(loop);
  }
  frame = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(frame);
}
