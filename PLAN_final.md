# PLAN_final.md — Webapp gợi ý lịch tập gym (bản chốt)

Nguồn: `PLAN_codex.md` (Codex) + `PLAN_review_opus.md` (Opus 5) + quyết định của Huy 2026-09-04.

---

## Quyết định đã chốt

| # | Câu hỏi | Chốt |
|---|---|---|
| 1 | Tuổi tối thiểu | **18+**, chặn cứng dưới 18 với thông báo tử tế |
| 2 | Số mục tiêu | **1 mục tiêu duy nhất** |
| 3 | Zod / RHF / RTL | **Bỏ cả 3** (theo Opus). Giữ Vite + React + TS + Vitest |
| 4 | Tính năng "đổi bài này" | **Có trong MVP** |
| 5 | Lưu / chia sẻ | **URL hash** (`#p=<base64>`), không localStorage |
| 6 | Ngôn ngữ dữ liệu | **Chỉ tiếng Việt** |
| 7 | Số bài MVP | **~30 bài**, phủ 100% movement pattern × 3 mức thiết bị |
| 8 | HLV duyệt | **Không** → disclaimer phải mạnh hơn, ngôn ngữ tham khảo, không mệnh lệnh |
| 9 | Hỏi chấn thương | **Có** — 3 checkbox: vai / lưng dưới / gối |
| 10 | Repo / base path | `huyinvestor87/gym` → `vite.config.ts` base `/gym/` |

---

## 1. Tech stack

```
Vite + React 18 + TypeScript      build tĩnh, type an toàn cho engine
CSS thuần 1 file + CSS variables  không CSS Modules, không UI framework
Vitest                            chỉ test src/engine/ (hàm thuần)
scripts/validate-data.mjs         chạy trong CI, thay Zod runtime
GitHub Actions -> GitHub Pages    typecheck + test + validate-data + build + deploy
```
Runtime deps: `react`, `react-dom`. Hết. **Bỏ:** react-hook-form, zod, @testing-library/*, react-router.

## 2. Cấu trúc thư mục

```
gym/
├── index.html
├── vite.config.ts            # base: '/gym/'
├── package.json
├── .github/workflows/deploy.yml
├── scripts/validate-data.mjs  # id duy nhất, enum hợp lệ, coverage pattern×equipment
├── src/
│   ├── main.tsx
│   ├── App.tsx               # useState<'search'|'plan'>, đọc/ghi URL hash
│   ├── types.ts              # toàn bộ type + constant
│   ├── data/
│   │   ├── exercises.json    # ~30 bài, chỉ tiếng Việt
│   │   └── templates.json
│   ├── engine/               # hàm thuần, KHÔNG import React
│   │   ├── bmi.ts
│   │   ├── validate.ts
│   │   ├── split.ts
│   │   ├── select.ts        # lọc + chấm điểm + fallback tự suy
│   │   ├── prescribe.ts     # set/rep/nghỉ/progression
│   │   ├── volume.ts        # cộng volume, ràng buộc theo thứ tự cứng
│   │   └── index.ts         # recommend(input) -> RecommendationResult
│   ├── ui/
│   │   ├── SearchForm.tsx
│   │   ├── PlanView.tsx
│   │   ├── SessionCard.tsx
│   │   └── VolumeSummary.tsx
│   └── styles.css           # + @media print
└── tests/
    ├── engine.test.ts
    ├── sweep.test.ts        # 1000+ tổ hợp × bộ invariant
    └── data.test.ts
```

## 3. Mô hình dữ liệu (bản đã sửa theo Opus)

```ts
type Goal = "muscle_gain" | "fat_loss" | "strength" | "endurance" | "general_fitness";

type MuscleGroup =
  | "chest" | "back" | "quads" | "hamstrings" | "glutes" | "calves"
  | "front_delts" | "side_delts" | "rear_delts" | "biceps" | "triceps" | "core";
// KHÔNG có "cardio" — cardio là blockType, không phải nhóm cơ

type Equipment = "minimal" | "dumbbell" | "full_gym";
type Experience = "beginner" | "intermediate" | "advanced";
type MovementPattern =
  | "squat" | "hinge" | "lunge" | "horizontal_push" | "vertical_push"
  | "horizontal_pull" | "vertical_pull" | "carry" | "core" | "isolation";

type Injury = "shoulder" | "lower_back" | "knee";

type UserInput = {
  age: number;              // 18–80, <18 chặn cứng
  weightKg: number;         // 30–300
  heightCm: number;         // 120–230
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
  sessionLengthMin: 30 | 45 | 60 | 75 | 90;   // mặc định 60
  goal: Goal;               // MỘT giá trị
  experience: Experience;
  equipment: Equipment;
  focusMuscles: MuscleGroup[];   // tùy chọn, tối đa 2
  injuries: Injury[];            // 3 checkbox
};

type Exercise = {
  id: string;
  name: string;                 // tiếng Việt
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  movementPattern: MovementPattern;
  equipment: Equipment;         // mức tối thiểu cần
  experience: Experience;       // mức tối thiểu phù hợp
  blockType: "strength" | "conditioning" | "mobility";
  loadingType: "reps" | "time" | "distance";
  impactLevel: "low" | "high";
  fatigueCost: 1 | 2 | 3;
  injuryFlags: Injury[];        // né khi user có chấn thương tương ứng
  instructions: string[];       // 3–5 bước, tiếng Việt
  alternatives?: string[];      // ưu tiên tùy chọn, fallback vẫn tự suy
};

type ExercisePrescription = {
  exerciseId: string;
  sets: number;
  target: { type: "reps" | "time"; min: number; max: number; unit: string };
  restSec: number;
  rirNote: string;
  role: "main" | "accessory" | "isolation";
};

type RecommendationResult = {
  sessions: { name: string; items: ExercisePrescription[]; estimatedDurationMin: number }[];
  weeklyVolume: Record<MuscleGroup, number>;  // đếm primary 1.0 + secondary 0.5
  seed: string;
  dataVersion: string;
  bmi: { value: number | null; note: string };
  notes: string[];          // khởi động, double progression, RIR, deload, chân trời 4–8 tuần, disclaimer
  warnings: string[];       // tuổi ≥50, không đạt sàn volume, 6 buổi ít hồi phục...
  ruleTrace: string[];
};
```

## 4. Thuật toán

```
validate(input)              # 18+, chặn <18, ranges
  -> bmi(input)              # <18 tuổi: không phân loại; BMI ≥30: cờ low-impact
  -> pickSplit(days, exp, goal)      # bảng mục 5; INVARIANT: freq ≥2/nhóm cơ khi days≥3
  -> buildSlots(template, goal, focusMuscles)   # slot = {pattern, muscle, role}
  -> filterExercises(equipment, exp, age, injuries, impactFlag)
  -> scoreAndPick(slots)     # score + seeded top-k sampling; fallback tự suy
  -> prescribe(goal, exp, age, role)   # bảng rep/set/nghỉ ĐÃ SỬA (mục 6)
  -> enforceConstraints()    # MỘT LƯỢT, thứ tự CỨNG:
                             #   1. trần thời lượng buổi (không bao giờ vi phạm)
                             #   2. trần volume/nhóm cơ/tuần
                             #   3. movement pattern bắt buộc
                             #   4. sàn volume (MỤC TIÊU — thiếu thì cảnh báo, KHÔNG ép thêm set)
  -> addNotes()              # progression, RIR, deload, chân trời, disclaimer, cảnh báo tuổi
  -> { sessions, weeklyVolume, seed, dataVersion, notes, warnings, ruleTrace }
```

Luật khoa học bắt buộc (từ Opus P0):
- **Sức bền**: 2–3 set × 15–25 rep, nghỉ 30–60s + 2–3 buổi aerobic 20–30 phút Zone 2. Ghi rõ là sức bền *cơ bắp*.
- **Giảm mỡ**: prescription ≈ tăng cơ (giữ tải để giữ cơ), giảm tổng volume tuần ~10–15%. Cardio tách riêng thành conditioning block 2–3 buổi × 20–30 phút. Bắt buộc hiện câu: *"Giảm mỡ chủ yếu đến từ chế độ ăn và tổng vận động hằng ngày; lịch tập này giúp giữ cơ trong quá trình đó. Ứng dụng không tư vấn dinh dưỡng."*
- **Tần suất ≥2/tuần/nhóm cơ** khi days≥3. Bỏ 3-day PPL khỏi MVP.
- **Progression = output hạng nhất**: double progression, RIR (mới 3–4, TB 1–3), xử lý chững (stall 2–3 buổi → giảm 10% tải), deload sau 6–10 tuần, chân trời "dùng 4–8 tuần rồi tạo lại".
- **Vai 3 phần** (front/side/rear), mỗi tuần ≥1 bài kéo ngang/rear-delt.
- **Volume đếm**: primary 1.0 + secondary 0.5. Người mới 6–10, TB 10–20 (nhắm 12–16), nâng cao trần 20.
- **Tuổi**: ≥50 → khởi động dài hơn, nghỉ +30s, ưu tiên máy/tạ đơn, tránh tải cột sống cao + động tác impact cao, +1 khối thăng bằng/tuần. Không giảm volume máy móc.
- **Chấn thương**: loại bài có `injuryFlags` trùng; vai → né overhead press nặng/dips; lưng dưới → né deadlift nặng/good morning; gối → né lunge sâu/leg extension nặng, ưu tiên box squat.

## 5. Bảng split (thay mục 4.3 Codex)

- **2 buổi**: Full Body A / B — 2x/nhóm cơ. Mức tối thiểu hiệu quả, compound + 1–2 accessory, cách ≥2 ngày.
- **3 buổi**: Full Body A / B / C — 3x. Mặc định mọi trình độ. Bỏ 3-day PPL.
- **4 buổi**: Upper / Lower / Upper / Lower — 2x. Buổi 3–4 dùng biến thể khác.
- **5 buổi**: Upper / Lower / Push / Pull / Legs — 2x. Người mới chọn 5 → hạ về Upper/Lower/Full/Upper/Lower + cảnh báo.
- **6 buổi**: PPL × 2 vòng — 2x. Chỉ mặc định cho TB/NC. Vòng B khác vòng A. Người mới chọn 6 → đề xuất mạnh 3–4 buổi.

## 6. Bảng prescription (đã sửa)

| Mục tiêu | Loại bài | Set | Rep | Nghỉ | RIR |
|---|---|---|---|---|---|
| Tăng cơ | Compound | 3–4 | 6–12 | 90–150s | 1–3 |
| Tăng cơ | Isolation | 2–4 | 10–15 | 60–90s | 0–2 |
| Giảm mỡ | Compound | 3–4 | 6–12 | 90–150s | 1–3 |
| Giảm mỡ | Isolation | 2–3 | 10–15 | 60–90s | 1–3 |
| Giảm mỡ | Conditioning | — | 20–30 phút × 2–3 buổi/tuần | — | — |
| Sức mạnh (TB/NC) | Compound chính | 3–5 | 3–6 | 180–300s | 2–3 |
| Sức mạnh (mới) | Compound chính | 3–5 | 5–8 | 150–210s | 3–4 |
| Sức mạnh | Bài phụ | 3–4 | 6–10 | 90–150s | 1–3 |
| Sức bền (mới) | Kháng lực | 2–3 | 15–25 | 30–60s | 1–3 |
| Sức bền (mới) | Aerobic | — | 20–30 phút Zone 2 × 2–3 | — | — |
| Thể lực chung | Compound | 2–3 | 6–12 | 90–120s | 2–3 |
| Thể lực chung | Bài phụ | 2–3 | 10–15 | 60–90s | 1–3 |

## 7. UX

- Form 1 trang: tuổi, cân nặng, chiều cao, số buổi/tuần, thời gian/buổi, mục tiêu (1), kinh nghiệm, thiết bị, nhóm cơ ưu tiên (0–2), chấn thương (3 checkbox). Validation viết tay.
- Trang kết quả: BMI + cảnh báo · lịch tuần theo buổi (SessionCard) · mỗi hàng bài có `<details>` mở hướng dẫn · nút "đổi bài này" (xoay top-3 fallback cùng pattern) · bảng VolumeSummary (set/nhóm cơ, tần suất, tổng thời gian) · notes progression · disclaimer.
- URL hash: encode `UserInput + seed` vào `#p=<base64>` → lưu/chia sẻ/chỉnh sửa.
- Bản in (`@media print`): thêm 2 cột trống "Tạ (kg)" / "Rep thực tế" cho mỗi set. Disclaimer trong bản in.
- Disclaimer 3 chỗ: dưới form, đầu trang kết quả, trong bản in. Ngôn ngữ tham khảo ("bạn có thể cân nhắc"), không mệnh lệnh y khoa, không hứa con số. Nêu đích danh các trường hợp hỏi bác sĩ trước (tim mạch, huyết áp, tiểu đường, chấn thương đang điều trị, mang thai/sau sinh, phẫu thuật <6 tháng, đau ngực/chóng mặt khi gắng sức, >1 năm không vận động).
- Footer: "Dành cho người từ 18 tuổi. Mọi tính toán chạy trên trình duyệt của bạn. Không dữ liệu nào được gửi đi."

## 8. Milestone (5 mốc)

| # | Nội dung | Kết quả | Ước lượng |
|---|---|---|---|
| M1 | Walking skeleton: Vite+TS+React, form thô, 1 template full-body, 10 bài, render lịch, CI + deploy Pages | Link chạy được | 0.5–1 ngày |
| M2 | Dữ liệu: types.ts, ~30 bài metadata đầy đủ tiếng Việt, 5 template, validate-data + test coverage | Data sạch, CI xanh | 2–3 ngày |
| M3 | Engine đầy đủ: bmi/validate/split/select/prescribe/volume + progression + luật tuổi + luật chấn thương + unit test + sweep 1000+ case | Thuật toán đúng | 2–3 ngày |
| M4 | UI hoàn chỉnh: form + validation + trang kết quả + VolumeSummary + đổi bài + expand hướng dẫn + URL hash + print stylesheet + a11y | Sản phẩm dùng được | 2–3 ngày |
| M5 | Hoàn thiện: disclaimer 3 chỗ, responsive, 3 golden plan review nội bộ, README, deploy | MVP phát hành | 1 ngày |

Tổng: 8–11 ngày công.

## 9. Bộ invariant cho sweep test

Đúng số buổi · không dùng thiết bị không có · không nhóm cơ nào vượt trần volume · mọi nhóm cơ được tập có tần suất ≥2 khi days≥3 · thời lượng ước tính ≤ trần user chọn · mọi exerciseId tồn tại · mỗi buổi ≥1 bài · không 2 bài cùng pattern liền kề trong buổi · user có chấn thương → không bài nào mang injuryFlag tương ứng.
