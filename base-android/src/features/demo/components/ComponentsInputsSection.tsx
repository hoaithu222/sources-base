import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Checkbox } from '@/shared/ui/checkbox';
import { DatePicker } from '@/shared/ui/date-picker';
import { Input } from '@/shared/ui/input';
import { Radio, RadioGroup } from '@/shared/ui/radio';
import { SearchInput } from '@/shared/ui/search';
import { PinInput } from '@/shared/ui/pin';
import { Toggle } from '@/shared/ui/toggle';

import { DemoRow } from './DemoRow';
import { DemoSection } from './DemoSection';

export function ComponentsInputsSection() {
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [small, setSmall] = useState(false);
  const [alone, setAlone] = useState(true);
  const [synced, setSynced] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );
  /**
   * Mô phỏng "lưu lên máy chủ": công tắc giữ NGUYÊN dáng nhưng `busy` chặn bấm đôi cho tới khi xong.
   * ⚠️ Giá trị chỉ đổi SAU khi "lưu xong" — đúng cách dùng thật (cập nhật khi máy chủ đã xác nhận).
   */
  const syncToServer = (next: boolean) => {
    setSaving(true);
    saveTimer.current = setTimeout(() => {
      setSynced(next);
      setSaving(false);
    }, 1200);
  };
  const [radio, setRadio] = useState('1m');
  const [pin, setPin] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  /**
   * ⛔ Ô `value=` mà KHÔNG có `onChangeText` là ô CHẾT: React vẽ lại đúng giá
   * trị cũ sau mỗi phím, người dùng gõ mà màn hình không nhúc nhích. Trang demo
   * là thứ người ta CHÉP đi, nên một ô hỏng ở đây sinh ra n ô hỏng trong dự án.
   *
   * ⚠️ Giá trị khởi tạo là chữ số TRẦN, không phải "2.000.000": `digitsOnly`
   * lọc mọi ký tự không phải chữ số trước khi gọi `onChangeText`, nên dấu chấm
   * phân nhóm sẽ biến mất ngay ở phím đầu tiên — để sẵn dấu chấm là hứa một
   * hành vi mà component cố ý không có (mặt nạ tiền tệ là việc của từng dự án).
   */
  const [amount, setAmount] = useState('2000000');

  return (
    <DemoSection
      description="Ô tìm kiếm ở đây là UNCONTROLLED và đó là ràng buộc bắt buộc: ghi đè state giữa lúc bộ gõ đang ghép dấu làm MẤT DẤU trên Android + Telex."
      title="Ô nhập · lựa chọn"
    >
      <View className="gap-md">
        <Input label="Họ và tên" placeholder="Nguyễn Văn A" required />
        <Input hint="Dùng để nhận mã xác thực" keyboardType="email-address" label="Email" />
        <Input
          digitsOnly
          label="Số tiền"
          message="Số dư không đủ"
          messageTone="error"
          value={amount}
          onChangeText={setAmount}
        />
        <Input disabled label="Không sửa được" value="Đã khoá" />
        <Input label="Mật khẩu" placeholder="Nhập mật khẩu" secure />

        <SearchInput placeholder="Tìm giao dịch…" />

        <DatePicker label="Ngày sinh" value={date} onChange={(value) => setDate(value)} />

        <PinInput label="Mã PIN" secure value={pin} onChange={setPin} />
      </View>

      <DemoRow column label="Checkbox">
        <Checkbox checked={checked} label="Tôi đồng ý" onChange={setChecked} />
        <Checkbox checked={false} indeterminate label="Chọn một phần" />
        <Checkbox checked disabled label="Khoá" />
      </DemoRow>

      <DemoRow column label="Toggle — bật/tắt · đang lưu (busy) · khoá · cỡ nhỏ · đứng một mình">
        <Toggle label="Nhận thông báo" value={enabled} onChange={setEnabled} />
        <Toggle
          busy={saving}
          description="Bấm thử: núm vẫn rõ ràng, bấm đôi bị chặn cho tới khi 'lưu' xong"
          label="Đồng bộ (busy)"
          value={synced}
          onChange={syncToServer}
        />
        <Toggle disabled label="Tắt + khoá" value={false} />
        <Toggle disabled label="Bật + khoá" value />
        <Toggle label="Cỡ nhỏ (sm)" size="sm" value={small} onChange={setSmall} />
        <Toggle accessibilityLabel="Công tắc đứng một mình" value={alone} onChange={setAlone} />
      </DemoRow>

      <View className="gap-2xs">
        <RadioGroup accessibilityLabel="Kỳ hạn gửi" value={radio} onChange={setRadio}>
          <Radio label="1 tháng" value="1m" />
          <Radio label="3 tháng" value="3m" />
          <Radio disabled label="12 tháng (tạm ngưng)" value="12m" />
        </RadioGroup>
      </View>
    </DemoSection>
  );
}
