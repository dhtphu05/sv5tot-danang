import React, { useState } from "react";
import { Button } from "../../components/buttons/Button";
import { IconButton } from "../../components/buttons/IconButton";
import { StatusChip } from "../../components/status/StatusChip";
import { Input } from "../../components/forms/Input";
import { Textarea } from "../../components/forms/Textarea";
import { DropZone } from "../../components/forms/DropZone";
import { Select } from "../../components/forms/Select";
import { SearchInput } from "../../components/forms/SearchInput";
import { FileTypeIcon } from "../../components/evidence/FileTypeIcon";
import { Sparkles, Eye, Download, Search, Send, FileText, BookOpen, Trash2 } from "lucide-react";
import { MOCK_STUDENT } from "../../tokens";

export const PrimitivesTab: React.FC = () => {
  const [demoSearch, setDemoSearch] = useState("");
  const [demoSelect, setDemoSelect] = useState("danang");

  return (
          <div className="flex flex-col gap-10">
            {/* 1. Button System */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[20px] font-bold text-[#1D1D1F] tracking-tight">
                1. Hệ thống Nút bấm (Button Primitives)
              </h2>
              <div className="p-6 bg-white rounded-[14px] border border-black/[0.05] space-y-6">
                <div>
                  <h4 className="text-[13px] font-semibold text-[#6E6E73] uppercase mb-3">
                    Các biến thể chính (Primary, Secondary, Quiet, Danger)
                  </h4>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Button variant="primary" iconLeading={<Send size={15} />}>
                      Gửi hồ sơ
                    </Button>
                    <Button variant="secondary" iconLeading={<FileText size={15} />}>
                      Tải minh chứng
                    </Button>
                    <Button variant="quiet" iconLeading={<BookOpen size={15} />}>
                      Xem quy định
                    </Button>
                    <Button variant="danger" iconLeading={<Trash2 size={15} />}>
                      Xóa tệp
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-[13px] font-semibold text-[#6E6E73] uppercase mb-3">
                    Kích thước & Trạng thái tải (Sizes & Loading)
                  </h4>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Button variant="primary" size="sm">
                      Kích thước nhỏ (32px)
                    </Button>
                    <Button variant="primary" size="md">
                      Mặc định (40px)
                    </Button>
                    <Button variant="primary" size="lg">
                      Kích thước lớn (44px)
                    </Button>
                    <Button variant="primary" isLoading>
                      Đang xử lý
                    </Button>
                    <Button variant="secondary" disabled>
                      Vô hiệu hóa
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Form Controls (Soft filled, no heavy borders) */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[20px] font-bold text-[#1D1D1F] tracking-tight">
                2. Điều khiển biểu mẫu (Form Controls — Nền mềm, không viền hộp đen)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-[14px] border border-black/[0.05]">
                <Input
                  label="Họ và tên sinh viên"
                  placeholder="Nhập đầy đủ họ tên..."
                  value={MOCK_STUDENT.fullName}
                  readOnly
                  helperText="Thông tin được đồng bộ từ tài khoản sinh viên"
                />

                <SearchInput
                  placeholder="Tìm kiếm minh chứng..."
                  value={demoSearch}
                  onChange={setDemoSearch}
                />

                <Select
                  label="Trường / Viện trực thuộc"
                  value={demoSelect}
                  onChange={(e) => setDemoSelect(e.target.value)}
                  options={[
                    { value: 'danang', label: 'Trường Đại học Bách khoa - ĐH Đà Nẵng' },
                    { value: 'kinhte', label: 'Trường Đại học Kinh tế - ĐH Đà Nẵng' },
                    { value: 'supham', label: 'Trường Đại học Sư phạm - ĐH Đà Nẵng' },
                    { value: 'ngoaingu', label: 'Trường Đại học Ngoại ngữ - ĐH Đà Nẵng' },
                  ]}
                />

                <Input
                  label="Thành tích đạt được (Input có lỗi mẫu)"
                  placeholder="Nhập tên giải thưởng..."
                  error="Vui lòng đính kèm ít nhất 1 minh chứng chứng minh kết quả"
                />

                <div className="md:col-span-2">
                  <Textarea
                    label="Mô tả tóm tắt hoạt động rèn luyện"
                    placeholder="Nhập ghi chú chi tiết về thời gian, địa điểm, thành tích..."
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[13px] font-medium text-[#1D1D1F] select-none block mb-1.5">
                    Khu vực tải lên tài liệu minh chứng (DropZone)
                  </label>
                  <DropZone
                    onFilesSelected={(_files: File[] | FileList) => {
                      // Handled safely without window.alert
                    }}
                  />
                </div>
              </div>
            </section>
          </div>
  );
};
