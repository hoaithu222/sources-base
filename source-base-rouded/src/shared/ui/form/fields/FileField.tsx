import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FileList,
  Upload,
  useUpload,
  type FileCardVariant,
  type UploadFile,
  type UploadHandler,
  type UploadVariant,
  type ValidationError,
} from '@/shared/ui/media/upload';
import { useFormField } from './hooks/useFormField';
import FieldReadOnly from '../field-read-only';
import FormItem from '../FormItem';

export interface FileFieldValue {
  /** Id do máy chủ cấp; bỏ trống thì dùng `url` làm id. */
  id?: string;
  name: string;
  /** Đường dẫn tệp đã tải (hoặc object URL xem trước khi không có `onUpload`). */
  url: string;
  /** Dung lượng, đơn vị byte. */
  size?: number;
}

export interface FileFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  className?: string;
  variant?: UploadVariant;
  fileCardVariant?: FileCardVariant;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  onUpload?: UploadHandler;
  filesTitle?: string;
}

const FILE_FIELD_BODY_CLASSES = 'flex flex-col gap-3';

const FILE_FIELD_LINK_CLASSES =
  'w-fit text-body-14 text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus';

function toFieldValue(file: UploadFile): FileFieldValue {
  return {
    id: file.id,
    name: file.name,
    url: file.url ?? file.previewUrl ?? '',
    size: file.size,
  };
}

function fromFieldValue(item: FileFieldValue): UploadFile {
  return {
    id: item.id ?? item.url,
    name: item.name,
    size: item.size ?? 0,
    type: '',
    status: 'success',
    progress: 100,
    url: item.url,
  };
}

function toList(value: unknown): FileFieldValue[] {
  if (!value) return [];
  return Array.isArray(value) ? (value as FileFieldValue[]) : [value as FileFieldValue];
}

/**
 * FileField — ô tải tệp nối react-hook-form, bọc `Upload` + `FileList` (kiểm loại / dung lượng, kéo thả,
 * tiến độ, huỷ, thử lại).
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện danh sách liên kết tới tệp. Giá trị form: `multiple` →
 * `FileFieldValue[]`, ngược lại `FileFieldValue | null` — chỉ gồm tệp ĐÃ tải xong. Tệp bị loại (sai loại, quá
 * cỡ) hiện thành lỗi của field. Tải lên ngoài form → dùng thẳng `Upload` + `useUpload`.
 * Lưu ý: giá trị điền sẵn chỉ được đọc lúc mount; `form.reset()` từ ngoài không thay danh sách đang hiện —
 * cần thay thì remount field (đổi `key`).
 * Sửa giao diện: khe vùng tải ↔ danh sách → `FILE_FIELD_BODY_CLASSES` · liên kết ở chế độ chỉ đọc →
 * `FILE_FIELD_LINK_CLASSES`.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form).
 * @param props.label - Nhãn phía trên vùng tải; nối với vùng tải để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới vùng tải; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.disabled - `true` → khoá vùng tải và nút của từng tệp.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.variant - Kiểu vùng tải: `dropzone` (khung kéo thả) | `inline` (một dòng) | `button` (chỉ
 *   nút). Mặc định `dropzone`.
 * @param props.fileCardVariant - Kiểu thẻ tệp: `detailed` (badge + thông tin) | `simple` (kẹp giấy + tên).
 *   Mặc định `detailed`.
 * @param props.accept - Loại tệp nhận, cú pháp `accept` của `<input type="file">` (vd `.pdf,image/*`).
 * @param props.multiple - `true` → nhận nhiều tệp, giá trị là mảng. Mặc định `false`.
 * @param props.maxFiles - Số tệp tối đa.
 * @param props.maxSize - Dung lượng tối đa mỗi tệp, đơn vị MB. Mặc định `10`.
 * @param props.onUpload - Hàm tải thật `(file, { onProgress, signal }) => Promise<url>`; bỏ trống thì chỉ xem
 *   trước bằng object URL (giá trị form mang object URL đó).
 * @param props.filesTitle - Tiêu đề phía trên danh sách tệp.
 *
 * @example
 * <FileField name="attachments" label="Tệp đính kèm" multiple accept=".pdf" maxSize={5} onUpload={uploadFile} />
 */
function FileField({
  name,
  label,
  required,
  description,
  disabled,
  className,
  variant = 'dropzone',
  fileCardVariant,
  accept,
  multiple = false,
  maxFiles,
  maxSize = 10,
  onUpload,
  filesTitle,
}: FileFieldProps) {
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });
  const { setError, clearErrors } = useFormContext();
  const maxBytes = maxSize * 1024 * 1024;

  const initialValue = field.value;
  const initialFiles = useMemo(() => toList(initialValue).map(fromFieldValue), [initialValue]);

  const handleReject = useCallback(
    (rejections: { error: ValidationError }[]) => {
      if (rejections[0]) setError(name, { message: rejections[0].error.message });
    },
    [name, setError],
  );

  const { files, addFiles, removeFile, cancelFile, retryFile } = useUpload({
    initialFiles,
    multiple,
    accept,
    maxSize: maxBytes,
    maxFiles,
    onUpload,
    autoUpload: !!onUpload,
    onReject: handleReject,
    onFileSettled: (settled) => {
      if (settled.status !== 'success') return;
      clearErrors(name);
    },
  });

  useEffect(() => {
    const successFiles = files.filter((f) => f.status === 'success').map(toFieldValue);
    if (multiple) {
      field.onChange(successFiles);
    } else {
      field.onChange(successFiles[0] ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ đồng bộ khi `files` / `multiple` đổi
  }, [files, multiple]);

  const handleFiles = useCallback(
    (incoming: File[]) => {
      clearErrors(name);
      addFiles(incoming);
    },
    [addFiles, clearErrors, name],
  );

  if (readOnly) {
    const list = toList(initialValue);
    return (
      <FieldReadOnly className={className} label={label}>
        {list.length > 0 && (
          <div className="flex flex-col gap-1">
            {list.map((f) => (
              <a
                key={f.url}
                className={FILE_FIELD_LINK_CLASSES}
                href={f.url}
                rel="noreferrer"
                target="_blank"
              >
                {f.name}
              </a>
            ))}
          </div>
        )}
      </FieldReadOnly>
    );
  }

  return (
    <FormItem
      {...a11y.item}
      className={className}
      description={description}
      error={error}
      label={label}
      required={required}
    >
      <div className={FILE_FIELD_BODY_CLASSES}>
        <Upload
          accept={accept}
          aria-describedby={a11y.trigger['aria-describedby']}
          aria-labelledby={a11y.trigger['aria-labelledby']}
          currentCount={files.length}
          disabled={disabled}
          invalid={Boolean(error)}
          maxFiles={maxFiles}
          maxSize={maxBytes}
          multiple={multiple}
          variant={variant}
          onFiles={handleFiles}
          onReject={handleReject}
        />
        {files.length > 0 ? (
          <FileList
            density="cozy"
            disabled={disabled}
            files={files}
            title={filesTitle}
            variant={fileCardVariant}
            onCancel={(f) => cancelFile(f.id)}
            onRemove={(f) => removeFile(f.id)}
            onRetry={(f) => retryFile(f.id)}
          />
        ) : null}
      </div>
    </FormItem>
  );
}

export default FileField;
