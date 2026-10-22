export const quoteModes = {
  mixed: "Xen kẽ",
  cute: "Dễ thương",
  funny: "Hài hước",
  real: "Thực tế",
  push: "Thúc nhẹ",
};
const pools = {
  cute: [
    "Chưa cần làm xong. Mở file lên trước đã.",
    "Bạn làm một chút, mình chạy một đoạn. Cùng cố lên nhé!",
    "Chậm một chút cũng được. Mình vẫn đang tiến về phía trước.",
  ],
  funny: [
    "Làm 15 phút đi, rồi mình hoảng tiếp.",
    "Boss chưa đáng sợ bằng file tên final_final_v7.",
    "Não xin nghỉ, deadline xin chào. Mình xử lý từng việc nhé.",
  ],
  real: [
    "Động lực không phải lúc nào cũng tới trước. Làm một bước nhỏ trước đã.",
    "Chọn một việc có thể hoàn thành trong phiên này.",
    "Một đoạn nháp chưa hay vẫn hữu ích hơn một trang trắng.",
  ],
  push: [
    "Deadline vẫn đang tới. Xử lý một phần ngay bây giờ sẽ giúp bạn đỡ gấp hơn.",
    "Để mai thì công việc vẫn còn đó, thời gian lại ít hơn.",
    "Mười phút bắt đầu hôm nay có thể bớt một đêm chạy vội.",
  ],
};
export function focusQuote(mode, elapsedMs, offset = 0, status = "running") {
  if (status === "complete")
    return "Bạn đã dành thời gian cho điều quan trọng. Giờ nghỉ một chút, xứng đáng mà!";
  const list =
    mode === "mixed" || !pools[mode]
      ? [
          pools.cute[0],
          pools.funny[0],
          pools.real[0],
          pools.cute[1],
          pools.funny[1],
          pools.real[1],
        ]
      : pools[mode];
  return list[(Math.floor(elapsedMs / 60000) + offset) % list.length];
}
export function daylight(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const stops = [
    {
      at: 0,
      sky: "#d9e9dd",
      haze: "#eaf0d5",
      far: "#b7ceb0",
      tree: "#779a71",
      earth: "#b29b75",
      grass: "#92b274",
      cloud: "#f6f5df",
    },
    {
      at: 0.45,
      sky: "#dba598",
      haze: "#efd0a4",
      far: "#b39891",
      tree: "#777c6b",
      earth: "#ac836a",
      grass: "#a39b6d",
      cloud: "#f3c9b0",
    },
    {
      at: 0.75,
      sky: "#1f304b",
      haze: "#3b5067",
      far: "#334459",
      tree: "#355b55",
      earth: "#655b61",
      grass: "#728b70",
      cloud: "#57677e",
    },
    {
      at: 0.9,
      sky: "#29384f",
      haze: "#596376",
      far: "#475569",
      tree: "#45685d",
      earth: "#776b65",
      grass: "#8a9a72",
      cloud: "#76818f",
    },
    {
      at: 1,
      sky: "#e4c6ab",
      haze: "#f2e2bc",
      far: "#b8c4a1",
      tree: "#799276",
      earth: "#b29b75",
      grass: "#9cb87b",
      cloud: "#f9e9cc",
    },
  ];
  const b = stops.find((s) => s.at >= p) || stops.at(-1),
    a = stops[Math.max(0, stops.indexOf(b) - 1)];
  const amount = b.at === a.at ? 0 : (p - a.at) / (b.at - a.at);
  const blend = (x, y) =>
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(
          parseInt(x.slice(i, i + 2), 16) * (1 - amount) +
            parseInt(y.slice(i, i + 2), 16) * amount,
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("");
  const palette = Object.fromEntries(
    Object.keys(a)
      .filter((k) => k !== "at")
      .map((k) => [k, blend(a[k], b[k])]),
  );
  return {
    palette,
    phase: p < 0.3 ? "day" : p < 0.6 ? "sunset" : p < 0.93 ? "night" : "dawn",
    label:
      p < 0.3
        ? "Ban ngày"
        : p < 0.6
          ? "Hoàng hôn"
          : p < 0.93
            ? "Ban đêm"
            : "Bình minh",
    night: Math.max(0, Math.min(1, (p - 0.55) / 0.15, (0.96 - p) / 0.06)),
  };
}
