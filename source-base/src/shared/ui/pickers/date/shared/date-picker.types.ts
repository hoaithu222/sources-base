/** Kiểu dùng chung của date picker; form/fields/DateRangeField import `DateRange` từ đúng file này. */

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface QuickSelectOption {
  label: string;
  getRange: () => DateRange;
}
