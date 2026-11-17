'use client';

import { cn } from '@/shared/utils/style/cn';

const LIGHTBOX_TOOL_BUTTON_CLASSES = cn(
  "relative touch:after:absolute touch:after:-inset-x-0.5 touch:after:-inset-y-1.5 touch:after:content-['']",
  'flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-sm text-fg-subheading outline-none',
  'transition-colors duration-150 ease-out',
  'enabled:hover:bg-bg-nav-hover enabled:hover:text-fg-heading enabled:active:bg-bg-nav-active',
  'focus-visible:ring-2 focus-visible:ring-ring-focus',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export interface LightboxToolButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * LightboxToolButton — nút vuông chỉ có icon của thanh công cụ lightbox (xoay, zoom, tải về…).
 *
 * Dùng cho nút riêng truyền vào `ImageLightbox actions` để trông y hệt nút xoay / zoom có sẵn.
 * Sửa giao diện: `LIGHTBOX_TOOL_BUTTON_CLASSES`.
 *
 * @param props.icon - Icon của nút (thường `<SystemIcon size={16} />`).
 * @param props.label - Tên trợ năng, dùng luôn làm tooltip gốc của trình duyệt.
 * @param props.onClick - Bấm nút.
 * @param props.disabled - `true` → mờ đi, không bấm được. Mặc định `false`.
 *
 * @example
 * <LightboxToolButton icon={<SystemIcon name="share-nodes-outline" size={16} />} label="Chia sẻ" onClick={share} />
 */
function LightboxToolButton({ icon, label, onClick, disabled }: LightboxToolButtonProps) {
  return (
    <button
      aria-label={label}
      className={LIGHTBOX_TOOL_BUTTON_CLASSES}
      disabled={disabled}
      title={label}
      type="button"
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

export default LightboxToolButton;
