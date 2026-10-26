import React, { useState } from 'react';
import { Button } from '../buttons/Button';
import { Input } from '../forms/Input';
import { Textarea } from '../forms/Textarea';

export interface InlineEditorProps {
  initialValue: string;
  initialDetail?: string;
  onSave: (data: { value: string; detail?: string }) => void;
  onCancel: () => void;
}

export const InlineEditor: React.FC<InlineEditorProps> = ({
  initialValue,
  initialDetail = '',
  onSave,
  onCancel,
}) => {
  const [value, setValue] = useState(initialValue);
  const [detail, setDetail] = useState(initialDetail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ value, detail });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-lg">
      <Input
        label="Nội dung / Điểm số / Thành tích"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ví dụ: 3.45 / 4.00 hoặc Giải Nhì Sinh viên NCKH..."
        autoFocus
        required
      />
      <Textarea
        label="Ghi chú chi tiết / Mô tả thêm (không bắt buộc)"
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        rows={2}
        placeholder="Ví dụ: Đã hoàn thành học kỳ 2 năm học 2026-2027, điểm rèn luyện 92..."
      />
      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" variant="primary" type="submit">
          Lưu thông tin
        </Button>
        <Button size="sm" variant="quiet" type="button" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </form>
  );
};
