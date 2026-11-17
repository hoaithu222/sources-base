import { memo } from 'react';

import {
  Badge,
  BoxGrid,
  BoxPanel,
  Button,
  CompactKpiCard,
  Dropdown,
  Input,
  PageBody,
  PageShell,
  Surface,
  Text,
  Toolbar,
} from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import { DEMO_STATUS_FILTER } from '../../constants/surfaces-layout/layout-boxes.constants';

/**
 * LayoutBoxesSection — mục "Hộp bố cục trang" của trang `/demo`: `PageShell` · `PageBody` · `Toolbar` · `BoxGrid` — công thức bố cục trang.
 */
const LayoutBoxesSection = memo(function LayoutBoxesSection() {
  return (
    <DemoSection
      description="PageShell · PageBody · Toolbar · BoxGrid — công thức bố cục trang, thay cho việc gõ tay flex h-full min-h-0."
      importPath="@/shared/ui"
      title="Hộp bố cục trang"
    >
      <DemoRow
        label="PageShell · variant"
        note="scroll = khoá cao, vùng trong tự cuộn · flow = KHÔNG khoá cao nên nội dung TRÀN khỏi khung mẫu (đúng ý đồ) · center = một khối canh giữa"
        stacked
      >
        <BoxGrid gap="sm" min="md">
          {(['scroll', 'flow', 'center'] as const).map((variant) => (
            <Surface key={variant} className="h-40" padding="sm">
              <PageShell variant={variant}>
                <Text className="font-mono" size="extraTiny" skin="muted">
                  variant=&quot;{variant}&quot;
                </Text>
                {variant === 'center' ? (
                  <Badge color="neutral" variant="tinted">
                    khối canh giữa
                  </Badge>
                ) : (
                  <PageBody overflow={variant === 'scroll' ? 'scroll' : 'hidden'}>
                    {Array.from({ length: 6 }, (_, i) => (
                      <Text key={i} size="tiny">
                        Dòng nội dung {i + 1}
                      </Text>
                    ))}
                  </PageBody>
                )}
              </PageShell>
            </Surface>
          ))}
        </BoxGrid>
      </DemoRow>

      <DemoRow
        label="Toolbar · cụm trái NỞ, cụm phải GHIM"
        note="thu hẹp cửa sổ để thấy phần thiếu chỗ luôn trừ vào cụm lọc, không trừ vào nút hành động"
        stacked
      >
        <Toolbar
          border="bottom"
          left={
            <>
              <Input
                clearable
                placeholder="Tìm theo tên…"
                startIcon={<SystemIcon name="magnifying-glass-outline" size={14} />}
                wrapperClassName="w-56"
              />
              <Dropdown className="w-40" options={DEMO_STATUS_FILTER} />
            </>
          }
          padding="md"
          right={
            <>
              <Button size="sm" variant="stroke">
                Xuất Excel
              </Button>
              <Button size="sm">Thêm mới</Button>
            </>
          }
        />
      </DemoRow>

      <DemoRow
        label="Toolbar · border × padding"
        note="vạch ngăn tách hàng công cụ khỏi thân hộp — top cho thanh đặt ở chân"
        stacked
      >
        <BoxGrid gap="sm" min="lg">
          {(['none', 'bottom', 'top'] as const).map((border) => (
            <Surface
              key={border}
              className={border === 'top' ? 'flex flex-col-reverse' : 'flex flex-col'}
            >
              <Toolbar
                border={border}
                left={
                  <Text className="font-mono" size="extraTiny" skin="muted">
                    border=&quot;{border}&quot;
                  </Text>
                }
                padding="md"
                right={
                  <Badge color="info" size="xs" variant="tinted">
                    12
                  </Badge>
                }
              />
              <div className="p-2">
                <Text size="extraTiny" skin="muted">
                  Thân hộp
                </Text>
              </div>
            </Surface>
          ))}
        </BoxGrid>
      </DemoRow>

      <DemoRow
        label="BoxGrid · min (bề ngang MỘT ô, số cột do màn quyết)"
        note="khác FormGrid — ở đó bạn khai SỐ CỘT, mỗi cột có trần 448px"
        stacked
      >
        <BoxGrid min="md">
          {(['Hồ sơ', 'Đã duyệt', 'Chờ xử lý', 'Quá hạn', 'Tạm dừng'] as const).map((label, i) => (
            <CompactKpiCard
              key={label}
              color={(['blue', 'green', 'yellow', 'red', 'gray'] as const)[i]}
              icon="cube-bold"
              label={label}
              value={(i + 1) * 137}
            />
          ))}
        </BoxGrid>
      </DemoRow>

      <DemoRow label="BoxGrid · min=lg cho panel có tiêu đề" stacked>
        <BoxGrid min="lg">
          {['Tiến độ tuần', 'Nhân lực tại hiện trường'].map((title) => (
            <BoxPanel key={title} border="hairline" headerDivider title={title}>
              <div className="p-2">
                <Text size="tiny" skin="muted">
                  Thân panel. Ô của lưới cao bằng nhau nên hàng panel đọc ra là một hàng.
                </Text>
              </div>
            </BoxPanel>
          ))}
        </BoxGrid>
      </DemoRow>
    </DemoSection>
  );
});

export default LayoutBoxesSection;
