import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Icon, type IconName } from '@/shared/ui/icon';
import { BottomActionBar, BottomNav, type BottomNavItem } from '@/shared/ui/navigation';

import { DemoSection } from './DemoSection';

/**
 * Thanh icon dưới cùng — bản vẽ tham chiếu chặn ở **4 mục**, và khi có nhiều
 * hơn thì mục thứ tư PHẢI là "Xem thêm" mở bottom sheet (slide 7).
 *
 * ⚠️ Con số 4 không phải thẩm mỹ: nhãn tiếng Việt dài hơn tiếng Anh ~30%, mục
 * thứ năm trên máy 360dp làm nhãn bị cắt còn "Chuyển…" — người dùng phải bấm
 * thử mới biết nó là gì.
 */
const MAX_ACTIONS = 4;

/** Giá trị chỉ để báo "có thanh tab ở dưới" (> 0) — thanh hành động không đọc con số cụ thể. */
const TAB_BAR_HEIGHT_DEMO = 56;

const ACTIONS: { icon: IconName; label: string }[] = [
  { icon: 'money', label: 'Chuyển tiền' },
  { icon: 'bill', label: 'Thanh toán' },
  { icon: 'qr', label: 'Quét QR' },
  { icon: 'history', label: 'Lịch sử' },
  { icon: 'support', label: 'Hỗ trợ' },
];

/** Ba mục mẫu cho thanh tab dưới — cùng bộ icon và cặp màu `AppTabBar` dùng thật. */
const TAB_ITEMS: { icon: IconName; key: string; label: string }[] = [
  { icon: 'home', key: 'home', label: 'Trang chủ' },
  { icon: 'setting', key: 'settings', label: 'Cài đặt' },
  { icon: 'user', key: 'profile', label: 'Cá nhân' },
];

export function PatternLayoutSection() {
  const [agreed, setAgreed] = useState(false);
  const [tab, setTab] = useState('home');

  const tabItems: BottomNavItem[] = TAB_ITEMS.map(({ icon, key, label }) => ({
    key,
    label,
    icon: (
      <Icon
        accentColor={tab === key ? 'fg-on-nav-accent' : 'fg-on-nav-muted'}
        color={tab === key ? 'fg-on-nav-accent' : 'fg-on-nav-muted'}
        name={icon}
        variant={tab === key ? 'twotone' : 'linear'}
      />
    ),
  }));

  /** Quá 4 thì cắt còn 3 + một mục "Xem thêm" — đúng ca cuối của slide 7. */
  const overflowed = ACTIONS.length > MAX_ACTIONS;
  const visible = overflowed ? ACTIONS.slice(0, MAX_ACTIONS - 1) : ACTIONS;

  return (
    <DemoSection
      description="Thứ tự nội dung là quy tắc, không phải gợi ý: banner → thông tin ưu tiên → form. Trên điện thoại phần dưới màn hình gần như không ai cuộn tới."
      title="Cụm chữ và thanh hành động"
    >
      <View className="gap-md rounded-sm bg-bg-1 p-md">
        {/* Thang chữ của bản vẽ tham chiếu: tiêu đề màn T24 semibold, tiêu đề
            cụm T16 semibold, nội dung T14 regular. Ánh xạ sang token của repo
            chứ ⛔ không chép hex Ink500/Ink400. */}
        <Text className="text-header-md font-semibold text-fg-1">Chi tiết quà tặng</Text>

        <View className="gap-xs">
          <Text className="text-label-lg font-semibold text-fg-1">Điều kiện sử dụng</Text>
          <Text className="text-body-md text-fg-2">
            Số điện thoại được nạp là thuê bao đang hoạt động của các nhà mạng. Số điểm cần sử dụng:
            100.000 điểm.
          </Text>
        </View>

        <View className="gap-xs">
          <Text className="text-label-lg font-semibold text-fg-1">Thời hạn</Text>
          <Text className="text-body-md text-fg-2">Ưu đãi áp dụng đến hết 31/12/2026.</Text>
        </View>
      </View>

      <View className="gap-2xs">
        <Text className="text-caption-sm text-fg-2">Ca phổ biến — một nút tràn ngang</Text>
        <BottomActionBar className="rounded-sm border border-divider-1">
          <Button fullWidth label="Tiếp tục" />
        </BottomActionBar>
      </View>

      <View className="gap-2xs">
        <Text className="text-caption-sm text-fg-2">Ca có xác nhận điều kiện điều khoản</Text>
        <BottomActionBar className="rounded-sm border border-divider-1">
          <Checkbox
            checked={agreed}
            label="Tôi đã đọc và đồng ý với Điều kiện, điều khoản giao dịch chung"
            onChange={setAgreed}
          />
          {/* ⛔ `flex-1` ở lớp BỌC NGOÀI + `fullWidth`, không phải `className`
              của `Button`: `className` đi vào khối bên trong, còn thứ chia chỗ
              trong hàng là `<Pressable>` bọc ngoài (mặc định `self-start`). */}
          <View className="flex-row gap-xs">
            <View className="flex-1">
              <Button fullWidth label="Quay lại" variant="secondary" />
            </View>
            <View className="flex-1">
              {/* Nút chính khoá cho tới khi tick — ràng buộc pháp lý, không
                  phải trải nghiệm. */}
              <Button disabled={!agreed} fullWidth label="Xác nhận" />
            </View>
          </View>
        </BottomActionBar>
      </View>

      <View className="gap-2xs">
        <Text className="text-caption-sm text-fg-2">
          Ca đứng TRÊN thanh tab dưới — chỉ một khe 16dp tới thanh, vùng an toàn đáy do thanh tab lo
        </Text>
        {/* ⚠️ Trong app thật `<Tabs>` tự cấp `BottomTabBarHeightContext`; demo này đứng ngoài tabs nên
            giả lập tín hiệu đó. Không có nó, thanh hành động cộng `insets.bottom` (34dp trên iPhone)
            và hở một dải trống giữa nút và thanh tab. */}
        <View className="overflow-hidden rounded-sm border border-divider-1">
          <BottomTabBarHeightContext.Provider value={TAB_BAR_HEIGHT_DEMO}>
            <BottomActionBar>
              <Button fullWidth label="Lưu" />
            </BottomActionBar>
          </BottomTabBarHeightContext.Provider>
          <BottomNav activeKey={tab} items={tabItems} onSelect={setTab} />
        </View>
      </View>

      <View className="gap-2xs">
        <Text className="text-caption-sm text-fg-2">
          Ca nhiều hơn {MAX_ACTIONS} thao tác — 3 mục đầu + &quot;Xem thêm&quot;
        </Text>
        {/* ⚠️ Đây là thanh TÁC VỤ NHANH nền trắng (token nền bg-nav), KHÔNG phải
            thanh tab điều hướng. Thanh tab BottomNav có nền gradient xanh đậm và
            chữ trắng — đừng chép màu qua lại giữa hai cái. */}
        {/* ⚠️ `justify-around` không còn tác dụng khi các mục đã `flex-1` (chúng
            lấp kín hàng, không còn chỗ trống để rải) — chỗ giữa các mục nay do
            `gap-xs` lo. `w-full` + `max-w-…` chứ ⛔ không phải `w-[600px]`: trên
            máy tính bảng 1000dp bốn biểu tượng cách nhau 250dp không còn đọc ra
            là một thanh tác vụ, còn máy hẹp thì vẫn phải co lại được. */}
        <View className="w-full flex-row items-start gap-xs rounded-sm bg-bg-nav p-sm tablet:max-w-[600px] tablet:self-center">
          {visible.map((action) => (
            <ActionItem key={action.label} icon={action.icon} label={action.label} />
          ))}
          {overflowed ? <ActionItem icon="more" label="Xem thêm" /> : null}
        </View>
      </View>
    </DemoSection>
  );
}

/**
 * Một mục trên thanh icon. Cục bộ và không export — chỉ có nghĩa trong mục demo này.
 *
 * ⛔ Bỏ `w-[72px]`: bốn mục × 72 = 288dp, cộng `p-sm` hai bên là 312dp, trong
 * khi máy 320dp chỉ còn 288dp khung nội dung. `View` mặc định `flexShrink: 0`
 * nên chúng KHÔNG co lại mà tràn ra — mục "Xem thêm" bị cắt mất nửa bên phải và
 * `justify-around` thì im lặng không cứu được gì.
 *
 * `flex-1` cho bốn mục chia đều chỗ thật có, `min-w-0` để chữ dài
 * ("Chuyển tiền") được phép xuống dòng thay vì đẩy ô rộng ra.
 */
function ActionItem({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View className="min-w-0 flex-1 items-center gap-2xs">
      <View className="size-10 items-center justify-center rounded-full bg-surface-primary">
        <Icon color="fg-brand" name={icon} size="sm" />
      </View>
      {/* ⛔ `fg-on-nav` là chữ TRẮNG (dành cho thanh tab nền xanh) — đặt lên nền
          trắng của thanh tác vụ nhanh là chữ biến mất. Ở đây là `fg-1`. */}
      <Text className="text-center text-label-xs text-fg-1" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}
