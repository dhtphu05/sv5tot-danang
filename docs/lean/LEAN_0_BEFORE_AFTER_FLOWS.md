# LEAN-0.1: SƠ ĐỒ QUY TRÌNH TRƯỚC VÀ SAU TINH GIẢN
## (Before/After Business Process Flows: 8 Canonical Mermaid Diagrams — Corrected)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức & vận hành:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mục tiêu:** Trực quan hóa quy trình tinh gọn Lean UX, bảo đảm phản ánh chính xác sự phân tách giữa Tiến độ thẩm định (Review Completion) và Quyết định hành chính (Administrative Decision), loại bỏ các giả định tự động hóa sai lệch.

---

## SƠ ĐỒ 1: SO SÁNH QUY TRÌNH THẨM ĐỊNH CÁ NHÂN (CURRENT VS LEAN UX)

### A. Quy trình hiện tại (Phân mảnh, 3 tầng xác nhận, ~42 clicks ước tính)
```mermaid
flowchart TD
    subgraph Current_Flow["QUY TRÌNH HIỆN TẠI (3 TẦNG XÁC NHẬN - NHIỀU THAO TÁC THỪA)"]
        A1[Sinh viên nộp hồ sơ] --> B1[Cán bộ mở hồ sơ]
        B1 --> C1[Mở tệp minh chứng]
        C1 --> D1[Bấm xác nhận tệp hợp lệ]
        D1 --> E1[Đóng khung tệp]
        E1 --> F1[Bấm Đạt dòng kê khai]
        F1 --> G1[Bấm Xác nhận hoàn tất dòng]
        G1 --> H1{Đã duyệt hết các dòng?}
        H1 -- Chưa --> C1
        H1 -- Đã hết --> I1[Bấm Hoàn tất thẩm định Tiêu chí]
        I1 --> K1{Đủ 5 tiêu chí?}
        K1 -- Chưa --> C1
        K1 -- Đủ --> L1[Bấm Chốt kết quả thẩm định Cán bộ]
    end
```

### B. Quy trình Lean đề xuất (Đơn tầng trực tiếp, phân tách Đủ điều kiện và Đề xuất)
```mermaid
flowchart TD
    subgraph Lean_Flow["QUY TRÌNH LEAN ĐỀ XUẤT (TRỰC TIẾP TRÊN DÒNG - BẢO TOÀN THẨM QUYỀN)"]
        A2[Sinh viên nộp hồ sơ] --> B2[Cán bộ mở hồ sơ]
        B2 --> C2[Đối soát dòng kê khai và minh chứng mở song song]
        C2 --> D2[Bấm 1-Click: Đạt hoặc Không đạt trên từng dòng]
        D2 --> E2[Hệ thống TỰ ĐỘNG tính toán tiến độ nhóm & tiêu chí]
        E2 --> F2{5/5 tiêu chí đã xét xong?}
        F2 -- Chưa xét hết --> C2
        F2 -- Đã xét xong 5/5 --> G2[HOÀN TẤT THẨM ĐỊNH]
        
        G2 --> H2{Kết quả 5 tiêu chí?}
        H2 -- Đạt cả 5/5 tiêu chí --> I2["Chỉ số: Đủ điều kiện sơ bộ (5/5)"]
        H2 -- Có tiêu chí không đạt --> J2["Chỉ số: Không đủ điều kiện (X/5 đạt)"]
        
        I2 --> K2["CÁN BỘ TRƯỜNG CHỦ ĐỘNG GHI NHẬN: Đề xuất chuyển TP"]
        I2 -.-> L2["Cán bộ Trường có thể chọn: Không đề xuất (nếu có lý do cơ sở)"]
        J2 --> M2["CÁN BỘ TRƯỜNG CHỦ ĐỘNG GHI NHẬN: Không đề xuất"]
        
        K2 --> N2["Chọn lọc hồ sơ vào đợt chuyển giao kèm Quyết định chính thức"]
    end
```

---

## SƠ ĐỒ 2: MỨC ĐỘ CHI TIẾT THẨM ĐỊNH (DECLARATION REVIEW GRANULARITY FLOW)

```mermaid
flowchart LR
    subgraph Granularity["MỨC ĐỘ THẨM ĐỊNH CHUẨN TẮC"]
        direction TB
        CRIT[Tiêu chí 1: Đạo đức tốt] --> GRP1[Nhóm A: Điểm rèn luyện - ALL_REQUIRED]
        CRIT --> GRP2[Nhóm B: Bồi dưỡng tư tưởng - AT_LEAST_N]
        
        GRP1 --> R1[TC1.1: Điểm rèn luyện năm học]
        R1 --> D1["Dòng kê khai: ĐRL 88.5 điểm (Đính kèm: Bảng điểm.pdf)"]
        
        D1 === ACTION{"HÀNH ĐỘNG DUY NHẤT"}
        ACTION -->|Click Đạt| S1["suitable (Đạt)"]
        ACTION -->|Click Không đạt| S2["unsuitable + Lý do nội bộ"]
        ACTION -->|Yêu cầu bổ sung| S3["needs_supplement + Lưu ý gửi SV"]

        S1 -.->|Tự động suy diễn| AUTO1["Yêu cầu TC1.1 ĐẠT"]
        AUTO1 -.->|Tự động suy diễn| AUTO2["Nhóm A ĐẠT"]
        AUTO2 -.->|Tự động suy diễn| AUTO3["Tiêu chí 1 ĐẠT khi cả 2 nhóm đều Đạt"]
    end
```

---

## SƠ ĐỒ 3: THẨM ĐỊNH TRỰC TIẾP TRÊN DÒNG & GHI CHÚ NỘI BỘ (INLINE REVIEW FLOW)

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Cán bộ Thẩm định
    participant UI as Dòng Kê khai (Inline Row)
    participant Preview as Khung Minh chứng
    participant State as Trạng thái Thẩm định (Overlay)

    Officer->>UI: Cuộn đọc dòng kê khai
    UI->>Preview: Minh chứng mở sẵn sàng bên cạnh
    Officer->>Preview: Đối chiếu số hiệu / chữ ký / ngày cấp
    alt Minh chứng hợp lệ
        Officer->>UI: Bấm nút xanh [Đạt] (1 click)
        UI->>State: Ghi nhận status: 'suitable'
        State-->>UI: Cập nhật tích xanh, tự tính tiến độ tiêu chí
    else Minh chứng không đạt yêu cầu
        Officer->>UI: Bấm nút đỏ [Không đạt] (1 click)
        UI->>State: Ghi nhận status: 'unsuitable'
        State-->>UI: Cập nhật icon đỏ, tự động cập nhật tiến độ
    else Cần ghi chú trao đổi nội bộ
        Officer->>UI: Mở ô ghi chú nhanh (Inline Note)
        Officer->>UI: Nhập: "Đã đối chiếu bảng điểm gốc tại Khoa"
        UI->>State: Lưu internalNote (Chỉ cán bộ thấy, không gửi SV)
    end
```

---

## SƠ ĐỒ 4: QUY TRÌNH YÊU CẦU BỔ SUNG TRỰC TIẾP (DIRECT SCOPED SUPPLEMENTATION)

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Cán bộ Thẩm định
    participant Row as Dòng Kê khai
    participant Drawer as Ngăn Bổ sung Nhanh (Drawer)
    participant Student as Sinh viên Kê khai
    participant Review as Đối soát Bổ sung (Diff)

    Officer->>Row: Phát hiện minh chứng bị mờ -> Bấm [Yêu cầu bổ sung]
    Row->>Drawer: Mở ngăn bổ sung (Tự động khóa phạm vi dòng hiện tại)
    Note over Drawer: Hạn chót: Theo cấu hình mùa xét hoặc Cán bộ nhập<br/>Hành động mặc định: Tải lại minh chứng
    Officer->>Drawer: Nhập: "Minh chứng bị mờ trang 2, vui lòng scan lại"
    Officer->>Drawer: Bấm [Gửi yêu cầu]
    Drawer->>Student: Thông báo tức thời tới Cổng Sinh viên
    Student->>Student: Tải tệp minh chứng mới & Ghi chú phản hồi
    Student->>Review: Nộp bổ sung thành công
    Review-->>Officer: Hiển thị nhãn [Đã nhận bổ sung] kèm So sánh (Diff) tệp cũ vs tệp mới
    Officer->>Row: Đối chiếu tệp mới -> Bấm [Đạt] hoặc [Không đạt]
```

---

## SƠ ĐỒ 5: QUY TRÌNH TRƯỜNG TỔNG HỢP VÀ KÝ CHUYỂN GIAO (BẢN ĐỒ ĐHĐN & TRƯỜNG ĐỘC LẬP)

```mermaid
flowchart TD
    subgraph Intake["1. TIẾP NHẬN & ĐỊNH TUYẾN SƠ TUYỂN"]
        SV_BK[SV ĐH Bách khoa] -->|inst-dut| UDN_HUB[Đơn vị xét sơ: Đại học Đà Nẵng - unit-udn]
        SV_KT[SV ĐH Kinh tế] -->|inst-due| UDN_HUB
        SV_SP[SV ĐH Sư phạm] -->|inst-ued| UDN_HUB
        SV_NN[SV ĐH Ngoại ngữ] -->|inst-ufl| UDN_HUB
        SV_VKU[SV ĐH CNTT Việt - Hàn] -->|inst-vku| UDN_HUB
        SV_DTU[SV ĐH Duy Tân] -->|inst-dtu| DTU_UNIT[Đơn vị xét sơ: ĐH Duy Tân - unit-dtu]
        SV_FPT[SV ĐH FPT] -->|inst-fpt| FPT_UNIT[Đơn vị xét sơ: ĐH FPT - unit-fpt]
    end

    subgraph Assembly["2. TỔNG HỢP & CHỌN LỌC ĐỀ XUẤT CẤP TRƯỜNG"]
        UDN_HUB --> UDN_BREAKDOWN[Bảng tổng hợp tự động 8 trường thành viên]
        UDN_BREAKDOWN --> UDN_SELECT["Cán bộ ĐHĐN chọn lọc hồ sơ đề xuất (Bulk-select)"]
        UDN_SELECT --> UDN_DECISION[Đính kèm Quyết định đề xuất duy nhất của Giám đốc ĐHĐN]
        
        DTU_UNIT --> DTU_SELECT["Cán bộ Duy Tân chọn lọc hồ sơ đề xuất"]
        DTU_SELECT --> DTU_DECISION[Đính kèm Quyết định đề xuất của Hiệu trưởng ĐH Duy Tân]
    end

    subgraph Forwarding["3. KÝ CHUYỂN CHÍNH THỨC LÊN THÀNH PHỐ"]
        UDN_DECISION -->|Xác nhận ký chuyển chính thức| CITY_QUEUE[Hàng đợi Thẩm định Hội Sinh viên Thành phố]
        DTU_DECISION -->|Xác nhận ký chuyển chính thức| CITY_QUEUE
    end

    style UDN_HUB fill:#eff6ff,stroke:#1d4ed8,stroke-width:2px
    style CITY_QUEUE fill:#f0fdf4,stroke:#15803d,stroke-width:2px
```

---

## SƠ ĐỒ 6: QUY TRÌNH HỒ SƠ TẬP THỂ (TT01–TT04 NỘP TRỰC TIẾP THÀNH PHỐ)

```mermaid
flowchart LR
    subgraph Collective_Flow["QUY TRÌNH TẬP THỂ TINH GỌN (NỘP TRỰC TIẾP CẤP THÀNH PHỐ)"]
        direction TB
        COLL[Ban Chấp hành Chi hội / Liên chi hội] -->|Soạn thảo TT01 - TT04| SUBMIT[Nộp trực tiếp lên Thành phố]
        SUBMIT --> CITY_Q[Hàng đợi Thẩm định Tập thể Thành phố]
        
        CITY_Q --> REV_TT01["TT01: QĐ Công nhận cấp Trường"]
        CITY_Q --> REV_TT02["TT02: 100% tham gia phong trào (Tổng SV)"]
        CITY_Q --> REV_TT03["TT03: >= 20% đạt SV5T (Kế thừa tổng SV từ TT02)"]
        CITY_Q --> REV_TT04["TT04: 100% không vi phạm quy chế"]

        REV_TT01 & REV_TT02 & REV_TT03 & REV_TT04 -->|Cán bộ TP thẩm định xong| COMM[Hội đồng Thành phố xem xét & ra Quyết định công nhận]
    end

    style SUBMIT fill:#fef3c7,stroke:#d97706,stroke-width:2px
    style COMM fill:#f0fdf4,stroke:#15803d,stroke-width:2px
```

---

## SƠ ĐỒ 7: VÒNG ĐỜI TRẠNG THÁI HỒ SƠ TOÀN HỆ THỐNG (LIFECYCLE TRANSITIONS)

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Sinh viên bắt đầu kê khai
    DRAFT --> SUBMITTED : Sinh viên nộp chính thức

    state "GIAI ĐOẠN 1: CẤP TRƯỜNG XÉT SƠ (Stage: SCHOOL)" as SCHOOL_STAGE {
        SUBMITTED --> PENDING_INTAKE : Chờ tiếp nhận
        PENDING_INTAKE --> UNDER_REVIEW : Cán bộ trường mở thẩm tra
        UNDER_REVIEW --> SUPPLEMENT_REQ : Cần bổ sung minh chứng
        SUPPLEMENT_REQ --> SUPPLEMENT_RET : Sinh viên gửi lại tệp
        SUPPLEMENT_RET --> UNDER_REVIEW : Thẩm tra lại
        
        UNDER_REVIEW --> REVIEW_COMPLETED : Đã thẩm định xong 5/5 tiêu chí
        
        state REVIEW_COMPLETED {
            [*] --> CHECK_ELIGIBILITY
            CHECK_ELIGIBILITY --> ELIGIBLE_5_OF_5 : Đạt 5/5 tiêu chí
            CHECK_ELIGIBILITY --> INELIGIBLE_FAIL : Có tiêu chí Không đạt
        }

        ELIGIBLE_5_OF_5 --> RECOMMENDED : Cán bộ ghi nhận Đề xuất
        ELIGIBLE_5_OF_5 --> NOT_RECOMMENDED : Cán bộ ghi nhận Không đề xuất
        INELIGIBLE_FAIL --> NOT_RECOMMENDED : Cán bộ ghi nhận Không đề xuất
    }

    RECOMMENDED --> FORWARDED_TO_CITY : Trường ký đợt chuyển giao kèm QĐ

    state "GIAI ĐOẠN 2: CẤP THÀNH PHỐ THẨM ĐỊNH (Stage: CITY)" as CITY_STAGE {
        FORWARDED_TO_CITY --> CITY_IN_REVIEW : Thẩm định độc lập
        CITY_IN_REVIEW --> CITY_SUPP_REQ : Thành phố yêu cầu bổ sung
        CITY_SUPP_REQ --> CITY_SUPP_RET : Sinh viên nộp bổ sung
        CITY_SUPP_RET --> CITY_IN_REVIEW : Thẩm tra lại
        CITY_IN_REVIEW --> CITY_REVIEW_DONE : Cán bộ TP hoàn tất thẩm định độc lập
    }

    state "GIAI ĐOẠN 3: HỘI ĐỒNG XÉT CHỌN & CÔNG BỐ (Stage: COMPLETED)" as COMMITTEE_STAGE {
        CITY_REVIEW_DONE --> COMMITTEE_REVIEW : Trình Hội đồng Thành phố
        COMMITTEE_REVIEW --> FINALIZED_RECOGNIZED : Hội đồng công nhận danh hiệu
        COMMITTEE_REVIEW --> FINALIZED_NOT_RECOGNIZED : Hội đồng không công nhận
        FINALIZED_RECOGNIZED --> PUBLISHED : Phê duyệt công bố kết quả
    }

    PUBLISHED --> [*]
```

---

## SƠ ĐỒ 8: KIẾN TRÚC TƯƠNG TÁC ĐA TÁC NHÂN (CROSS-ROLE ARCHITECTURE)

```mermaid
flowchart TD
    subgraph ACTORS["CÁC CHỦ THỂ THAM GIA HỆ THỐNG"]
        STUDENT[Sinh viên Đăng ký]
        COLLECTIVE[Đại diện Chi hội / LCH]
        SCHOOL_OFFICER[Cán bộ Sơ tuyển cấp Trường / ĐHĐN]
        CITY_OFFICER[Cán bộ Thẩm định Thành phố]
        COMMITTEE[Hội đồng Xét chọn Thành phố]
        PUBLIC[Công chúng / Sinh viên toàn Thành phố]
    end

    subgraph ENGINE["HỆ THỐNG 5TOT ĐÀ NẴNG TINH GỌN (LEAN PLATFORM)"]
        IMMUTABLE_APP[Hồ sơ Kê khai Bất biến]
        OVERLAY_STATE[Lớp phủ Thẩm định Hai cấp]
        BATCH_ENGINE[Bộ điều phối Gói chuyển giao & UDN Hub]
        DECISION_ENGINE[Cổng Quyết định & Công bố Kết quả]
    end

    STUDENT -->|Kê khai & nộp minh chứng| IMMUTABLE_APP
    COLLECTIVE -->|Kê khai TT01-TT04| IMMUTABLE_APP
    SCHOOL_OFFICER -->|Đánh giá Đạt/Không đạt & Ghi nhận đề xuất| OVERLAY_STATE
    SCHOOL_OFFICER -->|Chọn lọc hồ sơ & Ký QĐ đợt chuyển| BATCH_ENGINE
    BATCH_ENGINE -->|Định tuyến tự động| CITY_OFFICER
    CITY_OFFICER -->|Thẩm định độc lập| OVERLAY_STATE
    OVERLAY_STATE -->|Báo cáo tổng hợp số liệu độc lập| COMMITTEE
    COMMITTEE -->|Biểu quyết & Ban hành Quyết định công nhận| DECISION_ENGINE
    DECISION_ENGINE -->|Tra cứu danh hiệu sau khi công bố| PUBLIC
```
