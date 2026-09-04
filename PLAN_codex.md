# Kế hoạch triển khai webapp gợi ý lịch tập gym

## 1. Tech stack đề xuất

### Công nghệ chính

- **Vite + React + TypeScript**
  - Khởi tạo và build nhanh.
  - Component hóa form, lịch tập và thẻ bài tập thuận tiện.
  - TypeScript giúp kiểm soát schema dữ liệu và thuật toán rule-based.
  - Xuất ra website tĩnh, phù hợp với GitHub Pages.

- **CSS Modules hoặc CSS thuần**
  - Nhẹ, không cần thêm UI framework ở phiên bản đầu.
  - Dễ kiểm soát responsive và giao diện.
  - Có thể dùng CSS variables để quản lý màu sắc, khoảng cách và typography.

- **React Hook Form + Zod**
  - Quản lý form nhiều trường và thông báo lỗi.
  - Zod xác thực dữ liệu lúc chạy, đặc biệt hữu ích khi đọc JSON.
  - Có thể bỏ React Hook Form nếu muốn giảm dependency; dùng React state và Zod vẫn đủ.

- **Vitest**
  - Unit test thuật toán BMI và sinh lịch tập.
  - Tích hợp tốt với Vite và TypeScript.

- **React Testing Library**
  - Kiểm tra form, hành vi người dùng và kết quả render.

- **GitHub Actions + GitHub Pages**
  - Tự động lint, test, build và deploy khi merge vào nhánh chính.

### Nguyên tắc kỹ thuật

- Toàn bộ xử lý diễn ra trên trình duyệt.
- Không có backend, cơ sở dữ liệu hoặc tài khoản.
- Dữ liệu bài tập và template lưu trong các file JSON.
- Không gọi AI hoặc API bên ngoài ở phiên bản đầu.
- Kết quả có thể tái tạo: cùng dữ liệu đầu vào và cùng phiên bản dữ liệu sẽ tạo ra cùng một lịch.
- Chỉ lưu tùy chọn gần nhất vào `localStorage` nếu người dùng đồng ý.

---

## 2. Kiến trúc thư mục và các file chính

```text
gym-planner/
├── public/
│   ├── favicon.svg
│   └── assets/
│       └── exercise-placeholder.webp
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── pages/
│   │   ├── SearchPage.tsx
│   │   ├── PlanPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── components/
│   │   ├── search/
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── GoalSelector.tsx
│   │   │   └── EquipmentSelector.tsx
│   │   ├── plan/
│   │   │   ├── BmiSummary.tsx
│   │   │   ├── WeeklySchedule.tsx
│   │   │   ├── WorkoutSessionCard.tsx
│   │   │   └── ExerciseRow.tsx
│   │   └── common/
│   │       ├── Alert.tsx
│   │       ├── Button.tsx
│   │       └── FieldError.tsx
│   ├── data/
│   │   ├── exercises.json
│   │   └── workout-templates.json
│   ├── domain/
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── constants.ts
│   ├── services/
│   │   ├── bmi.ts
│   │   ├── recommendation.ts
│   │   ├── split-selector.ts
│   │   ├── exercise-selector.ts
│   │   └── prescription.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── seeded-random.ts
│   │   └── storage.ts
│   ├── styles/
│   │   ├── global.css
│   │   └── tokens.css
│   └── main.tsx
├── tests/
│   ├── bmi.test.ts
│   ├── split-selector.test.ts
│   ├── exercise-selector.test.ts
│   ├── prescription.test.ts
│   ├── recommendation.test.ts
│   └── fixtures/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Trách nhiệm chính

- `data/`: dữ liệu nội dung, không chứa logic.
- `domain/`: kiểu dữ liệu, schema kiểm tra và enum dùng chung.
- `services/`: thuật toán thuần, không phụ thuộc UI.
- `components/`: hiển thị và nhận tương tác.
- `pages/`: ghép các component thành màn hình.
- `tests/`: kiểm tra logic độc lập với giao diện.

---

## 3. Mô hình dữ liệu

### 3.1. Exercise

```ts
type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quadriceps"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "cardio";

type Equipment =
  | "bodyweight"
  | "dumbbell"
  | "barbell"
  | "bench"
  | "cable"
  | "machine"
  | "pull_up_bar"
  | "resistance_band"
  | "cardio_machine";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

type Exercise = {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  movementPattern:
    | "horizontal_push"
    | "vertical_push"
    | "horizontal_pull"
    | "vertical_pull"
    | "squat"
    | "hinge"
    | "lunge"
    | "carry"
    | "core"
    | "cardio";
  difficulty: ExperienceLevel;
  compound: boolean;
  unilateral: boolean;
  contraindicationTags?: string[];
  alternatives?: string[];
  defaultRestSeconds?: number;
  notes?: string[];
};
```

Ví dụ:

```json
{
  "id": "dumbbell-bench-press",
  "name": "Dumbbell Bench Press",
  "description": "Bài đẩy ngực với tạ đơn.",
  "instructions": [
    "Nằm ổn định trên ghế và giữ bàn chân trên sàn.",
    "Hạ tạ có kiểm soát.",
    "Đẩy tạ lên mà không khóa khuỷu quá mạnh."
  ],
  "primaryMuscles": ["chest"],
  "secondaryMuscles": ["triceps", "shoulders"],
  "equipment": ["dumbbell", "bench"],
  "movementPattern": "horizontal_push",
  "difficulty": "beginner",
  "compound": true,
  "unilateral": false,
  "alternatives": ["push-up", "machine-chest-press"],
  "defaultRestSeconds": 90
}
```

### 3.2. Workout template

Template mô tả cấu trúc buổi tập, chưa gắn cứng với bài cụ thể.

```ts
type Goal =
  | "fat_loss"
  | "muscle_gain"
  | "general_fitness"
  | "strength"
  | "focus_chest"
  | "focus_back"
  | "focus_legs"
  | "full_body";

type WorkoutTemplate = {
  id: string;
  name: string;
  supportedDaysPerWeek: number[];
  supportedGoals: Goal[];
  supportedExperience: ExperienceLevel[];
  sessions: Array<{
    key: string;
    name: string;
    musclePriorities: Array<{
      muscle: MuscleGroup;
      priority: number;
    }>;
    movementRequirements: Array<{
      pattern: Exercise["movementPattern"];
      count: number;
      required: boolean;
    }>;
    exerciseCount: {
      min: number;
      max: number;
    };
    notes?: string[];
  }>;
};
```

Các template ban đầu:

| Số buổi | Split mặc định |
|---:|---|
| 2 | Full Body A / Full Body B |
| 3 | Full Body A / B / C hoặc Push / Pull / Legs |
| 4 | Upper / Lower / Upper / Lower |
| 5 | Upper / Lower / Push / Pull / Legs |
| 6 | Push / Pull / Legs lặp lại hai vòng |

Nên có biến thể ưu tiên mục tiêu, chẳng hạn `3-day-full-body`, `3-day-ppl`, `4-day-upper-lower` và `6-day-ppl`.

### 3.3. User input

```ts
type Gender = "male" | "female" | "other" | "prefer_not_to_say";

type EquipmentProfile = "full_gym" | "home" | "minimal";

type UserInput = {
  age: number;
  weightKg: number;
  heightCm: number;
  gender: Gender;
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
  goals: Goal[];
  focusMuscles: MuscleGroup[];
  experience: ExperienceLevel;
  equipmentProfile: EquipmentProfile;
  selectedEquipment?: Equipment[];
};
```

### 3.4. Kết quả gợi ý

```ts
type ExercisePrescription = {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string[];
};

type WorkoutSession = {
  id: string;
  dayLabel: string;
  name: string;
  exercises: ExercisePrescription[];
  estimatedDurationMinutes: number;
  notes: string[];
};

type RecommendationResult = {
  bmi: {
    value: number;
    category: string;
    notices: string[];
  };
  summary: string;
  sessions: WorkoutSession[];
  globalNotes: string[];
  ruleTrace?: string[];
};
```

`ruleTrace` chỉ bật trong môi trường phát triển để giải thích vì sao hệ thống chọn template hoặc bài tập.

### 3.5. Quy tắc validation

- Tuổi: khoảng hợp lệ dự kiến `16–80`.
- Cân nặng: `30–300 kg`.
- Chiều cao: `120–230 cm`.
- Số buổi: `2–6`.
- Phải chọn ít nhất một mục tiêu hoặc nhóm cơ ưu tiên.
- Không cho phép `NaN`, số âm hoặc giá trị rỗng.
- Nếu ngoài phạm vi hỗ trợ, không sinh lịch tự động và hiển thị hướng dẫn phù hợp.
- Giới tính được thu thập để phục vụ khả năng mở rộng; phiên bản đầu không nên dùng giới tính để áp dụng định kiến về bài tập hay cường độ.

---

## 4. Thuật toán gợi ý lịch tập rule-based

## 4.1. Pipeline tổng quát

```text
Kiểm tra input
    ↓
Tính BMI và thông báo cơ bản
    ↓
Chuẩn hóa mục tiêu, nhóm cơ và thiết bị
    ↓
Chọn split theo số buổi + kinh nghiệm + mục tiêu
    ↓
Tạo yêu cầu bài tập cho từng buổi
    ↓
Lọc bài theo thiết bị và độ khó
    ↓
Chấm điểm, chọn bài và loại trùng không cần thiết
    ↓
Gán set, rep, nghỉ và ghi chú
    ↓
Kiểm tra khối lượng toàn tuần
    ↓
Trả lịch tập cùng cảnh báo và phương án thay thế
```

### 4.2. Tính BMI

```text
BMI = cân nặng (kg) / (chiều cao mét × chiều cao mét)
```

Phân loại tham khảo cho người trưởng thành:

- `< 18.5`: nhẹ cân.
- `18.5–24.9`: khoảng cân nặng thường dùng để tham khảo.
- `25.0–29.9`: thừa cân.
- `≥ 30`: béo phì theo phân loại BMI phổ biến.

Nguyên tắc hiển thị:

- Làm tròn một chữ số thập phân.
- Nêu rõ BMI chỉ là chỉ số sàng lọc, không đánh giá trực tiếp tỷ lệ mỡ, cơ bắp hay tình trạng sức khỏe.
- Không dùng BMI để tự động tăng hoặc giảm mạnh cường độ tập.
- Với người dưới 18 tuổi, không áp dụng ngưỡng BMI người trưởng thành; yêu cầu tham khảo chuyên gia và không đưa ra kết luận phân loại.
- Hiển thị cảnh báo chung nếu người dùng có triệu chứng, bệnh nền, chấn thương, đang mang thai hoặc lâu không vận động: nên hỏi chuyên gia y tế trước khi bắt đầu.
- Tránh ngôn ngữ chẩn đoán hoặc cam kết giảm cân/tăng cơ.

### 4.3. Chọn split theo số buổi

#### Hai buổi

- Full Body A / Full Body B.
- Phù hợp mặc định với người mới hoặc ít thời gian.
- Mỗi buổi bao phủ: squat/lunge, hinge, push, pull và core.
- Bố trí cách nhau ít nhất 1–2 ngày nếu có thể.

#### Ba buổi

- Người mới: ưu tiên Full Body A / B / C.
- Trung bình hoặc nâng cao, mục tiêu nhóm cơ rõ: có thể chọn Push / Pull / Legs.
- Mục tiêu toàn thân hoặc thể lực chung: giữ Full Body.
- Lịch gợi ý: thứ 2, thứ 4, thứ 6 hoặc tương đương.

#### Bốn buổi

- Upper / Lower / Upper / Lower.
- Hai buổi upper và lower có biến thể khác nhau để tránh lặp hoàn toàn.
- Lịch gợi ý: hai ngày tập, một ngày nghỉ, hai ngày tập.

#### Năm buổi

- Upper / Lower / Push / Pull / Legs.
- Không mặc định dùng “một nhóm cơ mỗi ngày” vì tần suất mỗi nhóm có thể quá thấp.
- Nếu mục tiêu giảm mỡ, có thể thêm conditioning ngắn vào 1–2 buổi thay vì tạo một buổi cardio quá nặng.

#### Sáu buổi

- Push / Pull / Legs lặp lại hai vòng.
- Chỉ nên đề xuất mặc định cho người trung bình hoặc nâng cao.
- Nếu người mới chọn 6 buổi, giảm khối lượng từng buổi và hiển thị khuyến nghị bắt đầu với 3–4 buổi.
- Phân biệt vòng A và B: bài chính, rep range hoặc biến thể khác nhau.

### 4.4. Điều chỉnh theo mục tiêu

Nếu có nhiều mục tiêu:

1. Mục tiêu cụ thể do người dùng đánh dấu chính.
2. Nhóm cơ ưu tiên.
3. Mục tiêu thể lực chung.
4. Mục tiêu phụ.

Quy tắc:

- **Tăng cơ:** ưu tiên mức rep trung bình, đủ volume mỗi tuần, đa số bài cách thất bại kỹ thuật khoảng 1–3 rep.
- **Sức mạnh:** bài compound chính có rep thấp hơn và nghỉ dài hơn; hạn chế áp dụng cho người mới tuyệt đối.
- **Giảm mỡ:** vẫn duy trì bài kháng lực; thêm vận động/cardio vừa phải và giảm thời gian nghỉ ở bài phụ khi hợp lý.
- **Toàn thân:** cân bằng movement pattern và nhóm cơ.
- **Ưu tiên ngực/lưng/chân:** tăng điểm chọn bài và volume của nhóm đó, nhưng không loại bỏ hoàn toàn nhóm đối kháng.

### 4.5. Ánh xạ thiết bị

```text
full_gym:
  bodyweight, dumbbell, barbell, bench, cable,
  machine, pull_up_bar, resistance_band, cardio_machine

home:
  bodyweight, dumbbell, bench, resistance_band, pull_up_bar
  + chỉ giữ thiết bị người dùng xác nhận có

minimal:
  bodyweight
  + resistance_band hoặc dumbbell nếu người dùng xác nhận
```

Bài tập hợp lệ khi:

- Mọi thiết bị bắt buộc của bài đều có sẵn.
- Độ khó không vượt quá khả năng dự kiến.
- Không trùng movement pattern quá nhiều trong cùng buổi.
- Không thuộc tag cần tránh nếu sau này bổ sung thông tin chấn thương.

Nếu không tìm được bài:

1. Tìm bài thay thế từ `alternatives`.
2. Hạ yêu cầu thiết bị.
3. Chọn biến thể bodyweight.
4. Nếu vẫn không có, bỏ slot và ghi rõ thiếu thiết bị phù hợp.

### 4.6. Chấm điểm và chọn bài

Mỗi bài hợp lệ nhận điểm:

```text
score =
  điểm khớp nhóm cơ chính
  + điểm khớp movement pattern
  + điểm nhóm cơ ưu tiên
  + điểm phù hợp kinh nghiệm
  + điểm compound cho bài đầu buổi
  + điểm đa dạng so với các buổi trước
  - phạt trùng bài
  - phạt trùng movement pattern
  - phạt vượt độ khó
  - phạt yêu cầu thiết bị không chắc chắn
```

Thứ tự chọn trong mỗi buổi:

1. Bài compound chính.
2. Movement pattern đối trọng hoặc nhóm cơ lớn khác.
3. Bài compound/phụ thứ hai.
4. Bài isolation theo nhóm cơ ưu tiên.
5. Core hoặc conditioning nếu template yêu cầu.

Giới hạn ban đầu:

- Người mới: khoảng 4–6 bài/buổi.
- Trung bình: khoảng 5–7 bài/buổi.
- Nâng cao: khoảng 6–8 bài/buổi.
- Tránh nhiều hơn hai bài rất giống nhau cho cùng nhóm cơ trong một buổi.
- Không lặp đúng một bài quá hai lần mỗi tuần, trừ các bài nền tảng trong template toàn thân.

### 4.7. Set, rep và thời gian nghỉ

| Mục tiêu | Loại bài | Set | Rep | Nghỉ |
|---|---|---:|---:|---:|
| Tăng cơ | Compound | 3–4 | 6–12 | 90–150 giây |
| Tăng cơ | Isolation | 2–4 | 10–15 | 60–90 giây |
| Sức mạnh | Compound chính | 3–5 | 3–6 | 180–300 giây |
| Sức mạnh | Bài phụ | 3–4 | 6–10 | 90–150 giây |
| Giảm mỡ | Kháng lực | 2–4 | 8–15 | 45–90 giây |
| Thể lực chung | Compound | 2–3 | 6–12 | 90–120 giây |
| Thể lực chung | Bài phụ | 2–3 | 10–15 | 60–90 giây |

Điều chỉnh theo kinh nghiệm:

- **Mới:** phần thấp của khoảng set; ưu tiên kỹ thuật và bài ổn định.
- **Trung bình:** dùng mức set tiêu chuẩn.
- **Nâng cao:** có thể tăng một set cho nhóm cơ ưu tiên, nhưng vẫn phải kiểm tra tổng volume.
- Bài unilateral: rep được ghi theo mỗi bên.
- Bài plank/carry/cardio: dùng thời gian hoặc quãng đường thay vì rep.

### 4.8. Kiểm soát volume và hồi phục

Sau khi tạo lịch, tính tổng set trực tiếp cho từng nhóm cơ:

- Người mới: mục tiêu khởi đầu khoảng 6–10 set/nhóm cơ/tuần.
- Trung bình: khoảng 8–16 set.
- Nâng cao: có thể cao hơn nhưng phiên bản đầu nên đặt trần bảo thủ.
- Nhóm cơ ưu tiên nhận thêm khoảng 2–4 set mỗi tuần.
- Không tăng volume chỉ vì người dùng chọn nhiều ngày tập.
- Tránh xếp hai buổi nặng cho cùng nhóm cơ liền nhau.
- Khi vượt trần, loại dần bài phụ có điểm thấp nhất.
- Khi thiếu volume, thêm set trước khi thêm quá nhiều bài mới.

### 4.9. Ghi chú tự động

Mỗi buổi nên có:

- Khởi động 5–10 phút và thực hiện set khởi động cho bài chính.
- Ưu tiên kỹ thuật; dừng nếu đau bất thường.
- Chọn mức tạ cho phép hoàn thành rep với form ổn định.
- Tăng tải từ từ khi hoàn thành mức rep cao nhất trong mọi set.
- Nghỉ thêm nếu kỹ thuật hoặc nhịp thở chưa hồi phục.
- Có ít nhất một ngày nghỉ/hoạt động nhẹ phù hợp với split.

---

## 5. Các màn hình UI và luồng người dùng

## 5.1. Trang Search

### Nội dung

- Tiêu đề và mô tả ngắn.
- Form chia thành các nhóm:
  - Thông tin cơ thể: tuổi, cân nặng, chiều cao, giới tính.
  - Thói quen: số buổi tập mỗi tuần.
  - Mục tiêu chính.
  - Nhóm cơ muốn ưu tiên.
  - Kinh nghiệm.
  - Môi trường và thiết bị.
- Nút “Tạo lịch tập”.
- Ghi chú rằng kết quả mang tính tham khảo, không thay thế tư vấn chuyên môn.

### Hành vi

- Validate khi người dùng rời trường và khi submit.
- Hiển thị đơn vị rõ ràng: `kg`, `cm`, `buổi/tuần`.
- Nếu chọn “tại nhà” hoặc “tối thiểu”, mở danh sách thiết bị chi tiết.
- Không cho submit khi dữ liệu không hợp lệ.
- Giữ lại dữ liệu form khi quay lại từ trang kết quả.

## 5.2. Trang kết quả lịch tập

### Phần tổng quan

- BMI và diễn giải ngắn.
- Mục tiêu, trình độ và số buổi đã chọn.
- Tên split được đề xuất.
- Lý do ngắn: ví dụ “Upper/Lower giúp tập mỗi nhóm cơ khoảng hai lần mỗi tuần với bốn buổi”.

### Lịch tuần

- Desktop: dạng lưới hoặc timeline theo ngày.
- Mobile: danh sách card theo buổi.
- Mỗi buổi hiển thị:
  - Tên buổi.
  - Nhóm cơ chính.
  - Thời lượng ước tính.
  - Bài tập.
  - Set × rep hoặc thời gian.
  - Nghỉ.
  - Ghi chú kỹ thuật ngắn.
  - Bài thay thế nếu có.

### Hành động

- “Chỉnh sửa thông tin”.
- “Tạo lại biến thể” nếu có cơ chế chọn bài bằng seeded random.
- “In/Lưu PDF” bằng `window.print()` và print stylesheet.
- “Xóa dữ liệu đã lưu” nếu dùng `localStorage`.

## 5.3. Trạng thái lỗi và dữ liệu trống

- Không tải được JSON: thông báo lỗi cấu hình, không sinh lịch thiếu dữ liệu.
- Không có bài phù hợp với thiết bị: hiển thị slot chưa đáp ứng và gợi ý thiết bị hoặc bài thay thế.
- URL trang kết quả nhưng không có input: điều hướng về Search.
- Dữ liệu JSON sai schema: phát hiện sớm khi khởi động và ghi lỗi rõ trong môi trường phát triển.

## 5.4. Luồng người dùng

```text
Mở trang Search
    ↓
Nhập và xác nhận thông tin
    ↓
Submit form
    ↓
Validate dữ liệu
    ├── Không hợp lệ → Hiển thị lỗi ngay tại trường
    └── Hợp lệ
           ↓
       Tính BMI và sinh lịch
           ↓
       Hiển thị trang kết quả
           ├── Chỉnh sửa → Quay lại form có dữ liệu cũ
           ├── Tạo biến thể → Sinh lại danh sách bài
           └── In/Lưu PDF
```

---

## 6. Kế hoạch implementation theo milestone

### Milestone 1 — Khởi tạo dự án

- Tạo Vite React TypeScript.
- Thiết lập lint, format, Vitest và React Testing Library.
- Thiết lập CSS tokens và responsive breakpoint.
- Cấu hình `base` của Vite cho GitHub Pages.
- Tạo workflow chạy lint, test và build.

**Kết quả:** ứng dụng mẫu build và deploy được lên GitHub Pages.

### Milestone 2 — Định nghĩa domain và dữ liệu

- Tạo toàn bộ TypeScript types.
- Tạo schema Zod cho input, exercise và template.
- Xác định enum nhóm cơ, thiết bị, mục tiêu và movement pattern.
- Nhập bộ dữ liệu MVP khoảng 40–60 bài:
  - Đủ cho full gym, home và minimal.
  - Bao phủ các movement pattern chính.
  - Có ít nhất một phương án thay thế cho bài quan trọng.
- Tạo template cho 2–6 buổi.
- Viết script/test xác minh ID duy nhất và các reference hợp lệ.

**Kết quả:** dữ liệu có cấu trúc, đọc được và vượt qua validation.

### Milestone 3 — BMI và validation input

- Viết hàm tính BMI thuần.
- Viết hàm phân loại và tạo thông báo.
- Xử lý riêng người dưới 18 tuổi.
- Viết validation cho toàn bộ form.
- Thêm unit test cho giá trị biên và dữ liệu sai.

**Kết quả:** lớp tính toán cơ bản hoạt động độc lập với UI.

### Milestone 4 — Chọn split

- Ánh xạ số buổi sang danh sách template ứng viên.
- Chấm điểm template theo kinh nghiệm và mục tiêu.
- Xử lý trường hợp người mới chọn 5–6 buổi.
- Sinh nhãn ngày tập và phân bổ ngày nghỉ tham khảo.
- Viết test dạng bảng cho mọi tổ hợp chính.

**Kết quả:** mỗi input hợp lệ nhận được split phù hợp và có thể giải thích.

### Milestone 5 — Chọn bài tập

- Lọc bài theo thiết bị.
- Lọc hoặc phạt bài vượt độ khó.
- Chọn bài theo muscle priority và movement requirement.
- Thêm quy tắc đa dạng và chống trùng.
- Thêm fallback qua `alternatives`.
- Dùng seeded random chỉ để phá hòa giữa các bài bằng điểm.
- Viết test cho full gym, home và minimal.

**Kết quả:** từng session có danh sách bài hợp lệ với thiết bị.

### Milestone 6 — Kê đơn set, rep và nghỉ

- Gán prescription theo mục tiêu và loại bài.
- Điều chỉnh theo trình độ.
- Tính tổng set theo nhóm cơ.
- Cân chỉnh volume khi quá thấp hoặc quá cao.
- Tính thời lượng buổi tập gần đúng.
- Viết test cho rep range, rest range và volume cap.

**Kết quả:** lịch hoàn chỉnh, nhất quán và có giới hạn tải bảo thủ.

### Milestone 7 — Xây dựng trang Search

- Tạo form responsive.
- Thêm thông báo lỗi dễ hiểu.
- Tạo selector cho mục tiêu, nhóm cơ và thiết bị.
- Bổ sung accessibility:
  - Label đầy đủ.
  - Điều khiển bằng bàn phím.
  - Focus state rõ ràng.
  - Error text liên kết bằng `aria-describedby`.

**Kết quả:** người dùng nhập và submit được mọi thông tin yêu cầu.

### Milestone 8 — Xây dựng trang kết quả

- Hiển thị BMI summary.
- Hiển thị lý do chọn split.
- Hiển thị lịch theo từng buổi.
- Hiển thị set, rep, nghỉ và ghi chú.
- Thêm hành động chỉnh sửa, tạo biến thể và in.
- Tạo print stylesheet.

**Kết quả:** lịch dễ đọc trên mobile, desktop và bản in.

### Milestone 9 — Hoàn thiện và triển khai

- Thêm trạng thái loading/error dù dữ liệu là local.
- Kiểm tra schema JSON lúc khởi động.
- Kiểm tra bundle size và hiệu năng.
- Hoàn thiện README:
  - Chạy local.
  - Cấu trúc dữ liệu.
  - Cách thêm bài tập.
  - Quy tắc recommendation.
  - Cách deploy.
- Chạy toàn bộ test và kiểm thử thủ công.
- Deploy bản MVP lên GitHub Pages.

**Kết quả:** phiên bản MVP tĩnh có thể phát hành.

---

## 7. Kế hoạch kiểm thử

## 7.1. Unit test thuật toán

### BMI

- Chiều cao được đổi đúng từ cm sang m.
- Làm tròn đúng một chữ số.
- Kiểm tra các ngưỡng `18.5`, `25.0`, `30.0`.
- Không chia cho `0`.
- Không phân loại người dưới 18 bằng ngưỡng người trưởng thành.
- Từ chối tuổi, cân nặng và chiều cao ngoài phạm vi.

### Chọn split

Dùng table-driven tests:

- 2 buổi luôn tạo hai Full Body session.
- Người mới, 3 buổi ưu tiên Full Body.
- Trung bình, 3 buổi và mục tiêu nhóm cơ có thể chọn PPL.
- 4 buổi chọn Upper/Lower.
- 5 buổi tạo đúng năm session.
- 6 buổi tạo PPL hai vòng.
- Mọi template trả về đúng số buổi được yêu cầu.

### Chọn bài

- Không trả bài cần thiết bị không có.
- Mỗi session đáp ứng các movement pattern bắt buộc.
- Người mới không nhận bài chỉ dành cho nâng cao nếu còn phương án khác.
- Nhóm cơ ưu tiên nhận điểm và volume cao hơn.
- Không chọn trùng một bài quá giới hạn.
- Fallback hoạt động khi không còn bài chính.
- Cùng seed và input sinh cùng kết quả.

### Set, rep và nghỉ

- Rep range phù hợp mục tiêu.
- Compound nghỉ lâu hơn isolation khi phù hợp.
- Sức mạnh có rep thấp và nghỉ dài hơn tăng cơ.
- Người mới nhận volume thấp hơn hoặc bằng trung bình.
- Tổng set không vượt trần cấu hình.
- Bài unilateral có ghi chú “mỗi bên”.

### Test tích hợp recommendation

Tạo các fixture đại diện:

1. Người mới, 2 buổi, minimal, toàn thân.
2. Người mới, 3 buổi, home, giảm mỡ.
3. Trung bình, 4 buổi, full gym, tăng cơ.
4. Trung bình, 5 buổi, ưu tiên chân.
5. Nâng cao, 6 buổi, full gym, tăng cơ.
6. Input biên nhưng hợp lệ.
7. Input không hợp lệ.
8. Thiết bị quá hạn chế để đáp ứng một slot.

Với mỗi fixture, kiểm tra invariant thay vì snapshot toàn bộ lịch:

- Đúng số buổi.
- Có bài trong giới hạn quy định.
- Thiết bị hợp lệ.
- Set, rep và nghỉ hợp lệ.
- Có nhóm cơ/movement pattern bắt buộc.
- Không vượt volume cap.
- Không có ID bài không tồn tại.

## 7.2. Kiểm thử component

- Form hiển thị lỗi đúng vị trí.
- Submit hợp lệ gọi recommendation một lần.
- Thay đổi môi trường thiết bị cập nhật danh sách lựa chọn.
- Trang kết quả render đủ session.
- Nút chỉnh sửa giữ lại dữ liệu.
- Trạng thái lỗi JSON hiển thị thông báo phù hợp.
- Các control có accessible name.

## 7.3. Kiểm thử thủ công UI

### Thiết bị và trình duyệt

- Chrome, Firefox, Safari và Edge phiên bản hiện hành.
- Mobile khoảng `320–430 px`.
- Tablet khoảng `768 px`.
- Desktop từ `1280 px`.
- Kiểm tra zoom `200%`.

### Checklist

- Không có horizontal scroll trên mobile.
- Form sử dụng hoàn toàn bằng bàn phím.
- Focus không bị mất khi xuất hiện lỗi.
- Màu chữ và nền đạt tương phản phù hợp.
- Card lịch vẫn dễ đọc với tên bài dài.
- Bản in không có nút điều hướng thừa.
- Refresh trang Search không gây lỗi.
- GitHub Pages xử lý đường dẫn trực tiếp đúng.
- Không có dữ liệu nhạy cảm bị gửi qua mạng.
- `localStorage` được xóa đúng khi người dùng yêu cầu.

## 7.4. Kiểm tra chất lượng dữ liệu

- ID bài duy nhất.
- `alternatives` đều trỏ tới ID tồn tại.
- Tất cả bài có nhóm cơ chính.
- Tất cả bài có thiết bị và movement pattern.
- Mỗi tổ hợp thiết bị có đủ bài cho các pattern quan trọng.
- Template không tham chiếu enum không tồn tại.
- Nội dung tiếng Việt thống nhất thuật ngữ và đơn vị.

---

## 8. Rủi ro, giả định và phần cần làm rõ

## 8.1. Rủi ro

### Gợi ý không phù hợp với tình trạng sức khỏe

Form hiện không hỏi về chấn thương, bệnh nền, thai kỳ hoặc hạn chế vận động. Lịch chỉ nên được mô tả là gợi ý tham khảo. Không được tự nhận là chẩn đoán hay giáo án y khoa.

**Giảm thiểu:**

- Hiển thị disclaimer rõ nhưng không gây hoảng sợ.
- Khuyến cáo dừng nếu có đau bất thường.
- Ở phiên bản sau, thêm câu hỏi tùy chọn về hạn chế vận động và tag chống chỉ định.

### BMI dễ bị hiểu sai

BMI không phân biệt cơ và mỡ, đặc biệt thiếu chính xác với một số vận động viên hoặc nhóm dân số.

**Giảm thiểu:**

- Chỉ dùng làm thông tin tham khảo.
- Không để BMI quyết định trực tiếp volume hoặc độ khó.
- Không dùng ngôn ngữ phán xét hình thể.

### Rule-based trở nên phức tạp

Số tổ hợp mục tiêu, thiết bị, trình độ và số ngày tăng nhanh. Các rule rời rạc có thể xung đột.

**Giảm thiểu:**

- Chia pipeline thành các hàm thuần.
- Dùng scoring thay cho chuỗi `if/else` dài.
- Định nghĩa priority rõ ràng.
- Kiểm tra invariant sau khi tạo lịch.
- Có `ruleTrace` trong development.

### Dữ liệu bài tập thiếu hoặc không đồng nhất

Nếu JSON không đủ bài cho thiết bị tối thiểu, thuật toán có thể tạo lịch mất cân bằng.

**Giảm thiểu:**

- Đặt coverage test cho từng movement pattern.
- Yêu cầu bài thay thế cho các bài quan trọng.
- Validate JSON ở thời điểm build/test.

### Sáu buổi có thể quá tải

Số ngày tập không đồng nghĩa người dùng có khả năng hồi phục tương ứng.

**Giảm thiểu:**

- Giảm volume mỗi buổi.
- Cảnh báo bảo thủ cho người mới.
- Phân bổ ngày nghỉ và không ép tập đến thất bại.
- Không tự động tăng tổng volume tuyến tính theo số buổi.

### Giới hạn của website tĩnh

Không có đồng bộ nhiều thiết bị, theo dõi tiến độ hoặc điều chỉnh lịch dựa trên lịch sử.

**Giảm thiểu:**

- Xác định đây là giới hạn MVP.
- Thiết kế domain độc lập để có thể thêm backend sau này.
- Chỉ dùng `localStorage` cho tiện ích ngắn hạn.

### Routing trên GitHub Pages

SPA route trực tiếp có thể trả về `404`.

**Giảm thiểu:**

- MVP có thể dùng hash routing.
- Hoặc triển khai fallback `404.html` nếu cần URL sạch.
- Thiết lập chính xác `base` theo tên repository.

## 8.2. Giả định

- Đối tượng chính là người trưởng thành khỏe mạnh, có khả năng tự tập luyện cơ bản.
- Người dùng nhập đơn vị metric: kg và cm.
- Người dùng chọn từ 2 đến 6 buổi mỗi tuần.
- Một buổi kéo dài khoảng 35–90 phút.
- Mục tiêu “giảm mỡ” chỉ ảnh hưởng cấu trúc vận động; ứng dụng chưa đưa ra chế độ ăn.
- Giới tính không làm thay đổi lựa chọn bài, set hoặc rep trong MVP.
- Người dùng tự chọn mức tạ; ứng dụng không kê tải trọng tuyệt đối.
- Dữ liệu bài tập do đội sản phẩm biên soạn và kiểm duyệt.
- Giao diện MVP ưu tiên tiếng Việt.
- Không thu thập hoặc gửi dữ liệu cá nhân ra khỏi trình duyệt.

## 8.3. Các điểm cần làm rõ trước khi chốt phạm vi

- Một người có được chọn nhiều mục tiêu không; nếu có, cách chọn mục tiêu chính?
- “Nhóm bài” là nhóm cơ, kiểu bài hay cả hai?
- Có cần hỏi thiết bị chi tiết khi chọn “tại nhà” và “tối thiểu” không?
- Có cần cho người dùng chọn ngày cụ thể trong tuần, hay chỉ hiển thị Buổi 1–6?
- Có cần ước tính thời lượng tối đa mỗi buổi?
- Có cần hỗ trợ mục tiêu sức mạnh ngay trong MVP hay chỉ giảm mỡ, tăng cơ và toàn thân?
- Có cần ảnh/video hướng dẫn không? Nếu có, nguồn nội dung và bản quyền là gì?
- Có cần thay thế thủ công từng bài trong lịch không?
- Có cần lưu lịch trên `localStorage` hay mỗi lần mở lại sẽ tạo mới?
- Độ tuổi tối thiểu chính thức của sản phẩm là bao nhiêu?
- Có cần trường khai báo chấn thương/hạn chế vận động ngay ở bản đầu?
- Nội dung bài tập và cảnh báo có cần được chuyên gia thể thao hoặc y tế duyệt trước khi phát hành không?

## 8.4. Phạm vi nên để sau MVP

- Đăng nhập và đồng bộ dữ liệu.
- Theo dõi mức tạ, rep thực tế và tiến bộ.
- Tự động progressive overload theo lịch sử.
- Điều chỉnh lịch theo mức độ mệt mỏi hoặc RPE/RIR.
- Kế hoạch dinh dưỡng và calorie.
- Video hướng dẫn.
- Tích hợp wearable.
- Chia sẻ lịch giữa huấn luyện viên và học viên.
- Cá nhân hóa bằng machine learning hoặc AI.
- Hỗ trợ chấn thương/phục hồi chuyên sâu.
- Hệ thống quản trị nội dung bài tập.
