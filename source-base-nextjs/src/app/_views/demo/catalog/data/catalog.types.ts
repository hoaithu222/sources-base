/** Một dòng import của khung "Import": `from` là đường import công khai, `names` là các tên lấy từ đó. */
export interface CatalogImport {
  from: string;
  names: readonly string[];
}

/** Thông tin tra cứu của một nhóm: tên component (để tìm), dòng import, đường file nguồn và tài liệu liên quan. */
export interface CatalogGroup {
  components: readonly string[];
  imports: readonly CatalogImport[];
  sources: readonly string[];
  docs: readonly string[];
}

export type CatalogRowStatus = 'active' | 'inactive';

/** Một dòng dữ liệu mẫu của bảng; `date` là chuỗi ISO `YYYY-MM-DD`. */
export interface CatalogRow {
  id: string;
  code: string;
  name: string;
  amount: number;
  status: CatalogRowStatus;
  date: string;
}

export type CatalogFormState = 'default' | 'invalid' | 'readOnly' | 'disabled';
