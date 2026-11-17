import type { CSSProperties } from 'react';
import {
  includesNormalized,
  normalizeSearch,
  stripDiacritics,
} from '@/shared/utils/format/string.utils';
import type { TreeNodeData, TreeProps, TreeStateKind } from './tree.types';

interface TreeStateView {
  kind: TreeStateKind;
  message: string;
}

/** Một đoạn của tên node: `hit` = khớp từ khoá tìm kiếm (bọc `<mark>`). */
interface TreeMatchSegment {
  text: string;
  hit: boolean;
}

/** Vạch dẫn nằm ở px thứ 7–8 của mỗi cấp thụt lề — ngay dưới tâm chevron (`size-4`) của cấp tổ tiên. */
const TREE_GUIDE_OFFSET = 7;

/** `true` khi `searchTerm` (đã trim) không khớp node nào — node hiện nếu chính nó hoặc hậu duệ khớp. */
export function hasNoSearchResult(
  data: TreeNodeData[],
  searchTerm: string | undefined,
  searchMatch: TreeProps['searchMatch'],
): boolean {
  const term = searchTerm?.trim();
  if (!term) return false;
  const needle = normalizeSearch(term);
  const matches = (node: TreeNodeData): boolean => {
    const selfMatch = searchMatch ? searchMatch(node, term) : includesNormalized(node.name, needle);
    return selfMatch || (node.children?.some(matches) ?? false);
  };
  return !data.some(matches);
}

/** `null` khi có cây để vẽ; ngược lại là trạng thái thay cho cây (đang tải · trống · không khớp tìm kiếm). */
export function getStateView(
  loading: boolean,
  data: TreeNodeData[],
  noSearchResult: boolean,
  messages: { loading: string; empty: string; searchEmpty: string },
): TreeStateView | null {
  if (loading) return { kind: 'loading', message: messages.loading };
  if (data.length === 0) return { kind: 'empty', message: messages.empty };
  if (noSearchResult) return { kind: 'search', message: messages.searchEmpty };
  return null;
}

/** Nền vẽ đường dẫn thụt lề: mỗi cấp tổ tiên một vạch 1px `--tree-guide` (tối: pha xanh lá) / `divider-default`; gốc → `undefined`. */
export function treeIndentGuideStyle(level: number, indent: number): CSSProperties | undefined {
  if (level <= 0 || indent <= TREE_GUIDE_OFFSET + 1) return undefined;
  const line = `var(--tree-guide, var(--color-divider-default)) ${TREE_GUIDE_OFFSET}px ${TREE_GUIDE_OFFSET + 1}px`;
  return {
    backgroundImage: `repeating-linear-gradient(to right, transparent 0 ${TREE_GUIDE_OFFSET}px, ${line}, transparent ${TREE_GUIDE_OFFSET + 1}px ${indent}px)`,
    backgroundSize: `${level * indent}px 100%`,
    backgroundRepeat: 'no-repeat',
  };
}

const foldChar = (char: string) => (/\s/.test(char) ? ' ' : stripDiacritics(char).toLowerCase());

/**
 * Cắt `text` thành đoạn khớp / không khớp `term` theo CÙNG luật lọc của Tree (bỏ dấu, không phân biệt
 * hoa thường, gộp khoảng trắng) — CHỈ để tô `<mark>`; lọc vẫn qua `includesSearch` / `searchMatch`.
 */
export function splitTreeMatch(text: string, term: string | undefined): TreeMatchSegment[] {
  const needle = normalizeSearch(term);
  if (!needle || !text) return [{ text, hit: false }];

  let folded = '';
  const origin: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    const char = foldChar(text[i]);
    if (char === ' ' && folded.endsWith(' ')) continue;
    for (const part of char) {
      folded += part;
      origin.push(i);
    }
  }

  const segments: TreeMatchSegment[] = [];
  let cursor = 0;
  let at = folded.indexOf(needle);
  while (at !== -1) {
    const start = Math.max(origin[at], cursor);
    let end = origin[at + needle.length - 1] + 1;
    while (end < text.length && foldChar(text[end]) === '') end += 1;
    if (start > cursor) segments.push({ text: text.slice(cursor, start), hit: false });
    if (end > start) segments.push({ text: text.slice(start, end), hit: true });
    cursor = Math.max(cursor, end);
    at = folded.indexOf(needle, at + needle.length);
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), hit: false });
  return segments;
}
