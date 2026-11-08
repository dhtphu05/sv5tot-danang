# Thiết kế Tích hợp OpenAI OCR Minh chứng & Đánh giá Sơ bộ Hồ sơ SV5T Đà Nẵng

- **Ngày lập**: 2026-11-08
- **Dự án**: Hệ thống Xét chọn Sinh viên 5 Tốt cấp Thành phố Đà Nẵng (`sv5tot-danang`)
- **Phân loại**: Architectural Spec
- **Trạng thái**: Chờ duyệt triển khai

---

## 1. Mục tiêu & Nguyên tắc Thiết kế

### 1.1. Mục tiêu nghiệp vụ
1. **Bóc tách nội dung minh chứng tự động (OpenAI Vision & Document OCR)**: Sử dụng trực tiếp các model của OpenAI (`gpt-4o-mini` mặc định cho tốc độ cao và tiết kiệm chi phí, hỗ trợ cấu hình nâng cấp lên `gpt-4o` qua biến môi trường) để đọc nội dung tệp minh chứng (ảnh chụp/scan `JPG`, `PNG`, `WEBP` và tài liệu `PDF`).
2. **Đánh giá sơ bộ tự động theo Bộ tiêu chí SV5T (`2025–2026`)**: Đối chiếu thông tin đọc được từ minh chứng với nội dung sinh viên kê khai và ngưỡng quy chuẩn tại Hướng dẫn số 14-HD/BTK-HSVTP để phân loại thành 3 trạng thái rõ ràng:
   - **Đạt sơ bộ (`PRELIMINARY_PASS`)**: Minh chứng hợp lệ, đọc rõ thông tin, có dấu/xác nhận, khớp nội dung kê khai và đạt ngưỡng tiêu chuẩn.
   - **Cần kiểm tra thêm (`NEEDS_VERIFY`)**: Minh chứng bị mờ, thiếu trang, chưa rõ dấu xác nhận, hoặc thuộc diện thành tích tương đương cần cán bộ xem xét.
   - **Chưa đạt (`PRELIMINARY_FAIL`)**: Sai lệch thông tin trọng yếu (sai tên sinh viên, ngoài thời hạn năm học), không đạt ngưỡng bắt buộc (ví dụ GPA < 3.2, điểm rèn luyện < 80, thiếu ngày tình nguyện), hoặc thiếu tệp minh chứng bắt buộc.
3. **Chạy tự động ngay khi tải minh chứng / nộp hồ sơ**: Đảm bảo khi Cán bộ xét duyệt mở hồ sơ ra là đã có sẵn kết quả đánh giá sơ bộ tức thì (0 giây chờ đợi), đồng thời có nút **"Phân tích lại"** khi cần quét lại.

### 1.2. Nguyên tắc UI/UX cho Cán bộ Non-Tech ("Nhìn là hiểu")
- **Tuyệt đối không dùng Emoji trên giao diện**: Sử dụng 100% hệ thống icon vector từ `lucide-react` (`CheckCircle2`, `AlertTriangle`, `XCircle`, `FileCheck2`, `ScanSearch`, `Sparkles`, `RefreshCw`, `Check`, `MessageSquareWarning`) đồng bộ với bảng màu thiết kế của hệ thống (`#0F2335`, `#16A34A`, `#B45309`, `#DC2626`, `#0D78AE`).
- **Ngôn ngữ hành chính tự nhiên, dễ hiểu**: Tuân thủ `5TOT_PRODUCT_LANGUAGE_GUIDE.md` — không hiển thị các thuật ngữ kỹ thuật như `OCR confidence`, `JSON payload`, `LLM token`. Thay bằng: *"Thông tin đọc từ minh chứng"*, *"Đạt sơ bộ"*, *"Cần kiểm tra thêm"*, *"Chưa đạt"*.
- **Tích hợp trực tiếp trên luồng chấm duyệt (Inline & Scannable)**: Không bắt cán bộ mở nhiều cửa sổ phức tạp; hiển thị trạng thái sơ bộ và bảng đối chiếu *"Sinh viên kê khai"* vs *"Đọc từ minh chứng"* ngay tại từng dòng kê khai kèm nút thao tác 1-Click.
- **Giữ nguyên thẩm quyền quyết định của Cán bộ**: Mọi đánh giá của AI là gợi ý sơ bộ; quyết định chính thức (`Đạt` / `Không đạt` / `Yêu cầu bổ sung`) luôn do cán bộ bấm xác nhận.

---

## 2. Kiến trúc Hệ thống & Luồng Dữ liệu

```
[Sinh viên tải minh chứng / Nộp hồ sơ]  hoặc  [Cán bộ bấm "Phân tích lại"]
                    │
                    ▼
    ┌───────────────────────────────────────────────────┐
    │ Backend V2: Copilot & OCR Evaluation Module       │
    │ 1. OpenaiOcrService (gpt-4o-mini / gpt-4o Vision) │
    │    - Đọc ảnh/PDF -> Trích xuất JSON chuẩn hóa     │
    │ 2. CriteriaEvaluationService                      │
    │    - Đối chiếu Kê khai vs Minh chứng vs Quy chế   │
    │    - Tổng hợp 3 cấp: Minh chứng -> Kê khai ->     │
    │      Tiêu chí -> Toàn bộ hồ sơ                    │
    │ 3. Lưu Cache kết quả đánh giá sơ bộ               │
    └───────────────────────────────────────────────────┘
                    │
                    ▼
    ┌───────────────────────────────────────────────────┐
    │ Giao diện Cán bộ Xét duyệt (Non-Tech Friendly UX) │
    │ - Bảng danh sách hồ sơ: Cột "Đánh giá sơ bộ"      │
    │ - Đầu hồ sơ: Thanh tóm tắt 5 tiêu chí + Duyệt nhanh│
    │ - Từng dòng kê khai: Hộp đối chiếu Kê khai vs OCR │
    │ - Trình xem minh chứng: Chi tiết trường thông tin │
    └───────────────────────────────────────────────────┘
```

### 2.1. Cấu hình Môi trường (`backend/src/config/environment.ts` & `.env`)
Bổ sung cấu hình kết nối OpenAI trực tiếp (`api.openai.com`):
- `OPENAI_API_KEY`: Khóa API OpenAI (tùy chọn trong môi trường `development`/`test`, bắt buộc khi bật chế độ AI thực tế).
- `OPENAI_MODEL`: Mặc định `gpt-4o-mini` (hỗ trợ cả Vision và Structured Outputs với tốc độ phản hồi 2–4 giây), cho phép đổi sang `gpt-4o` khi cần.
- `OPENAI_BASE_URL`: Mặc định `https://api.openai.com/v1`.

### 2.2. Dịch vụ Bóc tách Minh chứng (`backend/src/modules/copilot/openaiOcr.service.ts`)
- **Đầu vào**:
  - Thông tin tệp minh chứng (`fileName`, `mimeType`, `url` hoặc dữ liệu base64/buffer lấy từ Cloudflare R2 qua `r2StorageClient` hoặc data URL).
  - Ngữ cảnh kê khai của sinh viên (`studentFullName`, `studentCode`, `criterionName`, `requirementTitle`, `declaredValue`).
- **Xử lý với OpenAI Structured Outputs (`json_schema`)**:
  - Đối với tệp ảnh (`image/jpeg`, `image/png`, `image/webp`): Truyền qua `image_url` (với `detail: "high"` để đọc rõ chữ nhỏ trên bảng điểm và con dấu).
  - Đối với tệp `application/pdf`: Hỗ trợ truyền tệp PDF vào OpenAI Responses/Chat API (`type: "file"`) hoặc trích xuất văn bản để OpenAI đọc chính xác.
- **Đầu ra chuẩn hóa (`OcrEvidenceExtraction`)**:
  ```ts
  export interface OcrEvidenceExtraction {
    evidenceId: string;
    fileName: string;
    isReadable: boolean;
    documentType: string;           // VD: "Bảng điểm học tập", "Giấy chứng nhận", "Quyết định khen thưởng"
    extractedStudentName?: string;  // Họ tên sinh viên đọc được trên giấy
    extractedStudentCode?: string;  // MSSV đọc được trên giấy
    extractedValue: string;         // Giá trị cốt lõi: VD "GPA 3.45/4.0", "05 ngày tình nguyện", "IELTS 6.5"
    numericMetric?: number;         // Con số trích xuất (VD: 3.45, 85, 5, 6.5) để đối chiếu ngưỡng
    issuingAuthority?: string;      // Đơn vị cấp
    issueDate?: string;             // Ngày ban hành / năm học
    hasRedStampOrSignature: 'verified' | 'missing' | 'unclear';
    matchWithDeclaration: 'matched' | 'mismatch' | 'partial';
    discrepancyNote?: string;       // Giải thích ngắn gọn nếu có sai lệch
  }
  ```

### 2.3. Dịch vụ Đánh giá Sơ bộ theo Bộ tiêu chí (`backend/src/modules/copilot/criteriaEvaluation.service.ts`)
Kết hợp giữa **Rule Engine định lượng** và **OpenAI ngữ nghĩa** dựa trên bộ tiêu chí SV5T Đà Nẵng:
1. **Tiêu chí 1 — Đạo đức tốt**: Kiểm tra Điểm rèn luyện $\ge 80/100$, không vi phạm kỷ luật, và điều kiện tự chọn (Đảng viên / Cảm tình Đảng / Thanh niên tiên tiến / Cuộc thi chính trị).
2. **Tiêu chí 2 — Học tập tốt**: Kiểm tra GPA năm học $\ge 3.2/4.0$ ($\ge 8.0/10$) đối với hệ Đại học (hoặc $\ge 3.0/4.0$ hệ Cao đẳng) VÀ tối thiểu 01 điều kiện nghiên cứu khoa học / thi học thuật.
3. **Tiêu chí 3 — Thể lực tốt**: Kiểm tra ít nhất 01 trong 02 điều kiện (Danh hiệu "Thanh niên khỏe" hoặc đạt giải thể thao phong trào từ cấp Trường trở lên; lưu ý trường hợp sinh viên khuyết tật).
4. **Tiêu chí 4 — Tình nguyện tốt**: Kiểm tra tổng số ngày tình nguyện cộng dồn $\ge 05$ ngày/năm học (bao gồm quy đổi hiến máu tình nguyện) HOẶC giấy khen hoạt động tình nguyện từ cấp Khoa/Trường trở lên.
5. **Tiêu chí 5 — Hội nhập tốt**: Kiểm tra đạt cả **Nhóm A** (Kỹ năng thực hành xã hội / Khen thưởng Đoàn-Hội / Giao lưu quốc tế) và **Nhóm B** (Chuẩn ngoại ngữ B1 / IELTS $\ge 4.5$ / TOEIC $\ge 405$ / GPA ngoại ngữ $\ge 3.0/4.0$).

Mỗi mục kê khai (`Declaration`), mỗi tiêu chí (`Criterion`), và toàn bộ hồ sơ (`Application`) đều được tính toán ra 1 trong 3 trạng thái:
- `preliminary_meets` (**Đạt sơ bộ**)
- `insufficient_evidence` (**Cần kiểm tra thêm**)
- `preliminary_not_meets` (**Chưa đạt**)

### 2.4. Các API Endpoints (`backend/src/modules/copilot/copilot.routes.ts`)
1. `POST /api/v2/copilot/ocr-evidence`: Thực hiện OCR và đánh giá ngay khi sinh viên tải minh chứng lên hoặc khi cán bộ bấm quét lại 1 tệp minh chứng.
2. `POST /api/v2/copilot/evaluate-application`: Quét và đánh giá sơ bộ toàn bộ 5 tiêu chí của một hồ sơ (được gọi tự động khi sinh viên nộp hồ sơ hoặc khi cán bộ mở hồ sơ / bấm "Phân tích lại"). Trả về kết quả từ cache nếu hồ sơ chưa thay đổi kể từ lần quét gần nhất.
3. `POST /api/v2/copilot/analyze-scope`: Nâng cấp endpoint hiện có để sử dụng OpenAI thực tế thay vì heuristic giả lập.
4. `POST /api/v2/copilot/ask` & `POST /api/v2/copilot/dossier-summary`: Nâng cấp hỏi đáp quy chế và tóm tắt trình Hội đồng qua OpenAI.

---

## 3. Thiết kế Giao diện & Trải nghiệm Cán bộ (UI/UX Specification)

### 3.1. Hệ thống Nhãn Trạng thái Sơ bộ (Dùng `lucide-react` 100%)
| Trạng thái | Nhãn hiển thị | Lucide Icon | Màu chữ / Viền / Nền | Ý nghĩa với Cán bộ |
| :--- | :--- | :--- | :--- | :--- |
| **Đạt sơ bộ** | `Đạt sơ bộ` | `CheckCircle2` | `#136F3A` / `#B6E6C9` / `#EAFBF1` | Thông tin minh chứng khớp với kê khai và đủ chuẩn quy chế. |
| **Cần kiểm tra thêm** | `Cần kiểm tra thêm` | `AlertTriangle` | `#B45309` / `#FADDB6` / `#FEF6EB` | Ảnh mờ, chưa rõ dấu xác nhận, hoặc cần cán bộ xem xét tính tương đương. |
| **Chưa đạt** | `Chưa đạt (Sơ bộ)` | `XCircle` | `#B91C1C` / `#FECACA` / `#FEF2F2` | Không đủ điểm/số ngày quy định, sai tên, hết hạn hoặc thiếu minh chứng. |

### 3.2. Bốn Điểm chạm UX trên Màn hình Cán bộ Xét duyệt

#### Điểm chạm 1: Nhãn tóm tắt trên Danh sách Hồ sơ (`staffTableColumns.tsx`)
- Trong bảng danh sách hồ sơ chờ xét duyệt (cấp Trường & cấp Thành phố), hiển thị pill trạng thái nhỏ gọn kèm icon `CheckCircle2` / `AlertTriangle` / `XCircle`:
  - Ví dụ: `[CheckCircle2] 5/5 tiêu chí Đạt sơ bộ` hoặc `[AlertTriangle] 1 mục cần kiểm tra thêm`.
- Giúp cán bộ phân loại độ ưu tiên ngay từ danh sách mà chưa cần mở từng hồ sơ.

#### Điểm chạm 2: Thanh Tổng quan Đánh giá Sơ bộ đầu Hồ sơ (`OfficerReviewAiQuietSection.tsx` & `OfficerReviewWorkspace.tsx`)
- Hiển thị cố định, gọn gàng ngay phía trên hồ sơ (1 dòng trên desktop):
  - **Bên trái**: Nhãn tổng quát (`Đạt sơ bộ 5/5 tiêu chí` hoặc `Có 1 tiêu chí cần kiểm tra thêm`) + 5 thẻ mini đại diện cho 5 tiêu chí (bấm vào thẻ nào sẽ cuộn mượt tới đúng tiêu chí đó).
  - **Bên phải**:
    - Nút **[`CheckCheck` Áp dụng Đạt cho các mục hợp lệ (X)]**: Giúp cán bộ duyệt nhanh chỉ bằng 1 cú nhấp chuột cho tất cả những mục đã khớp minh chứng rõ ràng, tiết kiệm 80% thao tác lặp lại.
    - Nút **[`RefreshCw` Phân tích lại]**: Cho phép quét lại bằng OpenAI bất cứ lúc nào.

#### Điểm chạm 3: Thẻ Đối chiếu Trực tiếp trên từng Dòng Kê khai (`InlineRowReviewControls.tsx` & `SharedStudentDossier.tsx`)
- Ngay tại mỗi mục sinh viên kê khai, hiển thị một khung đối chiếu trực quan, súc tích gồm 2 cột:
  - **Sinh viên kê khai**: Giá trị sinh viên nhập (VD: *GPA: 3.45/4.0*).
  - **Đọc từ minh chứng (`FileCheck2`)**: Giá trị OpenAI OCR trích xuất từ tệp đính kèm (VD: *Bảng điểm: 3.45/4.0 · Có dấu xác nhận · Khớp họ tên*).
- **Nút thao tác nhanh 1-Click**:
  - Khi `Đạt sơ bộ`: Nút **[`Check` Chốt Đạt]** nổi bật.
  - Khi `Cần kiểm tra thêm` hoặc `Chưa đạt`: Hiển thị rõ lý do lệch (VD: *"Giấy chứng nhận ghi 04 ngày, thiếu 01 ngày so với chuẩn 05 ngày"*) kèm nút **[`MessageSquareWarning` Yêu cầu bổ sung (có nội dung gợi ý)]** — bấm vào sẽ điền sẵn câu nhắn lịch sự, rõ ràng cho sinh viên.

#### Điểm chạm 4: Bảng Kết quả OCR trong Trình xem Minh chứng (`EvidenceReviewViewer.tsx`)
- Khi cán bộ bấm mở xem một tệp PDF/Ảnh minh chứng, cột bên phải hiển thị bảng **"Thông tin đọc từ minh chứng"**:
  - Loại văn bản, Họ tên & MSSV nhận diện được, Kết quả/Điểm số/Số ngày, Đơn vị cấp & Ngày ký, Trạng thái con dấu (`CheckCircle2` Có dấu xác nhận / `AlertTriangle` Chưa rõ dấu).
  - Nút **[`RefreshCw` Quét lại tệp này]** để gọi trực tiếp `POST /api/v2/copilot/ocr-evidence` nếu cần kiểm tra kỹ lại.

---

## 4. Xử lý Lỗi, Bảo mật & Chế độ Dự phòng (Fallback & Safety)

1. **Bảo mật API Key**: `OPENAI_API_KEY` chỉ lưu trữ và gọi từ phía Backend (`backend/src/modules/copilot/`), tuyệt đối không phơi bày ra trình duyệt (Frontend).
2. **Graceful Fallback (Không làm gián đoạn nghiệp vụ)**:
   - Nếu máy chủ chưa cấu hình `OPENAI_API_KEY`, hoặc kết nối mạng tới OpenAI gặp sự cố / quá thời gian chờ (timeout 15s), hệ thống tự động chuyển về bộ đánh giá quy tắc định lượng (Deterministic Rule Engine) dựa trên dữ liệu cấu trúc của hồ sơ, đồng thời hiển thị chú thích nhẹ nhàng để cán bộ vẫn chấm duyệt thủ công bình thường 100%.
3. **Kiểm thử (Verification)**:
   - Unit test cho `openaiOcr.service.ts` và `criteriaEvaluation.service.ts` (kiểm tra các kịch bản: hồ sơ đủ chuẩn 5/5, hồ sơ lệch số ngày tình nguyện, hồ sơ thiếu GPA, tệp mờ, và fallback khi không có API key).
   - Kiểm tra Typecheck (`tsc --noEmit`) và Build toàn bộ Frontend + Backend.
