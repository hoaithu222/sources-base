import { useState } from 'react';
import { View } from 'react-native';

import { Avatar } from '@/shared/ui/avatar';
import { Badge, BadgeAnchor } from '@/shared/ui/badge';
import { AccountCard, Card } from '@/shared/ui/card';
import { Divider } from '@/shared/ui/divider';
import { EmptyState } from '@/shared/ui/empty-state';
import { Icon } from '@/shared/ui/icon';
import { ListItem } from '@/shared/ui/list';
import { SliderDot } from '@/shared/ui/pagination';
import { Progress } from '@/shared/ui/progress';
import { Skeleton, SkeletonParagraph } from '@/shared/ui/skeleton';
import { Tabs } from '@/shared/ui/tab';

import { DemoRow } from './DemoRow';
import { DemoSection } from './DemoSection';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'in', label: 'Tiền vào', badge: 3 },
  { key: 'out', label: 'Tiền ra' },
];

export function ComponentsDisplaySection() {
  const [tab, setTab] = useState('all');
  const [slide, setSlide] = useState(0);

  return (
    <DemoSection
      description="Thẻ, danh sách, huy hiệu, khung xương. Đây là nhóm hay bị viết lại tại chỗ nhất — tra ở đây trước khi tự dựng."
      title="Hiển thị dữ liệu"
    >
      <DemoRow label="Avatar — mặc định của bản vẽ là cỡ md (40dp)">
        <Avatar name="Nguyễn Văn An" size="xs" />
        <Avatar name="Nguyễn Văn An" size="sm" />
        <Avatar name="Nguyễn Văn An" size="md" />
        <Avatar badge="success" name="Nguyễn Văn An" size="lg" />
        <Avatar size="lg" />
      </DemoRow>

      <DemoRow label="Badge">
        <Badge label="Mới" variant="brand" />
        <Badge label="Thành công" variant="success" />
        <Badge label="Cảnh báo" variant="warning" />
        <Badge appearance="solid" label="Lỗi" variant="error" />
        <Badge count={5} />
        <Badge count={120} maxCount={99} />
        <BadgeAnchor badge={<Badge dot variant="error" />}>
          <Icon name="noti" size="lg" />
        </BadgeAnchor>
      </DemoRow>

      <View className="gap-sm">
        {/*
          Thẻ CÓ LỀ (`p-md`) + khoảng cách 12dp giữa các hàng — đúng mặc định của
          Figma: "thẻ phân cách bằng khoảng trống chứ không bằng kẻ".
          ⛔ Đừng bật `divider` ở đây. `Card` đã cách các con 12dp, nên đường kẻ
          dính đáy hàng TRÊN rồi hở 12dp xuống hàng DƯỚI — nhìn ra một vạch lệch
          chứ không ra một cái kẻ chia đôi. Muốn có kẻ thì dùng mẫu ngay dưới.
        */}
        <Card title="Thẻ có tiêu đề">
          <ListItem label="Số tài khoản" value="1234 5678 9012" />
          <ListItem label="Chủ tài khoản" value="NGUYEN VAN AN" />
          <ListItem label="Trạng thái" tone="success" value="Đang hoạt động" />
          {/* Hàng bấm được trong thẻ CÓ LỀ: giữ ngón tay để thấy lớp nhấn nhạt màu chủ đạo, bo tròn,
              nở 8dp ra hai bên chữ. Nhả tay / cuộn đi thì tự mất (không kẹt). */}
          <ListItem
            label="Hàng bấm được — giữ để xem trạng thái nhấn"
            trailing={<Icon color="fg-3" name="arrow-right-small" size="sm" />}
            onPress={() => undefined}
          />
        </Card>

        {/* Thẻ BẤM ĐƯỢC: nhấn thì cả thẻ phủ lớp nhạt màu chủ đạo, bo đúng 24dp của thẻ. ⛔ Con của
            thẻ bấm được là chữ thường, không đặt `<ListItem onPress>` vào trong (xem `Card.tsx`). */}
        <Card title="Thẻ bấm được — giữ để xem trạng thái nhấn" onPress={() => undefined}>
          <ListItem label="Số tài khoản" value="1234 5678 9012" />
        </Card>

        {/* Thẻ nền ĐẶC `action-base`: nhấn thì nền đổi sang `action-press` (không phải lớp mờ). */}
        <AccountCard
          label="Tài khoản thanh toán"
          secondaryLabel="Số dư khả dụng"
          secondaryValue="12.500.000 ₫"
          value="1234 5678 9012"
          onPress={() => undefined}
        />

        {/*
          Thẻ KHÔNG lề (`padded={false}`) — mẫu "danh sách có kẻ chạy hết bề rộng".
          ⛔ `padded={false}` là giao lề cho CON, không phải bỏ lề: thiếu `px-md`
          ở từng hàng thì chữ dán vào đường bo 24dp của thẻ.
          ⛔ Kèm `gap-0`: 12dp mặc định của `Card` cộng thêm vào giữa hai hàng làm
          đường kẻ lệch hẳn khỏi vị trí chia đôi.
        */}
        <Card className="gap-0" padded={false}>
          <ListItem
            align="stacked"
            className="px-md py-sm"
            description="Nhãn trên, giá trị dưới — dùng khi giá trị dài"
            divider
            label="Nội dung chuyển khoản"
            value="NGUYEN VAN AN chuyen tien hoc phi thang 9"
          />
          {/* Hàng bấm được CHẠY HẾT BỀ NGANG: lớp nhấn hàng đầu/cuối theo bo 24dp của thẻ (nhờ
              `overflow-hidden` của thẻ không đệm) và KHÔNG che đường kẻ `divider`. */}
          <ListItem
            className="px-md py-sm"
            divider
            label="Có thể bấm (có kẻ chia)"
            trailing={<Icon color="fg-3" name="arrow-right-small" size="sm" />}
            onPress={() => undefined}
          />
          <ListItem
            className="px-md py-sm"
            label="Hàng cuối — nhấn để thấy góc dưới bám bo thẻ"
            trailing={<Icon color="fg-3" name="arrow-right-small" size="sm" />}
            onPress={() => undefined}
          />
        </Card>
      </View>

      <DemoRow label="Divider">
        <View className="w-full gap-sm">
          <Divider />
          <Divider label="hoặc" />
          <Divider variant="dashed" />
        </View>
      </DemoRow>

      {/* Tabs: giữ ngón tay lên một tab để xem nền nhấn — tab chưa chọn nền `action-tint`, viên đang
          chọn `action-press` (không còn mờ đi). */}
      <View className="gap-sm">
        <Tabs items={TABS} value={tab} onChange={setTab} />
        <Tabs items={TABS} value={tab} variant="underline" onChange={setTab} />
        <SliderDot activeIndex={slide} count={3} onPressDot={setSlide} />
      </View>

      <Progress
        steps={[
          { id: '1', title: 'Nhập thông tin', status: 'done' },
          { id: '2', title: 'Xác thực OTP', status: 'current' },
          { id: '3', title: 'Hoàn tất', status: 'pending' },
        ]}
      />

      <View className="gap-xs">
        <Skeleton height={120} radius={16} />
        <SkeletonParagraph />
      </View>

      <EmptyState
        actions={[{ label: 'Tải lại', onPress: () => undefined }]}
        description="Chưa có giao dịch nào trong khoảng thời gian này."
        size="compact"
        title="Không có dữ liệu"
      />
    </DemoSection>
  );
}
