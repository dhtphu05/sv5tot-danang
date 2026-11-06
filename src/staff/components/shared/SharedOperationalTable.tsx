/**
 * 5TOT Đà Nẵng — Shared Operational Table Primitive (variant="operational")
 * Cơ quan quản lý: Thành Đoàn - Hội Sinh viên Thành phố Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Prompt 19 Sections 0–9, 85–88, 104–112, 114 & Prompt 20 Sections 56, 59, 73, 76, 96–97, 101–103:
 * - Applies a unified, high-legibility operational table treatment across Staff Backoffice:
 *   Officer application list, Manager application/assignment/workload/supplement tables,
 *   Committee queues, Result tables, Analytics tables, and Report Preview tables.
 * - Subtle zebra rows (#FFFFFF odd / #F7FAFC even) to improve horizontal row tracking.
 * - Distinct hover row (#EBF5FB) and persistent stronger selected row (#DFF0FA).
 * - Multi-row checkbox selection for batch / selected-row export ("Đã chọn X hồ sơ").
 * - Optional sortable column headers that preserve sort order in exports.
 * - Never colors entire rows orange/red/green for status — uses a 3px left marker for attention
 *   while preserving zebra readability.
 * - Sticky table header (#EEF4F8 with subtle #CFE0EC bottom border) that stays visible on scroll.
 * - Realistic pagination (e.g. "1–20 / 32 hồ sơ") and keyboard row navigation.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export interface OperationalTableColumn<T> {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  widthClass?: string;
  hideBelowLg?: boolean;
  hideBelowXl?: boolean;
  sortable?: boolean;
  renderCell: (row: T, index: number) => React.ReactNode;
}

export interface SharedOperationalTableProps<T> {
  variant?: 'operational';
  density?: 'default' | 'compact';
  ariaLabel: string;
  columns: OperationalTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  selectedRowKey?: string | null;
  onSelectRow?: (row: T) => void;
  /** Optional multi-row selection for Reports & Batch Export (Prompt 20 Section 59) */
  selectableRows?: boolean;
  selectedRowKeys?: Set<string>;
  onToggleRowSelection?: (rowKey: string) => void;
  onToggleSelectAll?: (allRowKeys: string[], selectAll: boolean) => void;
  /** Optional sorting (Prompt 20 Section 73) */
  sortKey?: string | null;
  sortDirection?: 'asc' | 'desc';
  onSortColumn?: (columnKey: string) => void;
  /** Returns 'warning' | 'brand' | null for a subtle 3px left attention marker (Section 4 & 106) */
  getRowAttentionTone?: (row: T) => 'warning' | 'brand' | null;
  isRowDisabled?: (row: T) => boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  pageSize?: number;
  unitLabel?: string;
  maxBodyHeightClass?: string;
}

export function SharedOperationalTable<T>({
  density = 'default',
  ariaLabel,
  columns,
  data,
  getRowKey,
  selectedRowKey,
  onSelectRow,
  selectableRows = false,
  selectedRowKeys,
  onToggleRowSelection,
  onToggleSelectAll,
  sortKey = null,
  sortDirection = 'asc',
  onSortColumn,
  getRowAttentionTone,
  isRowDisabled,
  isLoading = false,
  loadingLabel = 'Đang tải danh sách hồ sơ...',
  emptyStateTitle = 'Không có hồ sơ nào khớp với điều kiện lọc hiện tại.',
  emptyStateDescription = 'Vui lòng thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc đơn vị/trạng thái.',
  pageSize = 20,
  unitLabel = 'hồ sơ',
  maxBodyHeightClass,
}: SharedOperationalTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalCount = data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Clamp currentPage when data length changes (e.g. filter applied)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const pageData = data.slice(startIndex, endIndex);

  const allDataKeys = data.map((r) => getRowKey(r));
  const selectedInDataCount = selectedRowKeys
    ? allDataKeys.filter((k) => selectedRowKeys.has(k)).length
    : 0;
  const isAllSelected =
    allDataKeys.length > 0 && selectedInDataCount === allDataKeys.length;
  const isIndeterminate =
    selectedInDataCount > 0 && selectedInDataCount < allDataKeys.length;

  const cellPadClass =
    density === 'compact' ? 'py-2.5 px-3' : 'py-3 px-3.5';
  const rowMinHeightClass =
    density === 'compact' ? 'min-h-[52px]' : 'min-h-[60px]';

  return (
    <div className="bg-white rounded-[6px] border border-[#DFE5EC] overflow-hidden flex flex-col print:border-[#94A3B8]">
      <div
        ref={scrollContainerRef}
        className={`overflow-x-auto ${
          maxBodyHeightClass ? `${maxBodyHeightClass} overflow-y-auto` : ''
        }`}
      >
        <table
          aria-label={ariaLabel}
          className="w-full text-left border-collapse"
        >
          {/* Sticky Operational Header */}
          <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#DFE5EC]">
            <tr className="text-[11.5px] font-bold text-[#1E293B] tracking-[0.01em]">
              {selectableRows && (
                <th
                  scope="col"
                  className={`${cellPadClass} w-[42px] text-center select-none print:hidden`}
                >
                  <input
                    type="checkbox"
                    aria-label="Chọn tất cả hồ sơ trong danh sách"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => {
                      onToggleSelectAll?.(allDataKeys, e.target.checked);
                    }}
                    className="w-4 h-4 rounded-[3px] border-[#94A3B8] text-[#10A37F] focus:ring-[#10A37F] cursor-pointer align-middle"
                  />
                </th>
              )}

              {columns.map((col) => {
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';
                const responsiveClass = col.hideBelowXl
                  ? 'hidden xl:table-cell'
                  : col.hideBelowLg
                  ? 'hidden lg:table-cell'
                  : '';
                const isSorted = sortKey === col.key;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`${cellPadClass} select-none whitespace-nowrap ${alignClass} ${responsiveClass} ${
                      col.widthClass || ''
                    }`}
                  >
                    {col.sortable && onSortColumn ? (
                      <button
                        type="button"
                        onClick={() => onSortColumn(col.key)}
                        className="inline-flex items-center gap-1 hover:text-[#0F172A] transition-colors cursor-pointer"
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp size={12} className="text-[#10A37F]" />
                          ) : (
                            <ArrowDown size={12} className="text-[#10A37F]" />
                          )
                        ) : (
                          <ArrowUpDown
                            size={12}
                            className="text-[#94A3B8] opacity-75"
                          />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Operational Body */}
          <tbody className="divide-y divide-[#E2E8F0] text-[13px] text-[#1E293B]">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectableRows ? 1 : 0)}
                  className="py-12 px-4 text-center text-[#64748B]"
                >
                  <div className="inline-flex items-center gap-2.5 text-[13px] font-semibold">
                    <Loader2 size={16} className="animate-spin text-[#007EE5]" />
                    <span>{loadingLabel}</span>
                  </div>
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectableRows ? 1 : 0)}
                  className="py-12 px-4 text-center"
                >
                  <div className="text-[13.5px] font-bold text-[#334155]">
                    {emptyStateTitle}
                  </div>
                  {emptyStateDescription && (
                    <div className="text-[12.5px] text-[#64748B] mt-1">
                      {emptyStateDescription}
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => {
                const rowKey = getRowKey(row);
                const isChecked = selectableRows
                  ? Boolean(selectedRowKeys?.has(rowKey))
                  : false;
                const isSelected = selectedRowKey === rowKey || isChecked;
                const isDisabled = isRowDisabled ? isRowDisabled(row) : false;
                const attentionTone = getRowAttentionTone
                  ? getRowAttentionTone(row)
                  : null;
                const isEven = idx % 2 === 1;

                let rowBgClass = isEven ? 'bg-[#FAFBFD]' : 'bg-white';
                if (isDisabled) {
                  rowBgClass = 'bg-[#F8FAFC] opacity-65';
                } else if (isSelected) {
                  rowBgClass = 'bg-[#ECFDF5] hover:bg-[#E2FBF0]';
                } else {
                  rowBgClass = `${
                    isEven ? 'bg-[#FAFBFD]' : 'bg-white'
                  } hover:bg-[#F1F5F9]`;
                }

                const leftMarkerClass = isSelected
                  ? 'border-l-[3px] border-l-[#10A37F]'
                  : attentionTone === 'warning'
                  ? 'border-l-[3px] border-l-[#D97706]'
                  : attentionTone === 'brand'
                  ? 'border-l-[3px] border-l-[#007EE5]'
                  : 'border-l-[3px] border-l-transparent';

                return (
                  <tr
                    key={rowKey}
                    aria-selected={isSelected}
                    tabIndex={onSelectRow && !isDisabled ? 0 : undefined}
                    onClick={() => {
                      if (!isDisabled && onSelectRow) {
                        onSelectRow(row);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        !isDisabled &&
                        onSelectRow &&
                        (e.key === 'Enter' || e.key === ' ')
                      ) {
                        if (e.target === e.currentTarget) {
                          e.preventDefault();
                          onSelectRow(row);
                        }
                      }
                    }}
                    className={`${rowMinHeightClass} transition-colors duration-100 ${rowBgClass} ${leftMarkerClass} ${
                      onSelectRow && !isDisabled ? 'cursor-pointer' : ''
                    } focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#007EE5]`}
                  >
                    {selectableRows && (
                      <td
                        className={`${cellPadClass} w-[42px] text-center align-middle print:hidden`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Chọn dòng ${startIndex + idx + 1}`}
                          checked={isChecked}
                          onChange={() => onToggleRowSelection?.(rowKey)}
                          className="w-4 h-4 rounded-[3px] border-[#94A3B8] text-[#10A37F] focus:ring-[#10A37F] cursor-pointer align-middle"
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left';
                      const responsiveClass = col.hideBelowXl
                        ? 'hidden xl:table-cell'
                        : col.hideBelowLg
                        ? 'hidden lg:table-cell'
                        : '';
                      return (
                        <td
                          key={col.key}
                          className={`${cellPadClass} align-middle ${alignClass} ${responsiveClass} ${
                            col.widthClass || ''
                          }`}
                        >
                          {col.renderCell(row, startIndex + idx)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Realistic Pagination Bar */}
      {!isLoading && totalCount > 0 && (
        <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#DFE5EC] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#475569] print:hidden">
          <div className="font-medium tabular-nums flex items-center gap-3">
            <span>
              Hiển thị{' '}
              <strong className="font-bold text-[#0F172A]">
                {startIndex + 1}–{endIndex}
              </strong>{' '}
              / <strong className="font-bold text-[#0F172A]">{totalCount}</strong>{' '}
              {unitLabel}
            </span>
            {selectableRows && selectedInDataCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#0F766E] font-bold border border-[#A7F3D0]">
                Đã chọn {selectedInDataCount} {unitLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 h-[28px] px-2.5 rounded-[4px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] disabled:opacity-45 disabled:pointer-events-none text-[#1E293B] font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft size={13} />
              <span>Trước</span>
            </button>
            <span className="px-2 font-bold text-[#0F172A] tabular-nums">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 h-[28px] px-2.5 rounded-[4px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] disabled:opacity-45 disabled:pointer-events-none text-[#1E293B] font-semibold transition-colors cursor-pointer"
            >
              <span>Sau</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
