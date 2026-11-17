import { useState } from 'react';
import { Text, View } from 'react-native';

import { Alert } from '@/shared/ui/alert';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { ListItem } from '@/shared/ui/list';
import { Dialog } from '@/shared/ui/modal';
import { Tooltip } from '@/shared/ui/tooltip';
import { showToast } from '@/shared/utils/toast.utils';

import { DemoRow } from './DemoRow';
import { DemoSection } from './DemoSection';

export function ComponentsOverlaySection() {
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);

  return (
    <DemoSection
      description="Ba lớp phủ khác nhau, đừng nhầm: BottomSheet cho nội dung, Dialog để BẮT người dùng quyết định, Tooltip cho một câu giải thích."
      title="Thông báo · lớp phủ"
    >
      <View className="gap-sm">
        <Alert description="Giao dịch đã được ghi nhận." title="Thành công" tone="success" />
        <Alert description="Số dư khả dụng không đủ." title="Không thực hiện được" tone="error" />
        <Alert
          description="Phiên đăng nhập sắp hết hạn."
          title="Chú ý"
          tone="warning"
          onClose={() => undefined}
        />
      </View>

      <DemoRow label="Toast — nổi lên rồi tự tắt, KHÔNG chặn thao tác">
        <Button label="Toast thành công" size="sm" onPress={() => showToast('success', 'Đã lưu')} />
        <Button
          label="Toast lỗi"
          size="sm"
          variant="danger-secondary"
          onPress={() => showToast('error', 'Mất kết nối, thử lại sau')}
        />
      </DemoRow>

      <DemoRow label="Dialog · BottomSheet">
        <Button label="Mở Dialog" size="sm" variant="secondary" onPress={() => setDialog(true)} />
        <Button
          label="Mở BottomSheet"
          size="sm"
          variant="secondary"
          onPress={() => setSheet(true)}
        />
      </DemoRow>

      <DemoRow label="Tooltip — chạm vào biểu tượng">
        <Tooltip content="Phí chuyển tiền ngoài hệ thống, thu theo biểu phí hiện hành.">
          <View className="flex-row items-center gap-2xs">
            <Text className="text-body-md text-fg-1">Phí giao dịch</Text>
            <Icon color="fg-3" name="alert-information" size="sm" />
          </View>
        </Tooltip>
      </DemoRow>

      <Dialog
        description="Giao dịch sẽ bị huỷ và không thể khôi phục."
        primaryAction={{ label: 'Huỷ giao dịch', onPress: () => setDialog(false) }}
        secondaryAction={{ label: 'Quay lại', onPress: () => setDialog(false) }}
        title="Huỷ giao dịch?"
        variant="warning"
        visible={dialog}
        onClose={() => setDialog(false)}
      />

      {/*
        ⛔ Tấm dạng DANH SÁCH CHỌN phải `padded={false}`, không phải mặc định.
        Mặc định (`padded`) cho thân tấm `gap-xs px-4`: đường kẻ bị thụt 16dp hai
        đầu, rồi 8dp khe của thân cộng thêm vào làm kẻ dính đáy hàng trên và hở
        với hàng dưới — ra một vạch lệch chứ không ra một kẻ chia đôi.
        Đúng bản vẽ (`Danh sách chọn`, `List thao tác`): row chạy hết bề ngang,
        khe 0, và CHÍNH ROW lo đệm 16 của nó — nhờ vậy dải nhấn lúc bấm cũng
        chạy hết bề ngang. Xem biến thể `padded` trong file style của `BottomSheet`.
      */}
      <BottomSheet
        padded={false}
        title="Chọn tài khoản nguồn"
        visible={sheet}
        onClose={() => setSheet(false)}
      >
        <ListItem
          className="px-md py-sm"
          divider
          label="Tài khoản thanh toán"
          value="12.500.000 ₫"
          onPress={() => setSheet(false)}
        />
        <ListItem
          className="px-md py-sm"
          divider
          label="Tài khoản tiết kiệm"
          value="80.000.000 ₫"
          onPress={() => setSheet(false)}
        />
        <ListItem
          className="px-md py-sm"
          label="Ví điện tử"
          value="350.000 ₫"
          onPress={() => setSheet(false)}
        />
      </BottomSheet>
    </DemoSection>
  );
}
