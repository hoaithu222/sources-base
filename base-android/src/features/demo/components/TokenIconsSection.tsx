import { Text, View } from 'react-native';

import { ICON_NAMES, Icon, type IconVariant } from '@/shared/ui/icon';

import { DemoGrid } from './DemoGrid';
import { DemoRow } from './DemoRow';
import { DemoSection } from './DemoSection';

const VARIANTS: IconVariant[] = ['linear', 'solid', 'twotone', 'bulk'];

/**
 * ⚠️ Chỉ bày một LÁT của bộ icon.
 *
 * `ICON_NAMES` có 292 tên; vẽ hết là 292 `SvgXml` cùng lúc trên một màn cuộn —
 * máy tầm trung giật thấy rõ và người xem đổ cho component `Icon` chứ không cho
 * trang demo. Cần tra tên đầy đủ thì `ls assets/icons/system`, hoặc gõ trong
 * IDE: `IconName` là union thật nên trình soạn thảo gợi ý đủ 292 tên.
 */
const PREVIEW_COUNT = 24;

export function TokenIconsSection() {
  const preview = ICON_NAMES.filter((name) => !name.includes('/')).slice(0, PREVIEW_COUNT);

  return (
    <DemoSection
      description={`Bộ icon xuất từ Figma, dùng qua <Icon name="…" />. Tên sai là tsc đỏ ngay. Tổng cộng ${String(ICON_NAMES.length)} tên; dưới đây là ${String(PREVIEW_COUNT)} tên đầu.`}
      title="Biểu tượng"
    >
      {/* ⛔ Bỏ `w-[72px]`: bốn ô × 72 + ba khe 8 = 312dp, tràn khung nội dung
          288dp của máy 320dp ⇒ ô thứ tư rơi xuống hàng riêng và trông như thiếu
          một kiểu nét. `DemoGrid` chia lại theo bề rộng thật nên bốn ô luôn
          nằm gọn một hàng ở mọi máy từ 320dp trở lên. */}
      <DemoGrid label="Bốn kiểu nét — thiếu kiểu nào thì tự rơi về `linear`" minItemWidth={64}>
        {VARIANTS.map((variant) => (
          <View key={variant} className="items-center gap-3xs">
            <Icon name="setting" size="lg" variant={variant} />
            <Text className="text-label-xs text-fg-2">{variant}</Text>
          </View>
        ))}
      </DemoGrid>

      <DemoRow label="Màu nhận TÊN TOKEN, ⛔ không nhận mã hex">
        <Icon color="warning" name="alert-warning" size="lg" />
        <Icon color="info" name="alert-information" size="lg" />
        <Icon color="success" name="checkmark-circle" size="lg" />
        <Icon color="error" name="cancel" size="lg" />
        <Icon color="fg-brand" name="home" size="lg" />
      </DemoRow>

      <DemoRow label="Logo ngân hàng — ⛔ KHÔNG nhuộm lại, giữ nhận diện của họ">
        <Icon name="bank/bidv" size={32} />
        <Icon name="bank/acb" size={32} />
        <Icon name="bank/vietcombank" size={32} />
      </DemoRow>

      {/* ⛔ Bỏ `w-[76px]`: ô rộng cứng thì phần dư của hàng luôn dồn hết sang
          MÉP PHẢI — 60dp trống trên máy 320dp, và đúng cái dải trống đó lại làm
          tên icon dài (`arrow-right-small`) bị `numberOfLines={1}` cắt trong
          khi bên cạnh còn chỗ. Chia theo bề rộng thật thì phần dư được rải đều
          vào các ô: cùng số cột, mà mỗi ô rộng thêm vài dp và tên đọc được. */}
      <DemoGrid minItemWidth={76}>
        {preview.map((name) => (
          <View key={name} className="items-center gap-3xs">
            <Icon name={name} />
            <Text className="text-label-xs text-fg-2" numberOfLines={1}>
              {name}
            </Text>
          </View>
        ))}
      </DemoGrid>
    </DemoSection>
  );
}
