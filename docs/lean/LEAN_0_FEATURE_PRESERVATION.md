# LEAN-0.1: MA TRẬN KẾ HOẠCH BẢO TOÀN NĂNG LỰC NGHIỆP VỤ HỆ THỐNG
## (Feature Preservation Plan & Quality Assurance Test Gates)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức & vận hành:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Cam kết chất lượng:** Quá trình tinh giản Lean UX tuyệt đối không làm mất đi, không làm suy giảm và không làm hạ chuẩn bất kỳ quy định nghiệp vụ, thẩm quyền pháp lý, tính bảo mật hay tính giải trình kiểm toán nào đã được phê duyệt.  
**Tuyên bố phân loại:** Đây là **Kế hoạch bảo toàn và Cổng kiểm thử chất lượng (Test Gates)** sẽ được kiểm chứng tự động và nghiệm thu thực địa trong Giai đoạn LEAN-6; không phải là tuyên bố đã nghiệm thu trước khi thực thi.

---

## 1. MA TRẬN KẾ HOẠCH BẢO TOÀN TÍNH NĂNG TOÀN DIỆN (PRESERVATION MATRIX & TEST GATES)

| STT | Năng lực / Tính năng nghiệp vụ | Hiện trạng mã nguồn | Mục tiêu bảo toàn Lean UX | Cổng kiểm thử nghiệm thu (Quality Gate / Test Plan) |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Kiến trúc thẩm định 2 cấp chính thức** | `ReviewStage`: `SCHOOL` -> `CITY` -> `COMPLETED` (`schoolReviewTypes.ts`) | **BẢO TOÀN TUYỆT ĐỐI** | Kiểm thử luồng: Cấp Trường xét sơ đề xuất, Cấp Thành phố thẩm định độc lập; dữ liệu không bị ghi đè. Cổng kiểm thử: BC01, BC13, BC14. |
| **2** | **Cơ chế Định tuyến Hub Đại học Đà Nẵng (UDN)** | `INSTITUTION_TO_SCHOOL_REVIEW_UNIT_MAP` định tuyến 8 trường về `unit-udn` | **BẢO TOÀN TUYỆT ĐỐI** | 8 trường thành viên giữ nguyên mã trường đào tạo; chung 1 đợt chuyển giao và 1 Quyết định đề xuất duy nhất của Giám đốc ĐHĐN. Cổng: BC12. |
| **3** | **Thẩm quyền các Trường Đại học độc lập** | `AUTHORITATIVE_SCHOOL_REVIEW_UNITS`: Duy Tân, Đông Á, Kiến trúc, TDTT, KTYD, FPT | **BẢO TOÀN TUYỆT ĐỐI** | Mỗi trường độc lập tự quản lý danh sách sơ tuyển của mình và ban hành Quyết định đề xuất riêng biệt. Cổng: BC11. |
| **4** | **Độ chuẩn tắc 5 Tiêu chuẩn cá nhân** | `CRITERIA_DEFINITIONS`: Đạo đức tốt, Học tập tốt, Thể lực tốt, Tình nguyện tốt, Hội nhập tốt | **BẢO TOÀN TUYỆT ĐỐI** | Giữ vững toàn bộ ngưỡng ĐRL (>=80), GPA (>=3.2), số ngày tình nguyện (>=5), chuẩn ngoại ngữ (TOEIC 500, IELTS 5.0). Cổng: BC01, BC06, BC07. |
| **5** | **Hồ sơ Tập thể (TT01–TT04) nộp trực tiếp** | `collectiveTypes.ts`: TT01 (Cấp trường), TT02 (100%), TT03 (>=20%), TT04 (Kỷ luật) | **BẢO TOÀN TUYỆT ĐỐI** | Giữ trọn vẹn 4 tiêu chuẩn. Hồ sơ nộp thẳng cấp Thành phố, không qua xét sơ cấp Trường hay đợt chuyển giao. Cổng: BC16. |
| **6** | **Mẫu số dùng chung giữa TT02 và TT03** | `totalMembers` trong `CollectiveTT02Data` kế thừa sang `CollectiveTT03Data` | **BẢO TOÀN TUYỆT ĐỐI** | Tỷ lệ % đạt SV5T của tập thể được tính tự động dựa trên tổng sĩ số thống nhất, ngăn ngừa sai lệch số liệu. Cổng: BC16. |
| **7** | **Nhật ký kiểm toán & Lịch sử xử lý bất biến** | `historyEvents` trong `ApplicationReviewWorkspaceState` | **BẢO TOÀN TUYỆT ĐỐI** | Mọi lần nhấp chuột Đạt/Không đạt, gửi bổ sung, kèm tên cán bộ, vai trò và dấu thời gian đều được lưu vết vĩnh viễn. Cổng: BC08, BC18. |
| **8** | **Trình xem minh chứng độ phân giải cao** | `EvidenceReviewViewer.tsx` (Hỗ trợ PDF, ảnh, xoay, phóng to, thu nhỏ) | **BẢO TOÀN TUYỆT ĐỐI** | Cán bộ kiểm tra chi tiết từng con dấu, chữ ký trên tài liệu scan mà không phải tải tệp về máy tính cá nhân. Cổng: Thẩm định inline. |
| **9** | **Khóa an toàn sau khi chuyển giao (Read-Only)** | Cờ `isSchoolForwarded` và `canMutate` | **BẢO TOÀN TUYỆT ĐỐI** | Ngay khi Trường ký chuyển lên Thành phố, hồ sơ tự động khóa quyền chỉnh sửa ở cấp Trường để đảm bảo tính toàn vẹn dữ liệu. Cổng: BC19. |
| **10** | **Hồ sơ sinh viên 13 trường chuẩn tắc** | `StudentProfileDto` (4 nhóm thông tin cá nhân, học tập, Đoàn-Hội, liên hệ) | **BẢO TOÀN TUYỆT ĐỐI** | Lưu trữ bất biến trong `applicantProfileSnapshot`, bảo đảm tính định danh pháp lý của ứng viên. Cổng: Khởi tạo hồ sơ. |
| **11** | **Xuất danh sách và báo cáo biểu mẫu Excel** | `exportService.ts` (Mẫu đề xuất cấp trường, danh sách Hội đồng, phụ lục QĐ) | **BẢO TOÀN TUYỆT ĐỐI** | Xuất dữ liệu phục vụ ký ban hành văn bản hành chính theo đúng thể thức văn bản của Đoàn - Hội. Cổng: BC20. |
| **12** | **Thẩm quyền tối cao của Hội đồng Thành phố** | `CommitteeApplicationWorkspace.tsx` & `DecisionDialog.tsx` | **BẢO TOÀN TUYỆT ĐỐI** | Chỉ Hội đồng mới có thẩm quyền ban hành Quyết định công nhận danh hiệu chính thức và công bố kết quả. Cổng: BC15. |

---

## 2. KẾ HOẠCH BẢO ĐẢM TÍNH TOÀN VẸN VỀ BẢO MẬT VÀ PHÂN QUYỀN

### 2.1 Phân định vai trò và phạm vi dữ liệu (Role-Based Access Control)
- **Cán bộ Trường:** Chỉ được xem và thẩm định hồ sơ có `trainingInstitutionId` thuộc thẩm quyền của đơn vị mình. Tuyệt đối không thể truy cập hồ sơ của trường đại học khác.
- **Cán bộ Thành phố:** Tiếp nhận toàn bộ hồ sơ đã được các Trường chuyển giao hợp lệ. Có quyền xem xét lại toàn bộ minh chứng gốc và kết luận sơ bộ của trường.
- **Sinh viên:** Chỉ xem được hồ sơ của chính mình; chỉ được chỉnh sửa hoặc tải tệp bổ sung khi nhận được yêu cầu bổ sung còn trong hạn chót.

### 2.2 Tách biệt nội bộ và công khai (Data Privacy Boundary)
- **Ghi chú nội bộ (`internalNote`):** Được bảo vệ nghiêm ngặt. Chỉ hiển thị cho Cán bộ Trường, Cán bộ Thành phố và Hội đồng. Tuyệt đối không để rò rỉ ra API Cổng sinh viên hoặc thông báo công khai.
- **Lời nhắn yêu cầu bổ sung (`message`):** Là nội dung giao tiếp hành chính chính thức gửi sinh viên để hướng dẫn hoàn thiện hồ sơ.

---

## 3. TIÊU CHÍ NGHIỆM THU CỔNG KIỂM THỬ KHÔNG SUY GIẢM (ZERO-REGRESSION GATES)

Để chính thức công bố "100% năng lực được bảo toàn", hệ thống bắt buộc phải vượt qua:
1. **Kiểm thử tự động (Automated Test Suite):** Chạy `vitest run`, 100% test cases của các selector (`reviewSelectors`, `schoolSelectors`, `committeeSelectors`) đều đạt trạng thái Passed.
2. **Kiểm thử biên dịch kiểu dữ liệu (Strict TypeScript Check):** Chạy `tsc --noEmit` không phát hiện bất kỳ cảnh báo hoặc lỗi nào.
3. **Kiểm thử 20 kịch bản chấp nhận người dùng (User Acceptance Tests: BC01–BC20):** Thực hiện kiểm thử thủ công và tự động theo đúng đặc tả tại tài liệu `LEAN_0_1_REVIEW_STATE_TRUTH_TABLE.md`.
