import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useImeSafeSearchInput } from '@/shared/hooks';
import { EmptyState } from '@/shared/ui';
import { matchesSearch } from '@/shared/utils/format/string.utils';

import { useCommandPaletteStore } from './command-palette.store';
import { COMMAND_PALETTE_SLOT_CLASSES } from './command-palette.theme';
import type { CommandPaletteGroup, CommandPaletteItem } from './command-palette.types';
import PaletteFooter from './parts/palette-footer';
import PaletteRow from './parts/palette-row';
import PaletteSearch from './parts/palette-search';

interface CommandPaletteProps {
  groups: CommandPaletteGroup[];
  placeholder?: string;
}

interface CommandPaletteEntry {
  item: CommandPaletteItem;
  flatIndex: number;
}

function focusSearchInput(e: Event) {
  e.preventDefault();
  (e.target as HTMLElement)?.querySelector('input')?.focus();
}

function revealHighlighted(list: HTMLElement | null) {
  requestAnimationFrame(() => {
    list?.querySelector('[data-highlighted]')?.scrollIntoView?.({ block: 'nearest' });
  });
}

/**
 * CommandPalette — hộp thoại tìm nhanh toàn cục (Ctrl/⌘+K), dựng trên `@radix-ui/react-dialog`: ô tìm
 * (gõ không dấu vẫn khớp) + danh sách mục theo nhóm, ↑ ↓ di chuyển, Enter chọn.
 *
 * Mở / đóng qua `useCommandPaletteStore` (nút `<CommandPaletteTrigger />`, phím `useCommandPaletteShortcut`).
 * Mục có `href` là `<Link>` thật (chọn = điều hướng); mục có `onSelect` là lệnh tại chỗ. Chọn xong tự đóng.
 * ↑ ↓ dời hàng sáng VÀ cuộn nó vào tầm nhìn; Enter lúc IME đang ghép chữ không chạy lệnh. Không còn mục nào
 * khớp → `EmptyState`.
 * Sửa giao diện: class → `command-palette.theme.ts` · ô tìm → `parts/palette-search.tsx` · hàng kết
 * quả → `parts/palette-row.tsx`.
 * Lưu ý: GENERIC — không đọc menu / `PATHS` / store của app; `app/shell/AppCommandPalette.tsx` dựng
 * `groups`. Mount MỘT lần ở gốc layout (cần nằm trong Router).
 *
 * @param props.groups - Các nhóm `{ label, items[] }`; mỗi mục `{ id, label, icon, description?,
 *   keywords?, onIntent?, href | onSelect }` — `onIntent` chạy khi mục được tô sáng (phím, chuột, focus).
 *   Nhóm không còn mục nào khớp thì ẩn.
 * @param props.placeholder - Chữ gợi ý của ô tìm. Mặc định "Tìm phân hệ, trang, hành động…".
 *
 * @example
 * <CommandPalette
 *   groups={[{ label: 'Điều hướng', items: [{ id: 'home', label: 'Trang chủ', icon: 'house-outline', href: '/' }] }]}
 * />
 */
function CommandPalette({
  groups,
  placeholder = 'Tìm phân hệ, trang, hành động…',
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const isOpen = useCommandPaletteStore((state) => state.isOpen);
  const close = useCommandPaletteStore((state) => state.close);

  const [query, setQuery] = useState('');
  const [rawActiveIndex, setRawActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const { inputProps } = useImeSafeSearchInput(query, setQuery);

  const { displayGroups, flatItems } = useMemo(() => {
    const flat: CommandPaletteItem[] = [];
    const display: { label: string; entries: CommandPaletteEntry[] }[] = [];

    for (const group of groups) {
      const entries: CommandPaletteEntry[] = [];
      for (const item of group.items) {
        if (!matchesSearch([item.label, item.description, ...(item.keywords ?? [])], query))
          continue;
        entries.push({ item, flatIndex: flat.length });
        flat.push(item);
      }
      if (entries.length > 0) display.push({ label: group.label, entries });
    }

    return { displayGroups: display, flatItems: flat };
  }, [groups, query]);

  const activeIndex = flatItems.length === 0 ? 0 : Math.min(rawActiveIndex, flatItems.length - 1);
  const activeItem = isOpen ? flatItems[activeIndex] : undefined;

  useEffect(() => {
    activeItem?.onIntent?.();
  }, [activeItem]);

  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setQuery('');
      setRawActiveIndex(0);
    }
  }

  function runItem(item: CommandPaletteItem) {
    if (item.href === undefined) item.onSelect();
    else void navigate(item.href);
    close();
  }

  function moveActive(delta: number) {
    setRawActiveIndex(
      Math.min(Math.max(activeIndex + delta, 0), Math.max(flatItems.length - 1, 0)),
    );
    revealHighlighted(listRef.current);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flatItems[activeIndex];
      if (item) runItem(item);
    }
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(next) => !next && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={COMMAND_PALETTE_SLOT_CLASSES.overlay} />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={COMMAND_PALETTE_SLOT_CLASSES.panel}
          onOpenAutoFocus={focusSearchInput}
        >
          <DialogPrimitive.Title className="sr-only">Tìm nhanh</DialogPrimitive.Title>

          <PaletteSearch
            inputProps={inputProps}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
          />

          <div ref={listRef} className={COMMAND_PALETTE_SLOT_CLASSES.list}>
            {flatItems.length === 0 && (
              <EmptyState
                description={query ? `Không có mục nào khớp "${query}".` : undefined}
                icon="magnifying-glass-bold"
                title="Không tìm thấy kết quả"
              />
            )}
            {displayGroups.map((group) => (
              <div key={group.label}>
                <p className={COMMAND_PALETTE_SLOT_CLASSES.groupLabel}>{group.label}</p>
                {group.entries.map(({ item, flatIndex }) => (
                  <PaletteRow
                    key={item.id}
                    active={flatIndex === activeIndex}
                    flatIndex={flatIndex}
                    item={item}
                    onActivate={setRawActiveIndex}
                    onRun={runItem}
                  />
                ))}
              </div>
            ))}
          </div>

          <PaletteFooter />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default CommandPalette;
