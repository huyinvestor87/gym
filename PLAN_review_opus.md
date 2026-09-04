# Review kế hoạch: Webapp gợi ý lịch tập gym

Người review: kiến trúc sư phần mềm + góc nhìn khoa học thể thao (S&C)
Đối tượng review: `PLAN_codex.md`
Ngày: 2026-09-03

---

## 1. Tóm tắt đánh giá

Bản kế hoạch **chất lượng tốt, nên tiến hành**, nhưng cần cắt ~40% phạm vi kỹ thuật và sửa vài lỗi khoa học thể thao trước khi code. Phần domain modeling và pipeline thuật toán được nghĩ kỹ, phần rủi ro/đạo đức (BMI, disclaimer, không dùng giới tính để phân biệt) rất chín — hiếm thấy trong plan kiểu này. Hai nhóm vấn đề chính: (a) **over-engineer** so với gu "web app nhỏ, deploy tĩnh" của Huy (RHF + Zod runtime + RTL + router + 9 milestone cho app 2 màn hình), và (b) **3 lỗi khoa học thật sự cần sửa**: thiếu hẳn mục tiêu "sức bền" mà người dùng yêu cầu, hiểu sai bản chất "giảm mỡ" (kê rep cao/nghỉ ngắn), và không ràng buộc tần suất ≥2 lần/tuần/nhóm cơ nên có thể sinh ra lịch 3 buổi PPL kém hiệu quả.

---

## 2. Điểm mạnh

1. **Tách domain/services/UI sạch.** `services/` là hàm thuần, không phụ thuộc React — đúng chuẩn, khiến thuật toán test được và sau này port sang backend/CLI dễ dàng.
2. **Pipeline rule-based được phân rã đúng thứ tự** (split → yêu cầu buổi → lọc thiết bị → chấm điểm → kê đơn → kiểm volume). Dùng scoring thay chuỗi `if/else` là quyết định đúng, tránh combinatorial explosion.
3. **Đạo đức & an toàn xử lý chín chắn:** không dùng BMI để tự động đổi cường độ, không phân loại BMI cho người <18, không dùng giới tính để áp định kiến bài tập/cường độ, không hứa hẹn kết quả. Đây là điểm mà đa số app gym làm sai.
4. **`ruleTrace` để giải thích quyết định** — cực kỳ giá trị khi debug và khi giải thích cho người dùng ("vì sao chọn Upper/Lower").
5. **Chiến lược test đúng triết lý:** kiểm *invariant* thay vì snapshot toàn bộ lịch. Snapshot lịch tập sẽ vỡ liên tục và vô nghĩa.
6. **Cảnh báo đúng về 6 buổi ≠ nhiều volume hơn** ("không tăng volume tuyến tính theo số ngày") — đây là hiểu biết đúng và nhiều người làm sản phẩm bỏ qua.
7. **Không mặc định "bro split" một nhóm cơ/ngày cho 5 buổi** — đúng khoa học.
8. **Nhận diện sớm rủi ro routing GitHub Pages, coverage dữ liệu, và cần chuyên gia duyệt nội dung.**

---

## 3. Vấn đề & sửa đổi đề xuất

> Ưu tiên: **P0** = phải sửa trước khi code · **P1** = sửa trong MVP · **P2** = nên có / để sau

### P0 — Khoa học tập luyện

**1. Thiếu hoàn toàn mục tiêu "sức bền" (endurance) mà yêu cầu gốc nêu rõ.**
`Goal` chỉ có `fat_loss | muscle_gain | general_fitness | strength` + các focus. Bảng rep range (4.7) không có dòng sức bền.
*Sửa:* thêm `endurance` với prescription: 2–3 set × 15–25 rep, nghỉ 30–60s, ưu tiên bài máy/bodyweight ổn định, cộng 2–3 buổi aerobic 20–30 phút Zone 2 (nhịp tim còn nói chuyện được). Ghi rõ đây là *sức bền cơ bắp*, không phải sức bền tim mạch chuyên sâu.

**2. Hiểu sai "giảm mỡ" ở tầng thuật toán — lỗi khoa học nghiêm trọng nhất của bản kế hoạch.**
Mục 4.4 và bảng 4.7 kê giảm mỡ = rep 8–15, nghỉ 45–90s, "giảm thời gian nghỉ ở bài phụ". Đây là quan niệm "toning" đã lỗi thời. Giảm mỡ được quyết định bởi **cân bằng năng lượng (ăn uống)**, không phải bởi cấu trúc set/rep. Vai trò của tập kháng lực khi đang thâm hụt calo là **giữ cơ nạc**, mà giữ cơ đòi hỏi *duy trì cường độ và tải trọng gần như khi tăng cơ*. Rút ngắn nghỉ ở compound làm giảm tải → giảm kích thích giữ cơ, mà lại không đốt thêm mỡ đáng kể.
*Sửa cụ thể:*
- Prescription của `fat_loss` ≈ prescription của `muscle_gain` (rep 6–12 compound / 10–15 isolation, nghỉ 90–150s / 60–90s), có thể giảm nhẹ tổng volume tuần (~10–15%) vì hồi phục kém hơn khi thâm hụt calo.
- Phần "đốt calo" tách riêng thành **conditioning block**: 2–3 buổi × 20–30 phút cardio cường độ thấp–trung, hoặc finisher 8–10 phút cuối buổi. Không xếp cardio nặng ngay trước buổi chân.
- Bắt buộc hiển thị 1 câu: *"Giảm mỡ chủ yếu đến từ chế độ ăn và tổng vận động hằng ngày; lịch tập này giúp giữ cơ trong quá trình đó. Ứng dụng không đưa ra tư vấn dinh dưỡng."*
- Nếu vẫn muốn giữ nghỉ ngắn: chỉ áp cho bài isolation cuối buổi, và ghi rõ đó là để tiết kiệm thời gian, không phải để đốt mỡ.

**3. Tần suất (frequency) không hề là ràng buộc trong thuật toán.**
Plan chọn split theo số buổi nhưng không phát biểu nguyên tắc: *ở cùng tổng volume, tập mỗi nhóm cơ ≥2 lần/tuần cho kết quả tốt hơn hoặc bằng 1 lần/tuần*. Hệ quả trực tiếp: mục 4.3 cho phép **3 buổi PPL** cho người trung bình — đó là phương án cho mỗi nhóm cơ **1 lần/tuần**, tần suất tệ nhất trong các lựa chọn 3 buổi.
*Sửa:*
- Với `daysPerWeek ≥ 3`: thêm **invariant bắt buộc** — mọi nhóm cơ chính được tập phải có tần suất ≥2/tuần. Test tự động assert điều này.
- 3 buổi: mặc định Full Body A/B/C cho **mọi trình độ**. Nếu người dùng cố tình chọn PPL → cho phép nhưng kèm cảnh báo tần suất. Hoặc đơn giản hơn cho MVP: **bỏ 3-day PPL**.
- Bảng split đề xuất sửa lại ở mục 5 bên dưới.

**4. Hai luật volume ở 4.8 xung đột, không có thứ tự giải quyết → có thể lặp vô hạn hoặc phình buổi tập.**
"Khi vượt trần, loại bài phụ điểm thấp nhất" + "khi thiếu volume, thêm set" là hai lực ngược chiều không có điều kiện dừng. Với lịch 2 buổi/tuần, sàn volume (6–10 set/nhóm/tuần cho ~7 nhóm cơ) là **bất khả thi về mặt số học** trong 2 buổi — thuật toán sẽ cứ thêm set cho tới khi buổi tập dài 2 tiếng.
*Sửa:* định nghĩa thứ tự ưu tiên cứng, chạy **một lượt duy nhất**, không vòng lặp:
```
1. Trần thời lượng buổi tập  (ràng buộc CỨNG, không bao giờ vi phạm)
2. Trần volume/nhóm cơ/tuần  (ràng buộc CỨNG)
3. Movement pattern bắt buộc (ràng buộc CỨNG)
4. Sàn volume/nhóm cơ/tuần   (MỤC TIÊU — nếu không đạt thì báo cho người dùng,
                              KHÔNG tự ý thêm set vượt qua ràng buộc 1 & 2)
```
Khi không đạt sàn → xuất `globalNotes`: *"Với 2 buổi/tuần, lịch này tập trung vào mức tối thiểu hiệu quả cho các nhóm cơ lớn. Nếu muốn phát triển nhanh hơn, cân nhắc 3 buổi/tuần."* Đây cũng là câu trả lời trung thực và đúng khoa học.

**5. Con số volume cần chỉnh và cần đổi cách đếm.**
- Plan: người mới 6–10, trung bình 8–16 set/nhóm/tuần. Khoảng người mới ổn; **trung bình nên là 10–20, mặc định nhắm 12–16**.
- Quan trọng hơn: plan chỉ đếm **set trực tiếp** (primary muscle). Cách này làm tay sau, tay trước, vai trước bị *đếm thiếu nghiêm trọng* (đẩy ngực đã "trả" nhiều volume cho tay sau và vai trước) → thuật toán sẽ nhồi thêm bài isolation không cần thiết.
*Sửa:* quy ước `primaryMuscles` = 1.0 set, `secondaryMuscles` = 0.5 set khi cộng volume tuần. Nêu quy ước này ở tooltip trong bảng tổng kết volume.

**6. Tách vai thành 3 phần (hoặc ít nhất tag riêng vai sau).**
`shoulders` gộp làm một che giấu mất cân bằng kinh điển: vai trước nhận rất nhiều volume gián tiếp từ mọi bài đẩy, còn **vai sau gần như bằng 0** nếu không có bài chuyên biệt. Đây là nguyên nhân phổ biến của mất cân bằng tư thế.
*Sửa:* `front_delts | side_delts | rear_delts`, và thêm luật: mỗi tuần tối thiểu 1 bài kéo ngang/rear-delt (face pull, rear delt fly, reverse fly, band pull-apart).

**7. Progression gần như không có — mà đây là thứ quyết định lịch có tác dụng hay không.**
Cả plan chỉ có một dòng ở 4.9. Một lịch không có luật tăng tải chỉ là danh sách bài tập.
*Sửa:* biến progression thành **output hạng nhất**, hiển thị rõ trên trang kết quả:
- **Double progression** (đúng như plan gợi ý nhưng phải nói rõ): giữ nguyên tải cho tới khi đạt *cận trên* của rep range ở **tất cả** các set với form tốt → tăng tải 2.5–5% (hoặc nấc tạ nhỏ nhất) → quay về cận dưới rep range.
- **RIR/độ gắng sức:** người mới 3–4 RIR (dừng khi còn dư 3–4 rep), trung bình 1–3 RIR, MVP **không** kê tập tới thất bại, **không** kê single/double ở bất kỳ trình độ nào.
- **Xử lý chững:** stall 2–3 buổi liên tiếp → giảm 10% tải, xây lại; hoặc tuần deload sau 6–10 tuần.
- **Chân trời của lịch:** ghi rõ *"Dùng lịch này 4–8 tuần, sau đó tạo lại với thông tin cập nhật."* Không có câu này, người dùng chạy một lịch mãi mãi.

**8. Xử lý theo tuổi mới chỉ dừng ở BMI, chưa chạm tới tập luyện.**
*Sửa:* thêm luật rõ ràng (và đây cũng là chính sách sản phẩm):
- **<16:** ngoài phạm vi. Chặn ở validation (xem mục P0-14).
- **16–17:** ưu tiên bodyweight/máy/tạ đơn, rep ≥8, không mục tiêu `strength`, không tập gần thất bại, ghi chú cần người lớn/HLV giám sát.
- **≥50:** *không* giảm volume hay cường độ một cách máy móc (tập kháng lực đặc biệt có lợi ở nhóm tuổi này) — thay vào đó: khởi động dài hơn (10–15 phút), nghỉ giữa set +30s, ưu tiên máy/tạ đơn hơn barbell cho người mới, mặc định tránh bài tải cột sống cao & động tác nhảy/impact cao, thêm 1 khối thăng bằng/vận động khớp mỗi tuần.
- **BMI ≥30 hoặc lâu không vận động:** ưu tiên cardio ít va đập (xe đạp, đi bộ dốc, máy chèo) thay vì chạy/nhảy; ưu tiên bài có điểm tựa. Đây là điều chỉnh **chọn bài**, không phải điều chỉnh cường độ — vẫn nhất quán với nguyên tắc "không để BMI quyết định volume" mà plan đã đặt ra đúng.

**9. Mục tiêu "sức mạnh" mô tả mơ hồ.** "Hạn chế áp dụng cho người mới tuyệt đối" — không phải một luật cài được.
*Sửa:* người mới chọn `strength` → vẫn cho, nhưng **rep bài chính ≥5** (3×5 / 5×5), tải trung bình, nhấn kỹ thuật, RIR 3–4; chỉ trung bình/nâng cao mới xuống 3–5 rep. Bài chính luôn đứng đầu buổi. Hai buổi nặng cùng một động tác cách nhau ≥48h.

**10. Luật chống trùng lặp mâu thuẫn với Full Body.**
"Không lặp đúng một bài quá 2 lần/tuần" xung đột trực tiếp với Full Body A/B/C — nơi mà squat/bench xuất hiện 3 lần/tuần là **đúng và mong muốn** (người mới cần lặp lại để học kỹ thuật vận động).
*Sửa:* đổi luật thành cấp *movement pattern* trong **một buổi** (không quá 2 bài cùng pattern/buổi), và cho phép lặp bài xuyên tuần tự do trong template full-body; chỉ thay đổi biến thể ở buổi B/C (ví dụ back squat → goblet squat → split squat) cho trình độ trung bình trở lên.

### P0 — Kỹ thuật / phạm vi

**11. Cắt dependency: bỏ React Hook Form, Zod (runtime), React Testing Library, và router.**
Đây là app 2 màn hình, một form, không có dữ liệu ngoài, không có untrusted input.
- **RHF**: form ~10 trường, dùng uncontrolled `<form>` + `FormData` + `useState` là đủ. Bỏ.
- **Zod**: dữ liệu JSON là *của chính mình*, ship kèm bundle. Validate lúc **build/test** bằng một script Node nhỏ (~50 dòng) là đúng chỗ, không cần trả giá ~13KB gzip runtime cho mỗi người dùng. Bỏ khỏi runtime. Validation form thì viết tay — các luật (16–80, 30–300kg, 120–230cm) là đơn giản và không đổi.
- **RTL**: test component cho 2 màn hình tĩnh có ROI thấp; sẽ tốn nhiều thời gian bảo trì hơn giá trị mang lại. Thay bằng checklist thủ công (plan đã có sẵn ở 7.3, rất tốt).
- **Router**: bỏ `routes.tsx`, `NotFoundPage.tsx`. Dùng `useState<'search' | 'plan'>`. Việc này **xóa luôn toàn bộ rủi ro routing GitHub Pages ở mục 8.1** — không cần hash routing, không cần `404.html`.
- **Giữ lại:** Vite + TypeScript + React + Vitest. TS thật sự đáng giá cho thuật toán này (union type cho muscle/equipment/pattern bắt lỗi tại compile time). React đáng giá cho việc render lịch tập lồng nhau. Vitest cho `services/` là bắt buộc.
*Kết quả:* từ ~7 dependency chính xuống 2 (react, react-dom) + devDeps. Bundle ước tính <60KB gzip.

**12. Cấu trúc thư mục quá sâu cho quy mô này.**
6 thư mục con trong `components/`, 3 file cho type/schema/constants, `utils/` tách khỏi `services/`. Với ~20 file source, việc điều hướng tốn nhiều hơn lợi ích.
*Sửa:* làm phẳng — xem mục 5.

**13. `Goal` trộn lẫn hai trục dữ liệu trực giao.**
`Goal` chứa cả mục tiêu huấn luyện (`fat_loss`, `strength`) lẫn ưu tiên nhóm cơ (`focus_chest`, `focus_back`, `focus_legs`, `full_body`), trong khi `UserInput` **đã có** `focusMuscles: MuscleGroup[]`. Đây là lỗi mô hình hóa sẽ sinh ra state không hợp lệ (goals = `["strength", "focus_chest"]` vs focusMuscles = `["back"]` — mâu thuẫn).
*Sửa:*
```ts
type Goal = "muscle_gain" | "fat_loss" | "strength" | "endurance" | "general_fitness";
// một giá trị duy nhất, không phải mảng
type UserInput = { goal: Goal; focusMuscles: MuscleGroup[]; ... }
```
Điều này cũng giải quyết luôn câu hỏi mở 8.3 ("chọn nhiều mục tiêu thì đâu là chính?") — **MVP chỉ cho chọn 1 mục tiêu**, đơn giản hơn cho cả người dùng lẫn thuật toán.

**14. Chính sách tuổi tối thiểu chưa được quyết, validation không chặn.**
Plan ghi khoảng hợp lệ 16–80 nhưng không nói chuyện gì xảy ra ở tuổi 15 hay 82.
*Sửa (khuyến nghị):* MVP đặt **16+**, dưới 16 chặn cứng với thông báo tử tế ("Ứng dụng dành cho người từ 16 tuổi. Bạn dưới 16 tuổi nên tập cùng HLV hoặc giáo viên thể chất."). Trên 80 vẫn cho dùng, áp bộ luật ≥50 và thêm khuyến nghị hỏi bác sĩ.

### P1 — Mô hình dữ liệu

**15. Thiếu trường `loadingType` trên `Exercise`.**
Plan nói plank/carry/cardio dùng thời gian thay vì rep, nhưng schema không có chỗ biểu diễn. `ExercisePrescription.reps: string` cũng nhập nhằng.
*Sửa:* `loadingType: "reps" | "time" | "distance"` trên Exercise; `ExercisePrescription` đổi thành `{ sets, target: { type, min, max, unit } }` để render và test được, thay vì string tự do.

**16. Thiếu `sessionLengthMinutes` trong `UserInput`.**
Thời gian rảnh mỗi buổi quyết định số bài **mạnh hơn cả trình độ**. Không có nó, thuật toán không có ràng buộc cứng ở P0-4.
*Sửa:* thêm select 30 / 45 / 60 / 75 / 90 phút, mặc định 60.

**17. Thiếu công thức `estimatedDurationMinutes` — plan hứa trường này nhưng không định nghĩa.**
*Sửa:* `8 (khởi động) + Σ_bài [ set × (rep × 3s + nghỉ) ] + 1 phút chuyển bài/bài`, làm tròn lên 5 phút. Dùng chính công thức này làm ràng buộc P0-4.

**18. Thiếu 3 trường hữu ích, chi phí thấp:**
- `nameVi` + giữ `name` tiếng Anh (người dùng sẽ tra YouTube bằng tên tiếng Anh).
- `jointFriendly: boolean` hoặc `impactLevel: "low" | "high"` — cần cho luật P0-8.
- `fatigueCost: 1|2|3` (deadlift/squat nặng = 3) để tránh xếp 2 bài cực mệt liền nhau.
- `contraindicationTags` đã có trong schema nhưng **không được dùng ở bất kỳ đâu trong thuật toán** — hoặc dùng, hoặc xóa.

**19. `MuscleGroup` chứa `"cardio"` — sai phạm trù.** Cardio không phải nhóm cơ; nó sẽ làm hỏng mọi phép cộng volume theo nhóm cơ.
*Sửa:* thêm `blockType: "strength" | "conditioning" | "mobility"` trên Exercise, bỏ `"cardio"` khỏi `MuscleGroup`.

**20. `alternatives: string[]` viết tay sẽ mục ruỗng.**
Với 40–60 bài, danh sách thay thế thủ công sẽ lệch ngay khi thêm bài mới.
*Sửa:* để fallback **tự suy ra** từ (movementPattern giống nhau) + (primaryMuscles giao nhau) + (thiết bị khả dụng), xếp theo score. Giữ `alternatives` chỉ như một danh sách *ưu tiên tùy chọn*, không phải cơ chế chính.

**21. `RecommendationResult` thiếu 3 thứ cần cho tính tái lập:**
`seed` (bắt buộc, để "tạo lại biến thể" + chia sẻ link tái tạo được), `dataVersion`, và **`weeklyVolume: Record<MuscleGroup, number>`** — nên hiển thị cho người dùng dưới dạng bảng nhỏ; đây là bằng chứng trực quan nhất rằng lịch cân bằng, và cũng là công cụ debug tốt nhất.

**22. Rủi ro dữ liệu không nhất quán:** `movementRequirements` có `required: true` với tổng count > `exerciseCount.max` là template không thỏa mãn được.
*Sửa:* thêm assertion trong script validate dữ liệu.

### P1 — UX

**23. Thiếu "đổi bài này" — nên đưa vào MVP.**
Đây là tính năng có giá trị cao nhất sau chính bản lịch, và rất rẻ khi đã có cơ chế fallback ở P1-20: một nút xoay vòng qua top-3 bài thay thế cùng pattern. Không có nó, gặp một bài không thích/không làm được là người dùng bỏ cả lịch.

**24. Thiếu link chia sẻ / lưu — thay `localStorage` bằng URL hash.**
Encode `UserInput + seed` vào `#p=<base64>`. Được cả 3 thứ cùng lúc: lưu (bookmark), chia sẻ, và "chỉnh sửa thông tin" (đọc ngược từ hash). Đơn giản hơn `localStorage`, không đụng vấn đề quyền riêng tư, không cần nút "Xóa dữ liệu đã lưu".

**25. Bản in cần cột trống để ghi tay.**
Plan có `window.print()` + print stylesheet (tốt), nhưng thứ người ta thực sự in ra là để **ghi mức tạ và số rep đã làm**. Thêm 2 cột trống "Tạ (kg)" / "Rep thực tế" cho mỗi set trong print view. Chi phí gần bằng 0, giá trị sử dụng rất lớn.

**26. `instructions` có trong schema nhưng không xuất hiện trong bất kỳ màn hình nào.**
*Sửa:* mỗi hàng bài tập cho phép mở rộng (`<details>`) hiển thị hướng dẫn thực hiện. Không có nó thì trường `instructions` là dữ liệu chết, và người mới không biết làm bài.

**27. Disclaimer phải xuất hiện ở 3 nơi**, không chỉ trang Search: (a) dưới form, (b) đầu trang kết quả, (c) **trong bản in** (bản in sẽ rời khỏi ngữ cảnh web).

**28. Cắt: trạng thái loading (M9).** Toàn bộ tính toán là đồng bộ, dưới 5ms. Thêm spinner giả là nhiễu.

**29. Thiếu bảng tổng kết tuần ở trang kết quả:** tổng set/nhóm cơ, tần suất mỗi nhóm cơ, tổng thời gian/tuần. Đây là thứ giúp người dùng tin tưởng output (xem P1-21).

### P1 — Milestone & Test

**30. Không có ước lượng thời gian nào trong plan.** Yêu cầu review đòi đánh giá tính thực tế — nhưng không có gì để đánh giá. Xem ước lượng đề xuất ở mục 5.

**31. Không có lát cắt end-to-end nào chạy được trước M8.**
9 milestone tuần tự nghĩa là tới ~70% dự án mới nhìn thấy màn hình kết quả đầu tiên. Rủi ro cao: sai lầm về UX/mô hình dữ liệu chỉ lộ ra ở cuối.
*Sửa:* làm **walking skeleton trước** — form xấu → thuật toán tối giản (1 template, 10 bài) → render lịch → deploy. Xong trong ngày đầu, rồi mới đào sâu từng lớp.

**32. Chi phí thật của dự án là biên soạn dữ liệu, không phải code — và plan giấu nó trong một gạch đầu dòng của M2.**
40–60 bài × (tên VI/EN + mô tả + 3–5 bước hướng dẫn + 10 trường metadata) là công việc lớn nhất, ước tính **30–40% tổng effort**. Đề xuất: MVP bắt đầu với **~30 bài** đủ phủ 100% movement pattern × 3 mức thiết bị; mở rộng sau khi UI đã chạy.

**33. Test thiếu loại có giá trị cao nhất: sweep toàn bộ tổ hợp input.**
8 fixture là quá ít so với không gian đầu vào. Chi phí viết một vòng lặp `5 số buổi × 3 trình độ × 5 mục tiêu × 3 thiết bị × 5 mức thời gian = 1125 case`, mỗi case assert bộ invariant, là ~40 dòng và bắt được gần như mọi lỗi tổ hợp.
*Invariant bắt buộc:* đúng số buổi · không dùng thiết bị không có · không nhóm cơ nào vượt trần volume · **mọi nhóm cơ được tập có tần suất ≥2 khi ngày ≥3** · thời lượng ước tính ≤ trần người dùng chọn · mọi exerciseId tồn tại · mọi buổi có ≥1 bài · không hai bài cùng pattern liền kề trong buổi.

**34. Thiếu test coverage dữ liệu theo mức thiết bị:** với `minimal` (chỉ bodyweight), phải chứng minh mọi pattern bắt buộc đều có ít nhất 2 bài khả dụng ở mỗi mức khó. Không có test này, người dùng `minimal` sẽ nhận lịch thủng lỗ chỗ.

**35. Cần một "golden plan" cho người thật đọc.** Sinh 3 lịch tiêu biểu ra file markdown và nhờ một HLV/người tập lâu năm đọc duyệt. Không test tự động nào bắt được "lịch này nhìn ngu ngốc".

### P2 — Pháp lý & an toàn

**36. Quyết định chính sách tuổi và ghi vào sản phẩm** (xem P0-14). Nêu ở footer: "Dành cho người từ 16 tuổi."

**37. Disclaimer nên nêu đích danh các trường hợp cần hỏi bác sĩ trước:** bệnh tim mạch/huyết áp, tiểu đường, chấn thương đang điều trị, **đang mang thai hoặc sau sinh**, phẫu thuật trong 6 tháng, đau ngực/chóng mặt khi gắng sức, lâu (>1 năm) không vận động. Plan có nhắc nhưng dạng chung chung.

**38. Không dùng ngôn ngữ mệnh lệnh y khoa.** Dùng "gợi ý tham khảo", "bạn có thể cân nhắc" thay vì "bạn phải tập". Tránh mọi con số hứa hẹn (kg giảm, cm tăng).

**39. Nhờ HLV/chuyên gia thể thao duyệt bộ dữ liệu + text cảnh báo trước khi public.** Plan liệt kê đây là câu hỏi mở — khuyến nghị là **có**, ít nhất một lượt đọc nhanh. Chi phí thấp, rủi ro tránh được cao.

**40. Quyền riêng tư:** không backend, không cookie, không analytics → gần như không nghĩa vụ pháp lý. Ghi một dòng ở footer: *"Mọi tính toán chạy trên trình duyệt của bạn. Không dữ liệu nào được gửi đi."* Nếu sau này thêm Google Analytics thì phải thêm thông báo.

**41. Bản quyền nội dung:** nếu về sau thêm ảnh/video minh họa, chỉ dùng nguồn tự tạo hoặc giấy phép rõ ràng. MVP không dùng ảnh là quyết định đúng.

---

## 4. Bảng split đề xuất (thay bảng ở mục 4.3 của plan)

| Buổi/tuần | Split khuyến nghị | Tần suất/nhóm cơ | Ghi chú |
|---:|---|---:|---|
| 2 | Full Body A / B | 2x | Nêu rõ: mức tối thiểu hiệu quả. Chỉ compound + 1–2 accessory. Cách nhau ≥2 ngày. |
| 3 | Full Body A / B / C | 3x | **Mặc định cho mọi trình độ.** T2/T4/T6. Bỏ 3-day PPL khỏi MVP. |
| 4 | Upper / Lower / Upper / Lower | 2x | T2-T3 / nghỉ / T5-T6. Buổi 3-4 dùng biến thể khác buổi 1-2. |
| 5 | Upper / Lower / Push / Pull / Legs | 2x | Người mới chọn 5 → hạ về Upper/Lower/Full/Upper/Lower + cảnh báo. |
| 6 | Push/Pull/Legs × 2 vòng | 2x | Chỉ mặc định cho trung bình/nâng cao. Vòng B khác vòng A về bài chính & rep range. Chỉ 1 ngày nghỉ — cảnh báo rõ về hồi phục. Người mới chọn 6 → đề xuất mạnh 3–4 buổi. |

---

## 5. Kế hoạch chốt đề xuất

### 5.1 Tech stack

```
Vite + React 18 + TypeScript      → build tĩnh, type an toàn cho thuật toán
CSS thuần, 1 file + CSS variables → không CSS Modules, không UI framework
Vitest                            → chỉ test src/engine/ (hàm thuần)
Node script validate dữ liệu      → chạy trong CI, thay cho Zod runtime
GitHub Actions → GitHub Pages     → typecheck + test + validate-data + build + deploy
```
**Bỏ:** React Hook Form, Zod, React Testing Library, react-router, thư viện UI.
Runtime deps: `react`, `react-dom`. Hết.

### 5.2 Cấu trúc thư mục

```
gym/
├── index.html
├── vite.config.ts            # base: '/gym/'
├── package.json
├── scripts/
│   └── validate-data.mjs     # id duy nhất, enum hợp lệ, coverage pattern×equipment
├── src/
│   ├── main.tsx
│   ├── App.tsx               # useState<'search'|'plan'>, đọc/ghi URL hash
│   ├── types.ts              # toàn bộ type + constant ở một chỗ
│   ├── data/
│   │   ├── exercises.json    # ~30 bài cho MVP
│   │   └── templates.json
│   ├── engine/               # hàm thuần, không import React
│   │   ├── bmi.ts
│   │   ├── validate.ts
│   │   ├── split.ts
│   │   ├── select.ts         # lọc + chấm điểm + fallback
│   │   ├── prescribe.ts      # set/rep/nghỉ/progression
│   │   ├── volume.ts         # cộng volume, áp ràng buộc theo thứ tự cứng
│   │   └── index.ts          # recommend(input) -> RecommendationResult
│   ├── ui/
│   │   ├── SearchForm.tsx
│   │   ├── PlanView.tsx
│   │   ├── SessionCard.tsx
│   │   └── VolumeSummary.tsx
│   └── styles.css            # + @media print
└── tests/
    ├── engine.test.ts        # unit theo module
    ├── sweep.test.ts         # 1000+ tổ hợp × bộ invariant
    └── data.test.ts
```
~18 file source. So với plan gốc: bỏ `pages/`, `app/routes`, `components/common/`, `domain/schemas.ts`, `utils/`.

### 5.3 Thuật toán (bản đã sửa, tóm tắt)

```
validate(input)                       # 16+, chặn <16, ranges
   ↓
bmi(input)                            # <18 → không phân loại; ≥30 → cờ low-impact
   ↓
pickSplit(days, exp, goal)            # theo bảng mục 4; INVARIANT: freq ≥2 khi days≥3
   ↓
buildSlots(template, goal, focus)     # slot = {pattern, muscle, role: main|accessory|isolation}
   ↓                                  # nhóm cơ ưu tiên → xếp ĐẦU buổi, +1 slot
filterExercises(equipment, exp, age, impactFlag)
   ↓
scoreAndPick(slots)                   # score + seeded top-k sampling (không chỉ phá hòa)
   ↓                                  # fallback tự suy: cùng pattern ∩ cùng cơ chính
prescribe(goal, exp, age, role)       # bảng rep/set/nghỉ ĐÃ SỬA (xem dưới)
   ↓
enforceConstraints()                  # MỘT LƯỢT, thứ tự cứng:
                                      #   1. trần thời lượng buổi (cứng)
                                      #   2. trần volume/nhóm/tuần (cứng)
                                      #   3. pattern bắt buộc (cứng)
                                      #   4. sàn volume (mục tiêu — thiếu thì BÁO, không ép)
   ↓
addNotes()                            # khởi động, double progression, RIR, deload,
                                      # chân trời 4-8 tuần, disclaimer, cảnh báo tuổi
   ↓
{ sessions, weeklyVolume, seed, dataVersion, notes, ruleTrace }
```

**Bảng prescription đã sửa:**

| Mục tiêu | Loại bài | Set | Rep | Nghỉ | RIR |
|---|---|---:|---:|---:|---:|
| Tăng cơ | Compound | 3–4 | 6–12 | 90–150s | 1–3 |
| Tăng cơ | Isolation | 2–4 | 10–15 | 60–90s | 0–2 |
| **Giảm mỡ** | Compound | 3–4 | 6–12 | **90–150s** | 1–3 |
| **Giảm mỡ** | Isolation | 2–3 | 10–15 | 60–90s | 1–3 |
| **Giảm mỡ** | Conditioning | — | 20–30 phút × 2–3 buổi/tuần | — | — |
| Sức mạnh (TB/NC) | Compound chính | 3–5 | 3–6 | 180–300s | 2–3 |
| Sức mạnh (người mới) | Compound chính | 3–5 | **5–8** | 150–210s | 3–4 |
| Sức mạnh | Bài phụ | 3–4 | 6–10 | 90–150s | 1–3 |
| **Sức bền (mới)** | Kháng lực | 2–3 | 15–25 | 30–60s | 1–3 |
| **Sức bền (mới)** | Aerobic | — | 20–30 phút Zone 2 × 2–3 | — | — |
| Thể lực chung | Compound | 2–3 | 6–12 | 90–120s | 2–3 |
| Thể lực chung | Bài phụ | 2–3 | 10–15 | 60–90s | 1–3 |

Volume tuần (đếm primary 1.0 + secondary 0.5): người mới **6–10**, trung bình **10–20** (nhắm 12–16), nâng cao trần bảo thủ **20**. Nhóm cơ ưu tiên +2–4 set. Trần luôn thắng sàn.

### 5.4 Milestone (5 mốc, ước lượng cho 1 người làm part-time)

| # | Nội dung | Kết quả | Ước lượng |
|---|---|---|---|
| **M1** | **Walking skeleton**: Vite+TS+React, form thô, 1 template full-body, 10 bài, render lịch, CI + deploy Pages | Link chạy được, xấu nhưng đúng luồng | 0.5–1 ngày |
| **M2** | **Dữ liệu**: types.ts, ~30 bài đầy đủ metadata VI+EN, 5 template, script validate + test coverage | Dữ liệu sạch, CI xanh | 2–3 ngày ⚠️ *mốc tốn nhất* |
| **M3** | **Engine đầy đủ**: bmi/validate/split/select/prescribe/volume + progression + luật tuổi + unit test + sweep test 1000+ case | Thuật toán đúng, có thể giải thích | 2–3 ngày |
| **M4** | **UI hoàn chỉnh**: form + validation + trang kết quả + bảng volume + đổi bài + expand hướng dẫn + URL hash + print stylesheet có cột ghi tay + a11y | Sản phẩm dùng được | 2–3 ngày |
| **M5** | **Hoàn thiện**: disclaimer 3 chỗ, responsive check, golden plan nhờ HLV duyệt, README, deploy | MVP phát hành | 1 ngày |

**Tổng ước tính: 8–11 ngày công.** So với plan gốc 9 milestone: ít mốc hơn, có sản phẩm chạy được từ ngày 1, và đưa việc "nhờ chuyên gia duyệt" vào lịch chứ không để làm câu hỏi mở.

### 5.5 Cắt khỏi MVP (đồng ý với plan, bổ sung thêm)

Plan đã liệt kê đúng ở 8.4. Bổ sung cắt thêm: router & 404 handling, Zod runtime, RHF, RTL, loading state, `localStorage` (thay bằng URL hash), NotFoundPage, ảnh minh họa, chọn ngày cụ thể trong tuần (chỉ hiện "Buổi 1–6" + gợi ý mẫu ngày).

---

## 6. Câu hỏi cần Huy quyết định

1. **Tuổi tối thiểu:** 16+ (khuyến nghị) hay 18+ (an toàn pháp lý tối đa)? Chặn cứng hay chỉ cảnh báo?
2. **Một mục tiêu hay nhiều?** Tôi khuyến nghị **một** cho MVP (đơn giản hoá cả UI lẫn thuật toán). Đồng ý không?
3. **Có bỏ Zod/RHF/RTL không?** Đây là điểm khác biệt lớn nhất giữa bản này và bản Codex. Nếu Huy muốn giữ TypeScript nhưng bỏ hết thư viện phụ thì theo bản này; nếu muốn "an toàn kiểu chuẩn công nghiệp" thì theo Codex.
4. **Có làm tính năng "đổi bài này" trong MVP không?** Tôi khuyến nghị có — rẻ và giá trị cao.
5. **URL hash thay localStorage — đồng ý?** Được cả lưu + chia sẻ, đơn giản hơn.
6. **Ngôn ngữ dữ liệu bài tập:** song ngữ (tên VI + tên EN) hay chỉ VI? Tôi khuyến nghị song ngữ để người dùng tự tra video.
7. **Số bài MVP:** 30 (khuyến nghị, đủ phủ pattern) hay 40–60 như plan gốc? Đây là biến chi phí lớn nhất.
8. **Có nhờ được HLV/người tập lâu năm đọc duyệt 3 lịch mẫu trước khi public không?** Nếu không, cần disclaimer mạnh hơn.
9. **Có hỏi chấn thương/hạn chế vận động trong MVP không?** Phiên bản tối giản (3 checkbox: vai / lưng dưới / gối) chỉ tốn ~2 giờ và loại được nhóm bài rủi ro nhất. Tôi nghiêng về **có**.
10. **Tên repo / base path GitHub Pages** là gì (cần cho `vite.config.ts` → `base`)?
