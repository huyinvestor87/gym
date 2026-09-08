import type { Session, Slot } from "../types";
const s = (
  exercise: string,
  sets: number,
  min: number,
  max: number,
  rest: number,
  extra: Partial<Slot> = {},
): Slot => ({ id: exercise, exercise, sets, min, max, rest, ...extra });
export const sessions: Session[] = [
  {
    id: "legs-a",
    name: "Chân A",
    en: "Legs A",
    focus: "Đùi trước / squat",
    note: "Squat có chốt an toàn. Khởi động tăng tải dần trước 3 working sets.",
    exercises: [
      s("squat", 3, 5, 8, 180, { restMax: 240 }),
      s("bulgarian", 3, 8, 12, 120, { perSide: true }),
      s("leg-press", 3, 8, 12, 120, { restMax: 180 }),
      s("extension", 2, 10, 15, 90, { maxSets: 3 }),
      s("curl-leg", 3, 10, 15, 90),
      s("calf", 3, 8, 15, 60, { restMax: 90 }),
    ],
  },
  {
    id: "chest",
    name: "Ngực",
    en: "Chest",
    focus: "Sức mạnh / tăng cơ",
    note: "Bench: 1 top set 4–6, sau đó hạ tải cho 2 back-off sets 6–8. Không cần single 90–100 kg mỗi buổi.",
    exercises: [
      s("bench", 3, 4, 6, 180, { bench: true, restMax: 240 }),
      s("incline", 3, 8, 12, 120, { restMax: 180 }),
      s("chest-press", 2, 8, 12, 120, { maxSets: 3 }),
      s("pec-deck", 2, 10, 15, 60, { maxSets: 3, restMax: 90 }),
      s("pullover", 2, 10, 15, 90),
      s("pressdown", 2, 10, 15, 60, { maxSets: 3, restMax: 90 }),
    ],
  },
  {
    id: "back-a",
    name: "Lưng A",
    en: "Back A",
    focus: "Độ rộng / kéo dọc",
    note: "Dùng trợ lực cho pull-up nếu cần để giữ rep và kỹ thuật. Row cáp là bài thêm tùy hồi phục.",
    exercises: [
      s("pull-up", 3, 5, 10, 120, { restMax: 180 }),
      s("pulldown", 3, 6, 10, 120),
      s("db-row", 3, 8, 12, 120, { perSide: true }),
      s("machine-row", 2, 8, 12, 120, { maxSets: 3 }),
      s("cable-row", 2, 8, 12, 120, {
        optional: true,
        note: "Bổ sung theo yêu cầu; không bắt buộc thêm volume.",
      }),
      s("straight-arm", 2, 12, 15, 60, { restMax: 90 }),
      s("face-pull", 3, 12, 20, 60, { restMax: 90 }),
      s("db-curl", 2, 8, 12, 60, { restMax: 90 }),
    ],
  },
  {
    id: "legs-b",
    name: "Chân B",
    en: "Legs B",
    focus: "Đùi sau / mông / gập hông",
    note: "Nếu lưng dưới mệt, giảm tải RDL hoặc đổi biến thể hip-hinge máy phù hợp. Chèn ngày nghỉ nếu chưa hồi phục.",
    exercises: [
      s("rdl", 3, 6, 10, 180),
      s("lunge", 2, 8, 12, 120, { maxSets: 3, perSide: true }),
      s("leg-press-high", 3, 10, 15, 120, { restMax: 180 }),
      s("curl-leg", 3, 8, 12, 90),
      s("extension", 2, 12, 15, 90),
      s("calf", 3, 10, 15, 60, { restMax: 90 }),
    ],
  },
  {
    id: "shoulders",
    name: "Vai",
    en: "Shoulders",
    focus: "Vai giữa / vai sau",
    note: "Vai trước đã nhận tải từ các bài đẩy ngực. Upright row nhẹ là tùy chọn; bỏ nếu vai khó chịu.",
    exercises: [
      s("db-shoulder", 3, 6, 10, 120, { restMax: 180 }),
      s("shoulder-press", 2, 8, 12, 120),
      s("lateral", 3, 10, 20, 60, { restMax: 90 }),
      s("machine-lateral", 2, 12, 20, 60, {
        note: "Thay Cable Lateral Raise bằng máy có sẵn; giữ 2 × 12–20.",
      }),
      s("reverse-deck", 3, 12, 20, 60, { restMax: 90 }),
      s("upright", 2, 10, 15, 90, { optional: true }),
      s("pressdown", 2, 10, 15, 60, { restMax: 90 }),
    ],
  },
  {
    id: "back-b",
    name: "Lưng B",
    en: "Back B",
    focus: "Độ dày / kéo ngang",
    note: "Giữ góc thân ở barbell row. Row máy là bài thêm tùy hồi phục; chọn grip row cáp khác buổi A.",
    exercises: [
      s("barbell-row", 3, 6, 10, 120, { restMax: 180 }),
      s("chest-db-row", 3, 8, 12, 120),
      s("machine-row", 2, 8, 12, 120, {
        optional: true,
        note: "Bổ sung theo yêu cầu; có thể bỏ để giữ volume gốc.",
      }),
      s("cable-row", 2, 8, 12, 120, { maxSets: 3 }),
      s("neutral-pulldown", 3, 8, 12, 120),
      s("shrug", 2, 10, 15, 90, { maxSets: 3 }),
      s("face-pull", 2, 15, 20, 60),
      s("hammer", 2, 10, 15, 60, { restMax: 90 }),
    ],
  },
];
export const repTarget = (slot: Slot, index: number) =>
  slot.bench && index > 0
    ? { min: 6, max: 8 }
    : { min: slot.min, max: slot.max };
export const restLabel = (seconds: number) =>
  seconds % 60 === 0 ? `${seconds / 60} phút` : `${seconds} giây`;
