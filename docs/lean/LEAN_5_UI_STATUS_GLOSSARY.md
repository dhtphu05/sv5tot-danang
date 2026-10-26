# 5TOT ĐÀ NẴNG — LEAN-5: BẢNG THUẬT NGỮ VÀ MA TRẬN TRẠNG THÁI GIAO DIỆN
## UI STATUS GLOSSARY & ROLE-AWARE PROJECTION MATRIX

**Cơ quan chỉ đạo:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức & vận hành:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Năm học áp dụng:** 2026–2027 (Mã đợt xét: `season-2026-2027`)  
**Phiên bản tài liệu:** LEAN-5 (Production Ready)  

---

### 1. Nguyên tắc cốt lõi (Core Principles)

1. **Phân định rõ ràng 5 chiều nghiệp vụ độc lập:**
   - Không gộp chung tiến độ thao tác của người thẩm định với kết quả tiêu chí hay quyết định pháp lý của Hội đồng.
   - Kết quả tiêu chí (5/5 tiêu chí Đạt) là điều kiện kỹ thuật khách quan, **không tự động thay thế** cho kết luận đề nghị của Trường hay quyết định công nhận của Hội đồng.
2. **Chiếu trạng thái theo đúng vai trò người dùng (Role-Aware Projection):**
   - Cán bộ Trường nhìn thấy trọng tâm là đề xuất cấp trường và trạng thái gửi hồ sơ.
   - Cán bộ Thẩm định Thành phố nhìn thấy tiến độ thẩm định và trạng thái hồ sơ trong hàng đợi chung.
   - Thành viên Hội đồng nhìn thấy trạng thái biểu quyết và quyết định công nhận cấp Thành phố.
3. **Chuẩn mực hiển thị không dùng "Pill ồn ào" (Zero-Pill Discipline):**
   - Chỉ dùng chấm màu tinh tế (semantic dot 6px) kết hợp nhãn chữ rõ ràng hoặc thẻ viền mảnh (subtle border badge).
   - Màu sắc theo bảng màu hành chính nhận diện Thành Đoàn Đà Nẵng (xanh biển / xanh ngọc bích / hổ phách / xám trung tính).
4. **Chuẩn hóa ngôn ngữ hành chính tiếng Việt thuần túy:**
   - Tuyệt đối không để lộ thuật ngữ kỹ thuật, biến số lập trình (như `ResolutionCase`, `Pipeline`, `Batch Dispatcher`, `canonical_review`, `Quorum Engine`, `AI Verdict`).

---

### 2. Ma trận 5 chiều trạng thái nghiệp vụ (5 Business Status Dimensions)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          5 CHIỀU TRẠNG THÁI NGHIỆP VỤ                             │
├────────────────────┬─────────────────────────────────────────────────────────────┤
│ 1. Tiến độ xét     │ Chưa xét  ──►  Đang xét  ──►  Đã xét                        │
│ (Review Progress)  │ (neutral)      (brand)         (success)                    │
├────────────────────┼─────────────────────────────────────────────────────────────┤
│ 2. Kết quả tiêu chí│ Chưa thẩm định (0/5) ──► x/5 tiêu chí đã xét · y đạt        │
│ (Criteria Outcome) │                      ──► 5/5 tiêu chí Đạt                   │
├────────────────────┼─────────────────────────────────────────────────────────────┤
│ 3. Đề xuất Trường  │ Chưa kết luận ──► Đề nghị / Không đề nghị ──► Đã gửi TP    │
│ (School Status)    │ (warning)         (success / neutral)         (brand)       │
├────────────────────┼─────────────────────────────────────────────────────────────┤
│ 4. Thẩm định TP    │ Chờ thẩm định ──► Đang thẩm định ──► Đã thẩm định           │
│ (City Review)      │ (warning)         (brand)             (success)             │
├────────────────────┼─────────────────────────────────────────────────────────────┤
│ 5. Quyết định HĐ   │ Chờ quyết định ──► Được công nhận / Không được công nhận    │
│ (Committee Outcome)│ (brand)            (success)        (neutral)               │
└────────────────────┴─────────────────────────────────────────────────────────────┘
```

#### Chi tiết từng chiều trạng thái:

#### Chiều 1: Tiến độ xét (Review Progress)
Phản ánh mức độ thẩm định các tiêu chí trong hồ sơ của cán bộ:
- **Chưa xét (`neutral`):** Chưa có tiêu chí nào được cán bộ ghi nhận kết quả thẩm định.
- **Đang xét (`brand`):** Đã thẩm định từ 1 đến 4 tiêu chí, hoặc hồ sơ đang trong quy trình bổ sung minh chứng.
- **Đã xét (`success`):** Toàn bộ 5/5 tiêu chí cá nhân (hoặc TT01–TT04 tập thể) đã được thẩm định đầy đủ.

#### Chiều 2: Kết quả tiêu chí (Criteria Outcome)
Phản ánh kết quả khách quan dựa trên tổng hợp đánh giá Đạt/Chưa đạt của từng tiêu chí:
- **Chưa thẩm định (0/5) (`neutral`):** Chưa có tiêu chí nào được đánh giá.
- **{x}/5 tiêu chí đã xét · {y} đạt (`brand` hoặc `warning`):** Đang trong tiến trình hoặc đã xét hết nhưng có tiêu chí chưa đạt.
- **5/5 tiêu chí Đạt (`success`):** Tất cả 5 tiêu chí đều được thẩm định Đạt.

#### Chiều 3: Đề xuất cấp Trường (School Preliminary Recommendation)
Phản ánh thẩm quyền đánh giá sơ tuyển và chuyển tiếp của Hội Sinh viên cấp Trường/Đại học vùng:
- **Chưa kết luận (`warning`):** Hội đồng cơ sở chưa ghi nhận kết luận đề nghị.
- **Đề nghị (`success`):** Hội đồng cơ sở kết luận đề nghị xét trao danh hiệu Sinh viên 5 tốt cấp Thành phố.
- **Không đề nghị (`neutral`):** Không đáp ứng điều kiện hoặc bị sàng lọc ở cấp cơ sở.
- **Đã gửi Thành phố (`brand`):** Đã được tổng hợp vào văn bản đề nghị chính thức (kèm số Quyết định của trường/ĐHĐN) và chuyển giao về Thành Đoàn.

#### Chiều 4: Thẩm định Thành phố (City Review)
Phản ánh trạng thái xử lý trong Hàng đợi thẩm định chung của Tổ Thẩm định Thành Đoàn:
- **Chờ thẩm định (`warning`):** Hồ sơ đã tiếp nhận tại Thành phố nhưng chưa có cán bộ nào mở xét hoặc đánh giá tiêu chí.
- **Đang thẩm định (`brand`):** Có cán bộ đang chấm tiêu chí hoặc đang chờ sinh viên phản hồi bổ sung minh chứng.
- **Đã thẩm định (`success`):** Cán bộ đã bấm "Hoàn tất thẩm định" sau khi xem xét toàn bộ tiêu chí; hồ sơ sẵn sàng đưa ra Hội đồng.

#### Chiều 5: Quyết định Hội đồng (Committee Decision)
Phản ánh quyết định pháp lý chung thẩm của Hội đồng Xét chọn cấp Thành phố:
- **Chờ quyết định (`brand`):** Đang chờ Hội đồng họp phiên chính thức hoặc đang thảo luận hồ sơ.
- **Được công nhận (`success`):** Hội đồng biểu quyết chuẩn y đạt danh hiệu Sinh viên 5 tốt / Tập thể Sinh viên 5 tốt cấp Thành phố Đà Nẵng năm học 2026–2027.
- **Không được công nhận (`neutral`):** Không được công nhận trong đợt xét này (kèm lý do ghi nhận trong biên bản phiên họp).

---

### 3. Ma trận chiếu trạng thái theo vai trò (Role-Aware Projection Matrix)

Hàm `getRoleAwareStatusProjection(app, role)` và `resolveUserFacingStatus(app, role)` tự động ánh xạ thông tin phù hợp nhất với ngữ cảnh công việc của từng người dùng:

| Tình huống thực tế của hồ sơ | Cán bộ Trường (`SCHOOL_OFFICER`) | Cán bộ Thành phố (`CITY_OFFICER`) | Thành viên Hội đồng (`CITY_COMMITTEE`) | Sinh viên nộp hồ sơ (`STUDENT`) |
| :--- | :--- | :--- | :--- | :--- |
| **Mới nộp, trường đang sơ tuyển** | `Chưa kết luận` / `Đang xét` | `Chờ thẩm định` | `Chờ quyết định` | `Đang sơ tuyển cấp Trường` |
| **Trường đã đề nghị, chưa gửi TP** | `Đề nghị` (Chờ lập đợt gửi) | `Chưa tiếp nhận` | `Chờ quyết định` | `Trường đã đề nghị` |
| **Trường đã gửi QĐ lên Thành phố** | `Đã gửi Thành phố` | `Chờ thẩm định` | `Chờ quyết định` | `Đã chuyển tiếp lên Thành phố` |
| **Tổ Thẩm định đang chấm tiêu chí** | `Đã gửi Thành phố` | `Đang thẩm định` | `Chờ quyết định` | `Thành phố đang thẩm định` |
| **Tổ Thẩm định yêu cầu bổ sung** | `Đang bổ sung minh chứng` | `Cần bổ sung` | `Chờ quyết định` | `Cần bổ sung minh chứng` |
| **Tổ Thẩm định bấm Hoàn tất thẩm định** | `Đã gửi Thành phố` | `Đã thẩm định` | `Sẵn sàng xét chọn` | `Đã hoàn tất thẩm định` |
| **Hội đồng quyết định công nhận** | `Được công nhận` | `Được công nhận` | `Được công nhận` | `Đạt danh hiệu Sinh viên 5 tốt TP` |
| **Hội đồng quyết định chưa công nhận** | `Chưa được công nhận` | `Chưa được công nhận` | `Chưa được công nhận` | `Chưa được công nhận đợt này` |

---

### 4. Quy cách thiết kế trực quan (Visual Presentation Contract)

| Tone ngữ nghĩa | Mã màu Chấm (Dot) | Nền Thẻ (Badge Bg) | Chữ Thẻ (Badge Text) | Viền Thẻ (Badge Border) | Mục đích sử dụng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Neutral** (Trung tính) | `#607483` | `#F3F7FA` | `#334E68` | `#DCE7EE` | Chưa xét, Không đề nghị, Không công nhận |
| **Brand** (Xanh biển) | `#0D78AE` | `#EAF6FC` | `#0B64A0` | `#CBE5F6` | Đang xét, Đang thẩm định, Đã gửi TP, Chờ quyết định |
| **Warning** (Hổ phách) | `#D97706` | `#FEF6EB` | `#B45309` | `#FADDB6` | Chờ thẩm định, Cần bổ sung, Chưa kết luận |
| **Success** (Xanh lục ngọc) | `#1A934E` | `#EAFBF1` | `#136F3A` | `#B6E6C9` | Đã xét, Đã thẩm định, 5/5 Đạt, Đề nghị, Được công nhận |

**Quy chuẩn tương tác:**
- Chấm tròn 6px x 6px (`rounded-full`), căn giữa theo trục đứng với nhãn trạng thái.
- Nhãn hiển thị dùng font sans-serif hành chính (Inter / San Francisco / Roboto), cỡ chữ 12px–13px (`text-xs` hoặc `text-sm`), font-weight 500 (`font-medium`).
- Tuyệt đối không dùng hiệu ứng gradient bóng bẩy, không dùng viền đổ bóng nổi khối (no heavy drop-shadows), đảm bảo tương phản đạt chuẩn WCAG AA trên nền trắng và nền xám nhạt (`#F8FAFC`).

---

### 5. Bảng chuẩn hóa thuật ngữ tiếng Việt hành chính

| Thuật ngữ kỹ thuật cấm dùng | Thuật ngữ chuẩn hóa tiếng Việt hành chính | Ngữ cảnh xuất hiện |
| :--- | :--- | :--- |
| `ResolutionCase` / `Resolution Engine` | **Hồ sơ xét chọn** / **Hồ sơ phiên họp Hội đồng** | Danh sách và chi tiết xét chọn của Hội đồng |
| `Pipeline` / `Workflow Pipeline` | **Quy trình thẩm định** / **Tiến trình xét duyệt** | Hàng đợi thẩm định và tổng quan tiến độ |
| `Batch Dispatcher` / `Batch Forwarding` | **Gửi danh sách lên Thành phố** | Hành động của cán bộ Trường gửi đợt hồ sơ |
| `Canonical Review Completion` | **Hoàn tất thẩm định** | Nút bấm xác nhận kết thúc thẩm định hồ sơ |
| `Quorum Engine` / `Quorum State` | **Tình trạng biểu quyết Hội đồng** | Phiên họp Hội đồng cấp Thành phố |
| `Officer Workload Assignment` | **Hàng đợi thẩm định chung** (Shared Review Pool) | Phân công/tiếp nhận hồ sơ thẩm định |
| `AI Verdict` / `AI Assessment` | **AI hỗ trợ (Tham khảo)** | Trợ lý hỗ trợ đối soát minh chứng (thu gọn mặc định) |
| `Supplement Ticket` | **Yêu cầu bổ sung minh chứng** | Thao tác tương tác ngữ cảnh giữa cán bộ và sinh viên |
| `Pass` / `Fail` | **Đạt** / **Chưa đạt** | Đánh giá từng tiêu chí và từng minh chứng |
| `Recognized` / `Not Recognized` | **Được công nhận** / **Chưa được công nhận** | Quyết định chung thẩm của Hội đồng |
