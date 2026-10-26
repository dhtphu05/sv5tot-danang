# LEAN-0.1: MA TRẬN PHÂN LOẠI TRẠNG THÁI NGHIỆP VỤ TOÀN HỆ THỐNG
## (Comprehensive Business State Matrix & Multi-Dimensional Decoupling)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức & vận hành:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Niên khóa áp dụng:** Năm học 2025–2026  
**Mục tiêu phân loại:** Tinh giản hiển thị nhận thức trên giao diện mà không làm biến đổi bất kỳ giá trị Enum nào trong mã nguồn hoặc lược đồ dữ liệu cơ sở; phân định dứt khoát 5 chiều trạng thái độc lập.

---

## 1. PHÂN LOẠI TINH GIẢN TRẠNG THÁI (SIMPLIFICATION TAXONOMY)

Mọi trạng thái hiện có trong hệ thống được thẩm định và gán vào một trong 5 nhóm chuẩn tắc sau:

- **Nhóm A (Keep & Expose):** Giữ nguyên giá trị và hiển thị trực tiếp trên giao diện người dùng. Đây là các mốc trạng thái chính thức có ý nghĩa pháp lý và hành chính.
- **Nhóm B (Keep Internally, Simplify UI):** Giữ nguyên trong mã nguồn/database để đảm bảo tính tương thích ngược, nhưng hiển thị ra giao diện bằng nhãn tiếng Việt hành chính chuẩn, ngắn gọn và gần gũi.
- **Nhóm C (Synthesize / Derive on the Fly):** Loại bỏ việc bắt người dùng bấm chọn thủ công; hệ thống tự động suy diễn trạng thái từ dữ liệu thực tế (dòng kê khai, minh chứng, tỷ lệ).
- **Nhóm D (Consolidate in UI):** Hợp nhất các trạng thái trùng lặp hoặc phân mảnh trên giao diện (ví dụ: gộp các trạng thái trung gian "đang mở xem" vào trạng thái chính).
- **Nhóm E (Eliminate from UI Flow):** Ẩn hoặc loại bỏ hoàn toàn khỏi luồng làm việc của người dùng vì là tàn dư kỹ thuật hoặc cơ chế phân công không phù hợp với thực tế vận hành.

---

## 2. BẢNG PHẢN CHIẾU TRẠNG THÁI TOÀN HỆ THỐNG (STATE PROJECTION TABLE)

Bảng dưới đây quy định cách chuyển đổi từ Trạng thái Backend chuẩn tắc sang Ý nghĩa nghiệp vụ, Nhãn giao diện người dùng và Các hành động được phép thực hiện:

| Nhóm dữ liệu | Trạng thái Backend (Canonical State) | Ý nghĩa nghiệp vụ chuẩn | Nhãn hiển thị trên giao diện (Lean UI) | Hành động người dùng được phép thực hiện (Permitted Actions) |
| :--- | :--- | :--- | :--- | :--- |
| **Giai đoạn Thẩm định** | `SCHOOL` | Hồ sơ đang thuộc thẩm quyền xét sơ cấp Trường / ĐHĐN | **Cấp Trường xét sơ** | Cán bộ Trường thẩm tra minh chứng, đánh giá dòng, gửi bổ sung, ghi nhận đề xuất. |
| | `CITY` | Hồ sơ đã được Trường chuyển lên Thành phố | **Cấp Thành phố thẩm định** | Cán bộ TP thẩm định độc lập; Cán bộ Trường chỉ được xem lịch sử (Read-Only). |
| | `COMPLETED` | Toàn bộ quy trình xét duyệt hai cấp và Hội đồng đã kết thúc | **Đã hoàn tất xét duyệt** | Tra cứu kết quả, xem biên bản phiên họp Hội đồng, tải quyết định công nhận. |
| **Tiến độ Thẩm định** | `not_reviewed` | Chưa có cán bộ nào mở ra đánh giá | **Chưa xét** | Bấm xem hồ sơ, bắt đầu thẩm tra. |
| | `under_review` / `reviewing` | Đang trong quá trình kiểm tra đối soát | **Đang xét** | Nhấp [Đạt], [Không đạt], mở ô [Ghi nhận xét], bấm [Yêu cầu bổ sung]. |
| | `review_completed` | Đã hoàn tất xem xét toàn bộ các mục bắt buộc | **Hoàn tất thẩm định** | Thay đổi đánh giá nếu cần; ghi nhận kết luận đề xuất chính thức. |
| **Kết quả Đủ điều kiện**| `eligible` (5/5 đạt) | Thỏa mãn đầy đủ 5 tiêu chuẩn theo quy chế | **Đủ điều kiện sơ bộ (5/5)** | Đủ điều kiện để Cán bộ Trường cân nhắc đưa vào danh sách đề xuất. |
| | `ineligible` (< 5 đạt) | Có ít nhất 1 tiêu chuẩn không đạt yêu cầu | **Không đủ điều kiện (X/5 đạt)** | Ghi nhận kết luận "Không đề xuất"; hồ sơ không được chuyển tiếp. |
| **Kết luận Đề xuất** | `pending` | Trường chưa đưa ra kết luận đề xuất | **Chờ kết luận đề xuất** | Chọn "Đề xuất chuyển Thành phố" hoặc "Không đề xuất". |
| | `recommended` | Trường chính thức đề xuất công nhận cấp TP | **Đề xuất chuyển Thành phố** | Đưa vào danh sách đợt chuyển giao kèm Quyết định đề xuất. |
| | `not_recommended` | Trường quyết định không đề xuất chuyển | **Không đề xuất** | Lưu hồ sơ tại đơn vị; xuất biên bản thông báo kết quả cấp trường. |
| **Chuyển giao Trường** | `DRAFT` | Đang lập danh sách hồ sơ chuyển Thành phố | **Đang lập đợt đề xuất** | Tích chọn/bỏ chọn hồ sơ, tải lên Quyết định đề xuất và danh sách ký duyệt. |
| | `FORWARDED` | Đã ký chuyển giao chính thức lên Thành phố | **Đã chuyển Thành phố** | Tải file Quyết định, tra cứu danh sách đã chuyển. Khóa sửa đổi tại trường. |
| **Quyết nghị Hội đồng** | `committee_pending` | Đang chờ Hội đồng Thành phố xem xét | **Chờ Hội đồng quyết nghị** | Ban Thư ký lập bảng tổng hợp số liệu, hồ sơ tiêu biểu. |
| | `finalized_recognized` | Hội đồng đã biểu quyết công nhận danh hiệu | **Được công nhận danh hiệu** | Ban hành Quyết định chính thức kèm danh sách công nhận. |
| | `finalized_not_recognized`| Hội đồng không công nhận danh hiệu | **Không công nhận** | Ghi nhận lý do vào biên bản phiên họp. |
| | `published` | Kết quả đã được công bố chính thức | **Đã công bố kết quả** | Tra cứu công khai trên Cổng thông tin phong trào. |

---

## 3. MA TRẬN TRẠNG THÁI HỒ SƠ CÁ NHÂN (INDIVIDUAL TRACK)

### 3.1 Cấp thẩm định chính thức (`ReviewStage`)
*Tệp nguồn: `/src/staff/schoolReviewTypes.ts`*

| Mã trạng thái (Enum) | Nhãn hiện tại | Tác nhân kích hoạt | Phân loại | Nhãn Lean đề xuất | Giải thích & Quy tắc tinh giản |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `SCHOOL` | Xét sơ cấp Trường | Sinh viên nộp hồ sơ | **A** | **Cấp Trường xét sơ** | Giữ nguyên. Thể hiện hồ sơ đang thuộc thẩm quyền giải quyết của Trường/ĐH Đà Nẵng. |
| `CITY` | Xét duyệt cấp Thành phố | Trường ký chuyển giao | **A** | **Cấp Thành phố thẩm định** | Giữ nguyên. Thể hiện hồ sơ đã chuyển lên Hội Sinh viên Thành phố thẩm định độc lập. |
| `COMPLETED` | Đã hoàn tất | Hội đồng ban hành QĐ | **A** | **Đã hoàn tất xét duyệt** | Giữ nguyên. Thể hiện toàn bộ quy trình 2 cấp và Hội đồng đã kết thúc. |

---

### 3.2 Trạng thái xét sơ tuyển cấp Trường (`SchoolPreliminaryStatus`)
*Tệp nguồn: `/src/staff/schoolReviewTypes.ts`*

| Mã trạng thái (Enum) | Nhãn hiện tại | Tác nhân (Actor) | Phân loại | Nhãn Lean đề xuất | Vai trò & Hành vi luồng |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `pending_intake` | Chờ tiếp nhận xét sơ | Hệ thống tiếp nhận | **A** | **Chờ tiếp nhận** | Hồ sơ mới nộp từ sinh viên, cán bộ trường chưa bấm mở xem. |
| `under_review` | Đang xét sơ tuyển | Cán bộ Trường | **A** | **Đang xét sơ** | Cán bộ trường đã mở và đang thẩm tra minh chứng. |
| `supplement_requested` | Cần bổ sung (Cấp Trường) | Cán bộ Trường | **A** | **Chờ SV bổ sung** | Trường yêu cầu sinh viên bổ sung tài liệu trước khi chốt danh sách. |
| `supplement_returned` | Đã nhận bổ sung (Cấp Trường) | Sinh viên nộp lại | **A** | **Đã nộp bổ sung** | Sinh viên đã cập nhật minh chứng, sẵn sàng cho trường kiểm tra lại. |
| `preliminary_completed` | Đã hoàn tất xét sơ | Hệ thống tự tính | **C** | **Đã hoàn tất thẩm định sơ bộ** | **Tự động suy diễn:** Khi 5/5 tiêu chí đã có kết luận rõ ràng (dù Đạt hay Không đạt). Không đồng nghĩa với việc tự động Đề xuất. |
| `recommended_forwarding` | Đề xuất chuyển Thành phố | Cán bộ Trường | **A** | **Đề xuất công nhận** | Quyết định hành chính của Trường đưa vào danh sách đề xuất chuyển Thành phố. |
| `not_recommended` | Không đề xuất chuyển | Cán bộ Trường | **A** | **Không đề xuất** | Quyết định hành chính của Trường: Hồ sơ không đạt yêu cầu hoặc không đủ điều kiện đề xuất. |
| `forwarded_to_city` | Đã chuyển Thành phố | Lãnh đạo Trường ký | **A** | **Đã chuyển Thành phố** | Hồ sơ đã nằm trong đợt chuyển chính thức kèm Quyết định đề xuất của Trường. |

---

### 3.3 Trạng thái đánh giá mục kê khai (`StaffItemReviewStatus`)
*Tệp nguồn: `/src/staff/reviewTypes.ts`*

| Mã trạng thái (Enum) | Nhãn hiện tại | Tác nhân | Phân loại | Nhãn Lean đề xuất | Hành vi & Tinh giản |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `not_reviewed` | Chưa xét | Hệ thống ban đầu | **A** | **Chưa xét** | Mặc định khi cán bộ chưa đánh giá mục này. |
| `viewed` | Đang xét | Tự động khi click xem | **D** | *(Gộp vào Chưa xét / Đang xét)* | Không bắt cán bộ lưu trạng thái này. Nếu chỉ mới xem mà chưa kết luận, hiển thị trạng thái trung tính. |
| `suitable` | Phù hợp | Cán bộ click [Đạt] | **A** | **Đạt** | Phán quyết dương tính trực tiếp. 1 click duy nhất. |
| `unsuitable` | Không phù hợp | Cán bộ click [Không đạt] | **A** | **Không đạt** | Phán quyết không phù hợp, có thể kèm ghi chú lý do ngắn gọn. |
| `needs_supplement` | Cần bổ sung | Cán bộ gửi yêu cầu | **A** | **Yêu cầu bổ sung** | Kích hoạt luồng phản hồi tới sinh viên với phạm vi chỉ định. |
| `supplement_returned` | Đã nhận bổ sung | Sinh viên gửi lại | **A** | **Đã bổ sung** | Nêu bật thay đổi (diff) để cán bộ đối soát nhanh. |
| `needs_consideration` | Cần xem xét thêm | Cán bộ đánh dấu | **B** | **Cần xem xét thêm** | Lưu ý nội bộ cho Tổ thẩm định/Hội đồng trao đổi, không ảnh hưởng trực tiếp tới sinh viên. |
| `review_completed` | Hoàn tất xét | Nút bấm cũ | **C** | *(Tự động đồng bộ với phán quyết)* | Dòng tự động coi là hoàn tất khi đã có phán quyết Đạt hoặc Không đạt. |

---

### 3.4 Trạng thái tổng hợp tiêu chí (`StaffWorkspaceCriterionStatus`)
*Tệp nguồn: `/src/staff/reviewTypes.ts`*

| Trạng thái | Phân loại | Cơ chế suy diễn chuẩn xác (Derived Completion & Eligibility) |
| :--- | :---: | :--- |
| `not_reviewed` | **C** | Tự động hiển thị khi chưa có mục nào trong tiêu chí được đánh giá. |
| `reviewing` | **C** | Tự động hiển thị khi có một số mục đã đánh giá nhưng chưa đủ điều kiện để kết luận Đạt hoặc Không đạt. |
| `needs_supplement` | **C** | Tự động hiển thị nếu có bất kỳ mục nào đang ở trạng thái `needs_supplement`. |
| `supplement_returned`| **C** | Tự động hiển thị khi sinh viên nộp lại bổ sung cho tiêu chí này. |
| `completed` | **C** | **TIẾN ĐỘ HOÀN TẤT:** Tự động chuyển khi mọi yêu cầu cần thiết đã có phán quyết dứt khoát. Đi kèm nhãn kết quả: **ĐẠT (PASS)** hoặc **KHÔNG ĐẠT (FAIL)**. Bỏ hoàn toàn nút bấm thủ công. |

---

## 4. MA TRẬN TRẠNG THÁI HỒ SƠ TẬP THỂ (COLLECTIVE TRACK - TT01 ĐẾN TT04)

*Tệp nguồn: `/src/staff/collectiveTypes.ts`*

| Mã trạng thái (Enum) | Nhãn hiện tại | Phân loại | Xử lý Lean đề xuất | Giải thích nghiệp vụ |
| :--- | :--- | :---: | :--- | :--- |
| `draft` | Đang kê khai | **A** | **Đang soạn thảo** | Tập thể đang nhập số liệu TT01–TT04 và tải minh chứng. |
| `submitted_for_unit_confirmation` | Chờ đơn vị xác nhận | **E** | **LOẠI BỎ KHỎI UI** | Hồ sơ Tập thể nộp trực tiếp cấp Thành phố. Không qua xét duyệt đơn vị cơ sở. |
| `returned_for_correction` | Đơn vị trả về | **E** | **LOẠI BỎ KHỎI UI** | Tàn dư quy trình cũ. |
| `unit_confirmed_and_forwarded` | Đơn vị đã chuyển | **E** | **LOẠI BỎ KHỎI UI** | Tàn dư quy trình cũ. |
| `city_unassigned` | Tiếp nhận · Chờ phân công | **B** | **Chờ thẩm định** | Quy trình Thành phố là shared queue. Bỏ cơ chế "phân công cán bộ bắt buộc". |
| `city_assigned` | Đã phân công cán bộ | **E** | **LOẠI BỎ KHỎI UI** | Không ép buộc phân công cá nhân; mọi cán bộ có thẩm quyền đều có thể nhận việc và thẩm định. |
| `city_in_review` / `city_under_review` | Đang thẩm định | **A** | **Đang thẩm định** | Cán bộ Thành phố đang kiểm tra 4 tiêu chuẩn TT01–TT04. |
| `city_supplement_pending` / `city_supplement_requested` | Chờ bổ sung minh chứng | **A** | **Chờ bổ sung** | Thành phố yêu cầu tập thể bổ sung tài liệu chứng minh. |
| `city_supplement_returned` | Đã nộp bổ sung | **A** | **Đã bổ sung** | Tập thể nộp lại minh chứng bổ sung. |
| `city_review_completed` | Hoàn tất thẩm định Cán bộ | **C** | **Đã hoàn tất thẩm định TP** | Tự động hiển thị khi 4/4 tiêu chuẩn đã được xét xong (kèm chỉ số Đạt/Không đạt). |
| `committee_pending` | Hội đồng đang xem xét | **A** | **Chờ Hội đồng quyết nghị** | Đưa vào danh sách xem xét chung của Hội đồng Thành phố. |
| `finalized` | Đã hoàn tất kết luận | **A** | **Đã có quyết định** | Hội đồng đã kết luận danh sách đạt danh hiệu. |
| `published` | Đã công bố kết quả | **A** | **Đã công bố** | Công khai kết quả danh hiệu trên cổng thông tin phong trào. |

---

## 5. TỔNG HỢP KẾT QUẢ VÀ TÍNH KHẢ DỤNG ĐỒNG THỜI CỦA CÁC CHIỀU DỮ LIỆU

Một hồ sơ sinh viên tại cấp Trường có thể đồng thời sở hữu trạng thái hợp lệ như sau:
- **Tiến độ thẩm định (Review Completeness):** `COMPLETE` (Đã xét 5/5 tiêu chí).
- **Kết quả đủ điều kiện (Eligibility):** `INELIGIBLE` (4/5 tiêu chí đạt, 1 tiêu chí không đạt).
- **Kết luận đề xuất (Recommendation):** `NOT_RECOMMENDED` (Trường không đề xuất chuyển).
- **Tình trạng chuyển giao (Forwarding):** `NOT_FORWARDED` (Không nằm trong đợt chuyển giao).

Đây là một trạng thái nghiệp vụ hoàn toàn hợp pháp, chuẩn tắc và minh bạch, không phải là lỗi dữ liệu hay tình trạng dữ liệu mâu thuẫn.
