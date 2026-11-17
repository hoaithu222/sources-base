import { memo } from 'react';
import { Link } from 'react-router-dom';

import { AppTile, Badge } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import {
  EXEC_ATTENTION_LEVEL,
  type ExecAttentionItem,
} from '../constants/executive-lists.constants';

interface AttentionListProps {
  items: readonly ExecAttentionItem[];
}

const ATTENTION_LIST_CLASSES = {
  list: 'flex flex-col',
  item: cn(
    'relative',
    "before:pointer-events-none before:absolute before:top-0 before:right-3 before:left-14 before:h-px before:bg-border-default before:content-['']",
    'first:before:hidden',
  ),
  link: cn(
    'flex min-h-14 items-center gap-3 rounded-lg px-3 py-2.5 outline-none',
    'transition-colors duration-150 ease-out hover:bg-bg-nav-hover active:bg-bg-nav-active',
    'focus-visible:bg-bg-nav-hover focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-inset',
  ),
  tile: 'rounded-lg',
  text: 'flex min-w-0 flex-1 flex-col gap-0.5',
  title: 'truncate text-body-14-medium text-fg-heading',
  description: 'line-clamp-2 text-caption-12 text-fg-muted',
  chevron: 'shrink-0 text-fg-faint',
} satisfies Record<string, string>;

/**
 * AttentionList — danh sách "Điểm cần chú ý" kiểu hộp nhóm macOS: mỗi dòng là `<Link>` thật sang màn nghiệp vụ xử lý
 * việc đó (công nợ, đơn mua, tồn kho, tiến độ, chấm công, sổ cái) — ô `AppTile` theo tông phân hệ · tên + chi tiết
 * · huy hiệu con số chính tô theo mức độ (`EXEC_ATTENTION_LEVEL`: khẩn đỏ · cần xử lý cam · theo dõi xám) · `›`.
 * Vạch ngăn thụt vào sau ô icon, dòng đầu không vạch.
 * Lưu ý: mức độ còn có chữ ẩn cho trình đọc màn hình — màu không phải nguồn thông tin duy nhất; chuột phải mở tab mới.
 *
 * @param props.items - Các việc cần chú ý, xếp theo mức độ giảm dần.
 *
 * @example
 * <AttentionList items={EXEC_ATTENTION_ITEMS} />
 */
const AttentionList = memo(function AttentionList({ items }: AttentionListProps) {
  return (
    <ul className={ATTENTION_LIST_CLASSES.list}>
      {items.map((item) => {
        const level = EXEC_ATTENTION_LEVEL[item.level];
        return (
          <li key={item.id} className={ATTENTION_LIST_CLASSES.item}>
            <Link className={ATTENTION_LIST_CLASSES.link} to={item.href}>
              <AppTile
                className={ATTENTION_LIST_CLASSES.tile}
                icon={item.icon}
                size="sm"
                tone={item.tone}
              />
              <span className={ATTENTION_LIST_CLASSES.text}>
                <span className={ATTENTION_LIST_CLASSES.title}>{item.title}</span>
                <span className={ATTENTION_LIST_CLASSES.description}>{item.description}</span>
              </span>
              <Badge color={level.color} size="sm" variant="tinted">
                <span className="sr-only">{`${level.label}: `}</span>
                {item.badge}
              </Badge>
              <SystemIcon
                aria-hidden
                className={ATTENTION_LIST_CLASSES.chevron}
                name="angle-right-outline"
                size={14}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
});

export default AttentionList;
