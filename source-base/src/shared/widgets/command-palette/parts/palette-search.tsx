import { Badge, Input, type InputProps, ModalCloseButton } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { COMMAND_PALETTE_SLOT_CLASSES } from '../command-palette.theme';

interface PaletteSearchProps {
  inputProps: InputProps;
  placeholder: string;
  onKeyDown: InputProps['onKeyDown'];
}

/**
 * PaletteSearch — hàng tìm kiếm đầu Command Palette: ô nhập không viền (icon kính lúp) + nhãn `Esc` (laptop) hoặc
 * nút X (tablet / chạm / điện thoại).
 * Phần nội bộ của `CommandPalette`.
 *
 * Sửa giao diện: khung → `COMMAND_PALETTE_SLOT_CLASSES.searchRow` · nhãn Esc → `.escBadge` · nút X → `.closeButton`.
 *
 * @param props.inputProps - Thuộc tính của ô nhập lấy từ `useImeSafeSearchInput` (ref, giá trị, sự
 *   kiện gõ / ghép chữ IME) — trải thẳng xuống `Input`.
 * @param props.placeholder - Chữ gợi ý của ô tìm.
 * @param props.onKeyDown - Phím trong ô tìm (↑ ↓ dời hàng sáng, Enter chọn).
 *
 * @example
 * <PaletteSearch inputProps={inputProps} placeholder="Tìm…" onKeyDown={handleKeyDown} />
 */
function PaletteSearch({ inputProps, placeholder, onKeyDown }: PaletteSearchProps) {
  return (
    <div className={COMMAND_PALETTE_SLOT_CLASSES.searchRow}>
      <Input
        {...inputProps}
        border="none"
        placeholder={placeholder}
        size="lg"
        startIcon={<SystemIcon name="magnifying-glass-outline" size={16} />}
        onKeyDown={onKeyDown}
      />
      <Badge
        className={COMMAND_PALETTE_SLOT_CLASSES.escBadge}
        color="neutral"
        size="sm"
        variant="tinted"
      >
        Esc
      </Badge>
      <ModalCloseButton className={COMMAND_PALETTE_SLOT_CLASSES.closeButton} forced />
    </div>
  );
}

export default PaletteSearch;
