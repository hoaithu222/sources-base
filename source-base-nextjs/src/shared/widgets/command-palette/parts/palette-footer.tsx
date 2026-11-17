import { memo } from 'react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/shared/ui';

import { COMMAND_PALETTE_SLOT_CLASSES } from '../command-palette.theme';

interface FooterHintProps {
  keys: readonly string[];
  label: string;
}

const NAVIGATE_KEYS = ['↑', '↓'] as const;

const SELECT_KEYS = ['Enter'] as const;

const FooterHint = memo(function FooterHint({ keys, label }: FooterHintProps) {
  return (
    <span className={COMMAND_PALETTE_SLOT_CLASSES.footerHint}>
      {keys.map((key) => (
        <Badge key={key} color="neutral" size="sm" variant="tinted">
          {key}
        </Badge>
      ))}
      {label}
    </span>
  );
});

/**
 * PaletteFooter — dải gợi ý phím dưới đáy Command Palette ("↑ ↓ di chuyển", "Enter chọn"). Phần nội bộ
 * của `CommandPalette`, không có prop.
 *
 * Sửa giao diện: khung → `COMMAND_PALETTE_SLOT_CLASSES.footer` · mỗi gợi ý → `.footerHint`
 * · phím / chữ → `NAVIGATE_KEYS` · `SELECT_KEYS`.
 *
 * @example
 * <PaletteFooter />
 */
const PaletteFooter = memo(function PaletteFooter() {
  const t = useTranslations('ui.widgets');

  return (
    <div className={COMMAND_PALETTE_SLOT_CLASSES.footer}>
      <FooterHint keys={NAVIGATE_KEYS} label={t('commandPalette.footerNavigate')} />
      <FooterHint keys={SELECT_KEYS} label={t('commandPalette.footerSelect')} />
    </div>
  );
});

export default PaletteFooter;
