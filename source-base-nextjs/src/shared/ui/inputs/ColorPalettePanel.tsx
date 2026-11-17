'use client';

import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import Divider from '@/shared/ui/primitives/Divider';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { generateDistinctHexColor } from '@/shared/utils/style/color-hsl.utils';
import Input from './Input';

export interface ColorPalettePanelProps {
  value?: string | null;
  onChange: (hex: string) => void;
  preset?: readonly string[];
  usedColors?: readonly string[];
  showRandomSuggest?: boolean;
  takenLabel?: string;
  className?: string;
}

type ColorSwatchState = 'active' | 'taken' | 'idle';

const COLOR_PALETTE_SWATCH_BASE_CLASSES = cn(
  "relative touch:after:absolute touch:after:-inset-1 touch:after:content-['']",
  'flex size-6 items-center justify-center rounded-full border-2',
  'transition-[transform,box-shadow] duration-150 ease-out active:scale-90 motion-reduce:transition-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const COLOR_PALETTE_SWATCH_STATE_CLASSES = {
  active: 'cursor-pointer border-neutral-0/80 ring-2 ring-primary-5',
  taken: 'cursor-not-allowed border-transparent opacity-50',
  idle: 'cursor-pointer border-transparent hover:scale-110',
} satisfies Record<ColorSwatchState, string>;

const COLOR_PALETTE_ICON_BUTTON_CLASSES = cn(
  "relative touch:after:absolute touch:after:-inset-1 touch:after:content-['']",
  'flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full',
  'border border-border-strong bg-bg-subtle text-fg-muted',
  'transition-[color,border-color,box-shadow] duration-150 ease-out',
  'hover:border-primary-5 hover:text-action-base',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const COLOR_PALETTE_CUSTOM_BUTTON_CLASSES = cn(COLOR_PALETTE_ICON_BUTTON_CLASSES, 'border-dashed');

const DEFAULT_PRESET: readonly string[] = [
  '#06B6D4',
  '#3B82F6',
  '#0EA5E9',
  '#22C55E',
  '#F59E0B',
  '#F26410',
  '#F43F5E',
  '#8B5CF6',
];

const FALLBACK = '#06B6D4';
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function swatchStateOf(active: boolean, takenByOther: boolean): ColorSwatchState {
  if (takenByOther) return 'taken';
  return active ? 'active' : 'idle';
}

/**
 * ColorPalettePanel — bảng chọn màu hex: lưới preset + màu tuỳ chỉnh (bảng màu của trình duyệt · ô nhập hex ·
 * gợi ý ngẫu nhiên không trùng).
 *
 * Không phụ thuộc react-hook-form — dùng được trong form lẫn trên từng dòng danh sách. Trong form cần nút mở
 * popover thì dùng `ColorPickerField` (bọc chính panel này).
 * Sửa giao diện: ô màu → `COLOR_PALETTE_SWATCH_BASE_CLASSES` / `COLOR_PALETTE_SWATCH_STATE_CLASSES` · hai nút
 * tròn phụ → `COLOR_PALETTE_ICON_BUTTON_CLASSES` (nút "+" màu tuỳ chỉnh thêm viền đứt
 * `COLOR_PALETTE_CUSTOM_BUTTON_CLASSES`).
 * Mỗi ô màu có tên đọc màn hình là mã hex (`aria-label`) và `aria-pressed` khi đang chọn.
 * Lưu ý: hex là DỮ LIỆU người dùng chọn nên được phép (ngoại lệ của luật cấm hex — color-system.md); ô màu
 * cỡ cố định `size-6` (docs/notes/components/inputs.md, mục ColorPalettePanel).
 *
 * @param props.value - Hex đang chọn (`#RRGGBB`); rỗng / sai định dạng = chưa chọn. Đổi từ ngoài thì ô hex
 *   cập nhật theo.
 * @param props.onChange - Gọi với hex VIẾT HOA (`#22C55E`) khi chọn ô màu, chọn ở bảng màu trình duyệt, gõ đủ
 *   6 ký tự hex hoặc bấm gợi ý.
 * @param props.preset - Danh sách hex của lưới (nên 8 màu — lưới 8 cột). Mặc định 8 màu có sẵn.
 * @param props.usedColors - Hex đã dùng bởi bản ghi khác: ô bị khoá + dấu ✕; nút gợi ý tránh các màu này.
 * @param props.showRandomSuggest - `true` → hiện nút gợi ý màu ngẫu nhiên. Mặc định `false`.
 * @param props.takenLabel - Tooltip của ô màu đã bị chiếm, và dòng cảnh báo khi màu đang chọn trùng
 *   `usedColors`. Mặc định theo ngôn ngữ (`ui.inputs` → `colorPalette.taken`).
 * @param props.className - Class thêm cho khung ngoài.
 *
 * @example
 * <ColorPalettePanel showRandomSuggest usedColors={takenColors} value={color} onChange={setColor} />
 */
const ColorPalettePanel = memo(function ColorPalettePanel({
  value,
  onChange,
  preset,
  usedColors,
  showRandomSuggest = false,
  takenLabel,
  className,
}: ColorPalettePanelProps) {
  const t = useTranslations('ui.inputs');
  const takenText = takenLabel ?? t('colorPalette.taken');
  const current = HEX_RE.test(value ?? '') ? value!.toUpperCase() : '';
  const [hexDraft, setHexDraft] = useState(current);
  const [syncedCurrent, setSyncedCurrent] = useState(current);
  const nativeRef = useRef<HTMLInputElement>(null);

  if (current !== syncedCurrent) {
    setSyncedCurrent(current);
    setHexDraft(current);
  }

  const activePreset = useMemo(() => preset ?? DEFAULT_PRESET, [preset]);
  const usedSet = useMemo(
    () => new Set((usedColors ?? []).map((hex) => hex.toUpperCase())),
    [usedColors],
  );

  const commit = useCallback(
    (hex: string) => {
      const normalized = hex.toUpperCase();
      setHexDraft(normalized);
      onChange(normalized);
    },
    [onChange],
  );

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setHexDraft(raw);
      if (HEX_RE.test(raw)) onChange(raw.toUpperCase());
    },
    [onChange],
  );

  const handleHexBlur = useCallback(() => {
    if (!HEX_RE.test(hexDraft)) setHexDraft(current);
  }, [hexDraft, current]);

  const handleRandom = useCallback(
    () => commit(generateDistinctHexColor([...usedSet])),
    [commit, usedSet],
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="grid grid-cols-8 justify-items-center gap-1.5">
        {activePreset.map((hex) => {
          const upper = hex.toUpperCase();
          const active = current === upper;
          const takenByOther = usedSet.has(upper) && !active;
          const swatchClassName = cn(
            COLOR_PALETTE_SWATCH_BASE_CLASSES,
            COLOR_PALETTE_SWATCH_STATE_CLASSES[swatchStateOf(active, takenByOther)],
          );
          return (
            <button
              key={hex}
              aria-label={upper}
              aria-pressed={active}
              className={swatchClassName}
              disabled={takenByOther}
              style={{ backgroundColor: hex }}
              title={takenByOther ? takenText : upper}
              type="button"
              onClick={() => commit(hex)}
            >
              {active && <SystemIcon className="text-neutral-0" name="check-outline" size={11} />}
              {takenByOther && (
                <SystemIcon className="text-neutral-0" name="xmark-outline" size={11} />
              )}
            </button>
          );
        })}
      </div>

      <Divider variant="dashed" />

      <div className="flex items-center gap-2">
        <div className="relative shrink-0">
          <button
            className={COLOR_PALETTE_CUSTOM_BUTTON_CLASSES}
            title={t('colorPalette.custom')}
            type="button"
            onClick={() => nativeRef.current?.click()}
          >
            <SystemIcon name="plus-outline" size={11} />
          </button>
          <input
            ref={nativeRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 size-0 opacity-0"
            tabIndex={-1}
            type="color"
            value={HEX_RE.test(hexDraft) ? hexDraft : current || FALLBACK}
            onChange={(e) => commit(e.target.value)}
          />
        </div>

        <Input
          aria-label={t('colorPalette.hexAria')}
          maxLength={7}
          placeholder={current || FALLBACK}
          size="sm"
          value={hexDraft}
          onBlur={handleHexBlur}
          onChange={handleHexInput}
        />

        {showRandomSuggest && (
          <button
            className={COLOR_PALETTE_ICON_BUTTON_CLASSES}
            title={t('colorPalette.random')}
            type="button"
            onClick={handleRandom}
          >
            <SystemIcon name="arrows-rotate-outline" size={11} />
          </button>
        )}
      </div>

      {usedSet.has(current) && <p className="text-caption-12 text-warning">{takenText}.</p>}
    </div>
  );
});

export default ColorPalettePanel;
