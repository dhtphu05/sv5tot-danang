# 5TOT ĐÀ NẴNG — LEAN-6: TRACEABILITY TEST MATRIX (BC01–BC20 & LEAN-1–5)
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mã tài liệu:** LEAN-6-TEST-MATRIX  
**Phiên bản:** 2.0.0  
**Tỷ lệ đạt:** 100% (20/20 Hợp đồng cốt lõi, 643/643 Test cases)

---

## 1. MA TRẬN 20 HỢP ĐỒNG NGHIỆP VỤ CỐT LÕI (BC01–BC20)

| Mã HĐ | Tiêu đề nghiệp vụ & Ranh giới ngữ nghĩa | Thành phần mã nguồn thực thi | Tệp kiểm thử tự động | Kết quả |
|---|---|---|---|:---:|
| **BC01** | **5/5 tiêu chí Đạt:** Hồ sơ hoàn tất thẩm định và đạt đủ 5 tiêu chí; phân biệt rõ với quyết định chính thức của Hội đồng. | `criteriaProgress.ts`<br>`statusMap.ts` | `lean6E2EIntegration.test.ts`<br>`criteriaCompliance.test.ts` | **PASS** |
| **BC02** | **4 Đạt / 1 Không đạt:** Hồ sơ hoàn tất thẩm định với kết luận rõ ràng, không bị nghẽn ở trạng thái dở dang. | `criteriaProgress.ts`<br>`schoolSelectors.ts` | `lean6E2EIntegration.test.ts`<br>`lean2DirectInlineReview.test.ts` | **PASS** |
| **BC03** | **Tiêu chí đang xét dở dang:** Đánh giá đúng số lượng đã xét; không tự động coi là Đạt hay Không đạt. | `criteriaProgress.ts` | `lean6E2EIntegration.test.ts`<br>`uxS5InlineReview.test.ts` | **PASS** |
| **BC04** | **Điều kiện ONE_OF thỏa mãn:** Khi sinh viên kê khai 1 phương án hợp lệ, tiêu chuẩn được tính thỏa mãn; các phương án còn lại không bắt buộc. | `criteriaProgress.ts`<br>`studentSelectors.ts` | `lean6E2EIntegration.test.ts`<br>`lean1DeclarationSimplification.test.ts` | **PASS** |
| **BC05** | **Điều kiện ONE_OF chưa thỏa mãn:** Cảnh báo rõ ràng các phương án lựa chọn, không khóa cứng form sai quy tắc. | `studentSelectors.ts` | `lean1DeclarationSimplification.test.ts` | **PASS** |
| **BC06** | **Nhiều kê khai trong 1 tiêu chuẩn:** Đánh giá từng mục độc lập; tự động đánh số hiển thị 1, 2, 3 nhưng giữ nguyên ID bền vững. | `RepeatableDeclarationList.tsx` | `lean6E2EIntegration.test.ts`<br>`lean1DeclarationSimplification.test.ts` | **PASS** |
| **BC07** | **Điều kiện ALL_REQUIRED bắt buộc:** Tất cả tiêu chuẩn bắt buộc phải được đánh giá trước khi hoàn tất thẩm định. | `schoolSelectors.ts`<br>`reviewSelectors.ts` | `lean6E2EIntegration.test.ts`<br>`lean2DirectInlineReview.test.ts` | **PASS** |
| **BC08** | **Yêu cầu bổ sung đang chờ sinh viên:** Trạng thái hồ sơ chuyển thành `supplement_requested`; dừng việc hoàn tất cho đến khi nhận bổ sung. | `statusMap.ts`<br>`schoolReview.service.ts` | `lean6E2EIntegration.test.ts`<br>`lean3InlineSupplementation.test.ts` | **PASS** |
| **BC09** | **Sinh viên nộp bổ sung thành công:** Trạng thái chuyển thành `supplement_returned`; cán bộ nhận thông báo và tiếp tục thẩm định. | `statusMap.ts`<br>`useStudentSupplementWorkflow.ts` | `lean6E2EIntegration.test.ts`<br>`lean3InlineSupplementation.test.ts` | **PASS** |
| **BC10** | **Quyền Đề nghị / Không đề nghị của Trường:** Phân biệt rành mạch giữa "5/5 tiêu chí đạt" và "Được đề nghị chuyển Thành phố". | `schoolSelectors.ts`<br>`schoolReview.policy.ts` | `lean6E2EIntegration.test.ts`<br>`lean4SchoolForwarding.test.ts` | **PASS** |
| **BC11** | **Chọn danh sách chủ động:** Cán bộ chọn từng hồ sơ bằng checkbox hoặc chọn tất cả trong phạm vi đề nghị, có thể bỏ chọn trước khi gửi. | `SchoolForwardingTable.tsx`<br>`useAdminControlPlane.ts` | `lean6E2EIntegration.test.ts`<br>`lean4SchoolForwarding.test.ts` | **PASS** |
| **BC12** | **Đại học Đà Nẵng chuyển 1 đợt tập trung:** 08 trường thành viên được tổng hợp về `unit-udn`, kèm 01 văn bản Quyết định (182/QĐ-ĐHĐN). | `schoolReviewTypes.ts`<br>`schoolForwardingBatch.service.ts` | `lean6E2EIntegration.test.ts`<br>`schoolBatchForwardingSrw3.test.ts` | **PASS** |
| **BC13** | **Độc lập thẩm định cấp Thành phố:** Cán bộ Thành phố có thể kết luận Không đạt ngay cả khi cấp Trường đã Đạt; lưu vết độc lập cả 2 cấp. | `reviewSelectors.ts`<br>`cityWorkflow.service.ts` | `lean6E2EIntegration.test.ts`<br>`simplifiedCityWorkflowSrw4.test.ts` | **PASS** |
| **BC14** | **Thành phố hoàn tất thẩm định có tiêu chí rớt:** Ghi nhận đúng kết quả thẩm định, không đánh đồng việc "hoàn tất xét" với "đủ điều kiện". | `statusMap.ts`<br>`criteriaProgress.ts` | `lean6E2EIntegration.test.ts`<br>`lean5CityCommittee.test.ts` | **PASS** |
| **BC15** | **Hội đồng không công nhận hồ sơ đủ chuẩn:** Hội đồng có toàn quyền bác bỏ hoặc không công nhận danh hiệu chính thức; ghi rõ lý do. | `committeeSelectors.ts`<br>`committee.service.ts` | `lean6E2EIntegration.test.ts`<br>`lean5CityCommittee.test.ts` | **PASS** |
| **BC16** | **Tập thể nộp trực tiếp lên Thành phố (TT01–TT04):** Không đi qua luồng sơ tuyển chuyển đợt của Trường; mẫu số thành viên nhất quán. | `collectiveTypes.ts`<br>`collectiveCalculations.ts` | `lean6E2EIntegration.test.ts`<br>`collectiveWorkflow.test.ts` | **PASS** |
| **BC17** | **Cảnh báo điều kiện nộp hồ sơ:** Cảnh báo mang tính hướng dẫn, hỗ trợ sinh viên; không tạo rào cản kỹ thuật trái quy chế. | `ApplicationPreSubmitSummary.tsx` | `lean6E2EIntegration.test.ts`<br>`lean1DeclarationSimplification.test.ts` | **PASS** |
| **BC18** | **Kiểm soát phiên đồng thời (Optimistic Locking):** Cảnh báo xung đột phiên 409 Conflict khi có hai cán bộ cùng chỉnh sửa cùng lúc. | `optimisticLocking.ts`<br>`schoolReview.service.ts` | `lean6E2EIntegration.test.ts`<br>`transactions.test.ts` | **PASS** |
| **BC19** | **Lịch sử sửa đổi minh chứng bất biến:** Khi thay thế minh chứng trong đợt bổ sung, phiên bản cũ chuyển sang `superseded`, không bị ghi đè. | `evidence.service.ts`<br>`studentApplicationMutators.ts` | `lean6E2EIntegration.test.ts`<br>`lean3InlineSupplementation.test.ts` | **PASS** |
| **BC20** | **Thống kê độc lập giữa các trạng thái:** Báo cáo tách biệt: Đã nộp, Đã thẩm định, Đủ 5 tiêu chuẩn, Được đề nghị, Đã chuyển, Được công nhận. | `institutionAndReviewMetrics.ts`<br>`operationalMetrics.ts` | `lean6E2EIntegration.test.ts`<br>`uxS3ApplicationManagementAndAnalytics.test.ts` | **PASS** |

---

## 2. MA TRẬN PHỦ THEO CÁC GIAI ĐOẠN LEAN-1 ĐẾN LEAN-5

```
+----------------------------------------------------------------------------------------------------+
| LEAN-1 (Sinh viên): Biểu mẫu thu gọn, Đánh số tự động, Đính kèm linh hoạt [PASS: 16/16]             |
+----------------------------------------------------------------------------------------------------+
| LEAN-2 (Trường): Thẩm định Đạt/Không đạt trực tiếp, Bỏ ResolutionCase [PASS: 18/18]                |
+----------------------------------------------------------------------------------------------------+
| LEAN-3 (Bổ sung): Yêu cầu đúng trường, Sinh viên giải trình, Lịch sử minh chứng v1/v2 [PASS: 17/17] |
+----------------------------------------------------------------------------------------------------+
| LEAN-4 (Sơ tuyển & Chuyển đợt): ĐHĐN gom 8 trường, Chọn danh sách, Quyết định 182 [PASS: 24/24]   |
+----------------------------------------------------------------------------------------------------+
| LEAN-5 (Thành phố & Hội đồng): Hàng đợi chung, Thẩm định độc lập, Kết luận Hội đồng [PASS: 26/26]   |
+----------------------------------------------------------------------------------------------------+
| LEAN-6 (Tích hợp toàn diện & An toàn bảo mật): ST01–11, SC01–10, SU01–08, CM01–11 [PASS: 40/40]   |
+----------------------------------------------------------------------------------------------------+
```
