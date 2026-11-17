import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import { twMergeConfig } from '@/shared/utils/style/cn';

/**
 * Nhóm nội dung có tiêu đề — tiêu đề nằm NGOÀI khối, một khe, rồi tới nội dung.
 * (Khe 12 hay 8 là do `tone` quyết — xem biến thể `tone` bên dưới.)
 *
 * Figma: khối mẫu `822:28748` ("Thông tin đơn hàng", 343×252) — chữ tiêu đề
 * 343×24 ở y=0, thẻ trắng 343×216 ở y=36 ⇒ khe **12** (`Gap/Ga12`). Hàng tiêu
 * đề có hành động là `Frame 1597881248` (`531:29601`, 343×24): chữ bên trái,
 * icon `icon_ht_edit` 24×24 tại **x=319** (sát mép phải, khối rộng 343).
 *
 * Đây là bố cục lặp NHIỀU NHẤT trong bản vẽ — 29 khối đo được trong 4 section
 * (~60 lần nếu đếm cả các màn trùng nhau). Viết tay ở từng nơi thì chắc chắn có
 * chỗ gõ `text-header-md`, có chỗ quên `text-fg-brand`, và gần như không chỗ
 * nào đặt `accessibilityRole="header"`.
 *
 * ── ⛔ Vì sao KHÔNG có nền, không bo góc, không đệm ──────────────────────────
 * Tiêu đề đứng trên nền màn (`bg-base`); cái hộp trắng là việc của `Card`. Gộp
 * hai thứ thành một ("InfoCard") thì hỏng ngay những ca mà CÙNG cái tiêu đề đó
 * đứng trên một `Input` (`301:128885`), trên một cụm form (`259:125374`) hay
 * trên một đoạn văn (slide quy định `193:25481`).
 *
 * ── ⛔ Khe GIỮA hai `Section` là việc của NƠI GỌI ───────────────────────────
 * Bản vẽ để 24 (`gap-xl`) giữa hai nhóm. ⛔ Đừng nhét `mb-xl` vào đây: màn hình
 * nào đã có `gap` ở khối cha sẽ cộng dồn thành 48 và không ai lần ra vì sao các
 * nhóm tụt xa nhau — đúng cái bẫy đã ghi lại ở `EmptyState`.
 *
 * @example
 *   // Khe 24 giữa hai nhóm do NƠI GỌI đặt, không phải component.
 *   <View className="gap-xl">
 *     <Section
 *       action={<LinkButton accessibilityLabel="Sửa thông tin nhận hàng" iconLeft="edit" onPress={edit} />}
 *       title="Thông tin nhận hàng"
 *     >
 *       <Card>
 *         <ListItem label="Người nhận" value="NGUYEN VAN A" />
 *       </Card>
 *     </Section>
 *   </View>
 */
const section = tv(
  {
    slots: {
      /**
       * ⛔ Khe tiêu đề → nội dung KHÔNG cố định: nó đi theo `tone` (xem biến thể
       * bên dưới). Để trống ở đây để mỗi tông tự khai đúng số đo của mình —
       * viết `gap-sm` sẵn ở slot gốc thì `tailwind-merge` vẫn cho biến thể đè
       * được, nhưng người đọc phải dò hai chỗ mới biết khe thật là bao nhiêu.
       */
      root: '',
      /**
       * Hàng tiêu đề LUÔN là `flex-row`, kể cả khi không có `action`.
       *
       * ⚠️ Vì `flex-1` của tiêu đề chỉ có nghĩa "chiếm hết chiều NGANG" khi cha
       * là hàng ngang. Bỏ lớp này rồi đặt `flex-1` thẳng vào `<Text>` trong một
       * khối DỌC thì flexGrow ăn theo trục dọc: tiêu đề giãn cao hết phần trống
       * còn lại của màn và đẩy nội dung xuống dưới mép.
       */
      header: 'flex-row items-center gap-sm',
      /**
       * ⛔ `flex-1` bắt buộc: trong React Native con của `flex-row` mặc định
       * `flexShrink: 0`, nên tiêu đề dài (2 dòng như "Thông tin khách hàng nhận
       * hàng") sẽ ĐẨY `action` ra khỏi mép phải — icon sửa 24×24 nằm ngoài màn,
       * không ai bấm được và cũng không có lỗi nào báo.
       */
      title: 'flex-1 font-semibold',
    },
    variants: {
      /**
       * ⚠️ `tone` quyết CẢ kiểu chữ LẪN khe dưới tiêu đề, vì trong bản vẽ hai
       * thứ đó luôn đi cùng nhau: tiêu đề brand đứng trên một cái THẺ (khe 12),
       * tiêu đề ink đứng trên một ĐOẠN VĂN (khe 8). Tách khe ra thành prop
       * riêng thì mọi nơi gọi phải nhớ ghép đúng cặp, và quên một lần là nhóm
       * đó lệch nhịp với phần còn lại của màn mà không có lỗi nào báo.
       *
       * ⛔ Nơi gọi vẫn đè được bằng `className="gap-…"` — `tailwind-merge` cho
       * class truyền vào thắng class của biến thể.
       */
      tone: {
        /**
         * Tông mặc định của cả 4 section. ✅ Đã mở Figma đối chiếu trực tiếp
         * (`822:28747`, `get_variable_defs`): `HEADER/T18-Semibold`
         * (18/24, weight 600) + `Foreground/Primary/Default` #00453C ⇒
         * `text-header-sm` (typography.json: 18/24) + `text-fg-brand`
         * (#00453C sáng / #57D9BE tối). ⛔ Đừng đổi sang `text-header-md`:
         * 24/32 là cỡ của tiêu đề MÀN, không phải tiêu đề nhóm.
         *
         * Khe 12 (`gap-sm`) đo ở `822:28748`: chữ 343×24 ở y=0, thẻ ở y=36.
         */
        brand: { root: 'gap-sm', title: 'text-header-sm text-fg-brand' },
        /**
         * Tông thường của slide quy định `193:25481`: `LABEL/T16-Semibold`
         * (16/24) + `Foreground/Ink/Default` #1A1A1A — dùng cho tiêu đề CẤP HAI
         * nằm bên trong một nhóm đã có tiêu đề brand.
         *
         * ⚠️ Khe **8** chứ không phải 12, và đó là số đo chứ không phải ý
         * thích: ở `193:25612` chữ tiêu đề cao 21 rồi đoạn văn bắt đầu ở
         * y=27.83 trên khung slide rộng 292.69 vẽ lại khung máy 343 (tỉ lệ
         * 0.8534) ⇒ (27.83 − 21) / 0.8534 = 8. Đoạn văn không có mép thẻ để đỡ
         * mắt như `Card`, nên khe 12 làm tiêu đề trôi hẳn khỏi đoạn nó đang mở.
         */
        default: { root: 'gap-xs', title: 'text-label-lg text-fg-1' },
      },
    },
    defaultVariants: { tone: 'brand' },
  },
  { twMergeConfig },
);

type SectionVariants = VariantProps<typeof section>;

export type SectionTone = NonNullable<SectionVariants['tone']>;

export interface SectionProps {
  /**
   * Khe hành động dạt phải của hàng tiêu đề — trong bản vẽ là icon bút chì
   * (`531:29597`, `1108:28220`; 2 chỗ khác để `hidden`).
   *
   * ⛔ Component KHÔNG tự vẽ icon sửa: cùng khe đó còn phải chứa `<LinkButton>`
   * ("Xem tất cả") hay một `<Button iconOnly>` mở bottom sheet. Nơi gọi truyền
   * vào, đúng luật của `ListItem.trailing` / `Chip.trailing`.
   *
   * ⚠️ Khe này nằm NGOÀI ô trợ năng của tiêu đề nên phần tử đặt vào phải tự có
   * `accessibilityLabel` (nút chỉ có icon) — nếu không trình đọc màn hình xướng
   * một ô trống ngay sau mỗi tiêu đề.
   */
  action?: ReactNode;
  /** Ruột của nhóm: `Card`, `Input`, cụm form, hay một đoạn văn. */
  children: ReactNode;
  className?: string;
  /** Tiêu đề. Là `string` để mang được vai `header` — xem `titleAsHeader`. */
  title: string;
  /**
   * Gắn `accessibilityRole="header"` cho tiêu đề. Mặc định BẬT: đó là cái mốc
   * để trình đọc màn hình nhảy giữa các nhóm thay vì vuốt qua từng dòng của cả
   * màn chi tiết đơn hàng (4 nhóm × ~4 hàng).
   *
   * ⛔ Tắt khi khối cha ĐÃ có một `header` cho cùng nội dung này — `Card` với
   * `title` dạng chuỗi, `BottomSheet`/`Dialog` với `title`, `EmptyState`. Hai
   * node `header` lồng nhau làm TalkBack đếm hai tiêu đề cho một nhóm và điều
   * hướng theo heading nhảy vào cái bên trong.
   */
  titleAsHeader?: boolean;
  /** Chỉnh riêng dòng tiêu đề (đổi màu cho nhóm trên nền tối, cắt dòng…). */
  titleClassName?: string;
  tone?: SectionTone;
}

export function Section({
  action,
  children,
  className,
  title,
  titleAsHeader = true,
  titleClassName,
  tone = 'brand',
}: SectionProps) {
  const styles = section({ tone });

  return (
    <View className={styles.root({ className })}>
      <View className={styles.header()}>
        <Text
          accessibilityRole={titleAsHeader ? 'header' : undefined}
          className={styles.title({ className: titleClassName })}
        >
          {title}
        </Text>
        {action}
      </View>
      {children}
    </View>
  );
}
