interface InlineScriptProps {
  /** Mã JS chạy đồng bộ khi trình duyệt phân tích HTML. */
  html: string;
}

/**
 * InlineScript — `<script>` nội tuyến cho mã phải chạy TRƯỚC lần vẽ đầu (vd `appearanceInitScript`).
 *
 * Lưu ý: React cảnh báo khi một `<script>` bị render lại ở client (vd trang 404 dựng lại cây). Ở server `type="text/javascript"` (chạy
 * khi phân tích HTML); ở client `type="text/plain"` (trình duyệt bỏ qua) — `suppressHydrationWarning` nuốt khác biệt `type`. Mẫu chính thức:
 * Next docs › preventing-flash-before-hydration.
 *
 * @param props.html - Mã JS.
 *
 * @example
 * <InlineScript html={appearanceInitScript()} />
 */
export default function InlineScript({ html }: InlineScriptProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
    />
  );
}
