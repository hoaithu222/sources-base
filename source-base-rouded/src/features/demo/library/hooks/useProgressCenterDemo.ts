import { useCallback } from 'react';

import type { UploadHandler } from '@/shared/ui';
import { useServerTasks, useUploadQueue } from '@/shared/widgets/progress-center';

interface UseProgressCenterDemoReturn {
  uploadOk: () => void;
  uploadWithError: () => void;
  importOk: () => void;
  importFail: () => void;
}

const UPLOAD_TICK_MS = 200;
const IMPORT_TICK_MS = 500;
const FAILING_FILE_NAME = 'mat-bang-tong-the.pdf';

const fakeFile = (name: string, kiloBytes: number) =>
  new File([new Uint8Array(kiloBytes * 1024)], name, { type: 'image/png' });

/** Tải giả: tăng 20% mỗi nhịp; tệp tên `failName` thì hỏng ở 60%; "Huỷ tải lên" (`signal`) dừng nhịp. */
function fakeUploader(resultUrl: string, failName?: string): UploadHandler {
  return (file, { onProgress, signal }) =>
    new Promise<string>((resolve, reject) => {
      let percent = 0;
      const timer = setInterval(() => {
        percent += 20;
        onProgress(percent);
        if (file.name === failName && percent >= 60) {
          clearInterval(timer);
          reject(new Error('Tệp vượt quá 10 MB'));
        } else if (percent >= 100) {
          clearInterval(timer);
          resolve(resultUrl);
        }
      }, UPLOAD_TICK_MS);
      const stop = () => {
        clearInterval(timer);
        reject(new Error('Đã huỷ'));
      };
      if (signal.aborted) stop();
      else signal.addEventListener('abort', stop, { once: true });
    });
}

/**
 * useProgressCenterDemo — bốn kịch bản giả cho `ProgressCenter` của mục "Widget dựng sẵn": tải lên xong /
 * có tệp lỗi, tác vụ dài xong / hỏng. Đẩy việc vào đúng store toàn app nên thẻ hiện ở góc màn như thật.
 *
 * @param resultUrl - URL trả về khi tệp giả tải xong (ảnh xem trước của thẻ).
 */
export function useProgressCenterDemo(resultUrl: string): UseProgressCenterDemoReturn {
  const { enqueue } = useUploadQueue();
  const { start: startImport, update: updateImport, finishSuccess, finishError } = useServerTasks();

  const uploadOk = useCallback(() => {
    enqueue(
      [fakeFile('ban-ve-tang-3.png', 2400), fakeFile('mat-bang.png', 1100)],
      fakeUploader(resultUrl),
    );
  }, [enqueue, resultUrl]);

  const uploadWithError = useCallback(() => {
    enqueue(
      [
        fakeFile('ban-ve-tang-3.png', 2400),
        fakeFile(FAILING_FILE_NAME, 12_800),
        fakeFile('bien-ban-nghiem-thu.docx', 318),
      ],
      fakeUploader(resultUrl, FAILING_FILE_NAME),
    );
  }, [enqueue, resultUrl]);

  const runImport = useCallback(
    (failAt?: number) => {
      const id = startImport({
        label: 'Nhập vật tư chính (VTC)',
        fileName: 'vat-tu-2026.xlsx',
        message: 'Đang đọc tệp…',
        progress: 0,
      });
      let percent = 0;
      const timer = setInterval(() => {
        percent += 25;
        if (failAt !== undefined && percent >= failAt) {
          clearInterval(timer);
          finishError(id, 'Dòng 12: mã vật tư VT-0091 không tồn tại trong danh mục.');
          return;
        }
        updateImport(id, { progress: percent, message: `Đang xử lý dòng ${percent * 4}/400…` });
        if (percent >= 100) {
          clearInterval(timer);
          finishSuccess(id, 'Đã nhập 400 dòng, bỏ qua 2 dòng trùng');
        }
      }, IMPORT_TICK_MS);
    },
    [finishError, finishSuccess, startImport, updateImport],
  );

  const importOk = useCallback(() => runImport(), [runImport]);
  const importFail = useCallback(() => runImport(50), [runImport]);

  return { uploadOk, uploadWithError, importOk, importFail };
}
