/**
 * Drop utils — đọc kéo-thả qua FileSystemEntry (tệp / thư mục, đệ quy).
 * Lưu ý:  gọi `readDirectoryDrop` ĐỒNG BỘ trong handler drop, trước mọi await.
 */

const fileFromEntry = (entry: FileSystemFileEntry): Promise<File> =>
  new Promise((resolve, reject) => entry.file(resolve, reject));

const readAllEntries = (reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> =>
  new Promise((resolve, reject) => {
    const all: FileSystemEntry[] = [];
    const next = () =>
      reader.readEntries((batch) => {
        if (!batch.length) return resolve(all);
        all.push(...batch);
        next();
      }, reject);
    next();
  });

const toRelativePath = (fullPath: string): string => fullPath.replace(/^\//, '');

const collectEntries = async (
  entry: FileSystemEntry,
  files: File[],
  folderPaths: string[],
): Promise<void> => {
  if (entry.isFile) {
    const file = await fileFromEntry(entry as FileSystemFileEntry);
    Object.defineProperty(file, 'webkitRelativePath', {
      value: toRelativePath(entry.fullPath),
      configurable: true,
    });
    files.push(file);
    return;
  }

  if (!entry.isDirectory) return;

  folderPaths.push(toRelativePath(entry.fullPath));
  const reader = (entry as FileSystemDirectoryEntry).createReader();
  const entries = await readAllEntries(reader);
  for (const child of entries) await collectEntries(child, files, folderPaths);
};

export interface DropReadResult {
  files: File[];
  /** Đường dẫn MỌI thư mục gặp phải, kể cả rỗng hoặc chỉ chứa thư mục con. */
  folderPaths: string[];
  hasRootFile: boolean;
}

export const readDirectoryDrop = async (dt: DataTransfer): Promise<DropReadResult> => {
  const entries = Array.from(dt.items)
    .map((it) => it.webkitGetAsEntry?.() ?? null)
    .filter((e): e is FileSystemEntry => !!e);

  const hasRootFile = entries.some((e) => e.isFile);
  const files: File[] = [];
  const folderPaths: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory) await collectEntries(entry, files, folderPaths);
  }
  return { files, folderPaths, hasRootFile };
};
