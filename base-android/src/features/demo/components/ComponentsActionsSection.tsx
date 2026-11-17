import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button, LinkButton, type ButtonSize, type ButtonVariant } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';

import { DemoRow } from './DemoRow';
import { DemoSection } from './DemoSection';

const VARIANTS: ButtonVariant[] = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
  'neutral-secondary',
  'neutral-tertiary',
  'danger',
  'danger-secondary',
];

const SIZES: ButtonSize[] = ['lg', 'md', 'sm', 'xs'];

/** Đủ dài để hàng chip tràn màn 360dp — đó mới là ca cần cuộn ngang. */
const CHIP_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'in', label: 'Tiền vào' },
  { key: 'out', label: 'Tiền ra' },
  { key: 'transfer', label: 'Chuyển khoản' },
  { key: 'bill', label: 'Thanh toán hoá đơn' },
  { key: 'topup', label: 'Nạp điện thoại' },
] as const;

export function ComponentsActionsSection() {
  const [selectedChip, setSelectedChip] = useState('all');

  return (
    <DemoSection
      description="Nút chỉ-icon KHÔNG phải component riêng — đó là prop iconOnly của chính Button, đúng như Figma đặt nó là thuộc tính Only icon của cùng một component set."
      title="Button · LinkButton · Chip"
    >
      {/**
       * ⚠️ Hàng bọc dòng (`DemoRow`), ⛔ KHÔNG phải lưới cột đều.
       *
       * Lưới canh thẳng ĐIỂM BẮT ĐẦU của mỗi nút, nghe thì gọn, nhưng bề rộng
       * cột phải lấy theo nhãn DÀI NHẤT: đo trên máy 411dp được cột ~186dp,
       * trong khi nút `primary` chỉ rộng 96dp ⇒ hụt ~90dp trống sau mỗi nút
       * ngắn, gần bằng cả một cái nút nữa. Cả hàng nhìn ra thành lỗ chỗ.
       *
       * Bọc dòng thì các nút xếp sát nhau đúng `gap-xs` (8dp) và mắt đọc được
       * chúng như MỘT nhóm. ⛔ KHÔNG `fullWidth` — mục này đang bày cỡ THẬT của
       * `Button`.
       *
       * ⚠️ Lưới vẫn đúng cho ô CỐ ĐỊNH cỡ (bảng icon, lưới card) — chỉ hàng nút
       * mới lệch, vì nhãn của nút thì dài ngắn tuỳ biến thể.
       */}
      <DemoRow label="Biến thể — giữ ngón tay để xem trạng thái nhấn (nút viền: nền nhạt cùng tông)">
        {VARIANTS.map((variant) => (
          <Button key={variant} label={variant} size="sm" variant={variant} />
        ))}
      </DemoRow>

      <DemoRow label="Cỡ — xs (32) · sm (40) · md (48) · lg (56)">
        {SIZES.map((size) => (
          <Button key={size} label={size} size={size} />
        ))}
      </DemoRow>

      <DemoRow label="Trạng thái">
        <Button label="Bình thường" size="sm" />
        <Button disabled label="Khoá" size="sm" />
        <Button label="Đang gửi" loading size="sm" />
      </DemoRow>

      <DemoRow label="Có icon · chỉ icon">
        <Button iconLeft="add" label="Thêm mới" size="sm" />
        <Button iconRight="arrow-right" label="Tiếp tục" size="sm" />
        {/* ⛔ `accessibilityLabel` là BẮT BUỘC khi nút không có chữ. */}
        <Button accessibilityLabel="Đóng" iconLeft="cancel" iconOnly size="sm" />
        <Button
          accessibilityLabel="Cài đặt"
          iconLeft="setting"
          iconOnly
          size="sm"
          variant="secondary"
        />
      </DemoRow>

      <DemoRow label="LinkButton — chữ bấm được, không phải khối nút">
        <LinkButton label="Xem chi tiết" />
        <LinkButton iconRight="arrow-right-small" label="Xem thêm" />
        <LinkButton label="Xoá" tone="danger" />
        <LinkButton disabled label="Khoá" />
      </DemoRow>

      {/**
       * ⚠️ Hàng lọc/chọn là `ScrollView` NGANG, ⛔ không `flex-wrap`: bọc dòng làm chip gãy xuống
       * hàng hai/ba, hàng lọc cao lên và đẩy nội dung thật xuống. Cuộn ngang giữ MỘT hàng 44dp
       * (chip `md` cao 40 + `py-3xs` 2×2: `hitSlop` của chip không ra ngoài được khung cuộn, nên
       * khung phải tự đủ 44dp). `-mx-md` + `px-md` ở khung chứa: danh sách chạy sát mép màn nhưng chip đầu vẫn thẳng cột
       * với lề 16dp của nội dung. Mỗi chip đã `numberOfLines={1}` và tự nới vùng chạm tới 44dp.
       */}
      <View className="gap-2xs">
        <Text className="text-caption-sm text-fg-2">Chip — lọc, chọn nhanh (cuộn ngang)</Text>
        <ScrollView
          accessibilityRole="radiogroup"
          className="-mx-md"
          contentContainerClassName="items-center gap-xs px-md py-3xs"
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {CHIP_FILTERS.map(({ key, label }) => (
            <Chip
              key={key}
              label={label}
              role="radio"
              selected={selectedChip === key}
              onPress={() => setSelectedChip(key)}
            />
          ))}
          <Chip disabled label="Khoá" />
        </ScrollView>
      </View>
    </DemoSection>
  );
}
