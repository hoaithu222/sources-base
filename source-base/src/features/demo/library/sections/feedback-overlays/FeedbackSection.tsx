import { memo, useState } from 'react';

import {
  Button,
  Callout,
  EmptyState,
  Surface,
  TableEmptyIllustration,
  Text,
  showToast,
} from '@/shared/ui';

import {
  CALLOUT_INTENTS,
  CALLOUT_VARIANTS,
  EMPTY_STATE_ICON_COLORS,
  EMPTY_STATE_SIZES,
  ILLUSTRATION_ACCENTS,
  TOAST_MESSAGE,
  TOAST_TYPES,
} from '../../constants/feedback-overlays/feedback.constants';
import DemoGrid from '../../components/shell/DemoGrid';
import DemoRawToast from '../../components/showcase/DemoRawToast';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

/**
 * FeedbackSection — mục "Phản hồi" của trang `/demo`: `Callout` · toast · `EmptyState`.
 */
const FeedbackSection = memo(function FeedbackSection() {
  const [calloutVisible, setCalloutVisible] = useState(true);

  return (
    <DemoSection
      description="Callout · Toast · EmptyState. Không để thao tác async nào im lặng."
      importPath="@/shared/ui · showToast()"
      title="Phản hồi"
    >
      <DemoRow
        label="Callout · intent × variant"
        note="chữ luôn token đọc được; màu intent ở icon, viền, vạch nhấn trái"
        stacked
      >
        <DemoGrid align="start" min="lg">
          {CALLOUT_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-col gap-2">
              <Text className="font-mono" size="extraTiny" skin="muted">
                {`variant="${variant}"`}
              </Text>
              {CALLOUT_INTENTS.map((intent) => (
                <Callout
                  key={intent}
                  description="Một dòng giải thích vì sao, và người dùng nên làm gì tiếp."
                  intent={intent}
                  title={`intent="${intent}"`}
                  variant={variant}
                />
              ))}
            </div>
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow label="Callout · closable / icon tuỳ biến / icon=false" stacked>
        {calloutVisible ? (
          <Callout
            closable
            description="Bấm ✕ để đóng — ẩn/hiện do consumer tự quản qua onClose."
            intent="warning"
            title="closable"
            onClose={() => setCalloutVisible(false)}
          />
        ) : (
          <Button size="sm" variant="stroke" onClick={() => setCalloutVisible(true)}>
            Hiện lại Callout closable
          </Button>
        )}
        <Callout
          description={'icon="bolt-lightning-bold" thay cho icon mặc định của intent.'}
          icon="bolt-lightning-bold"
          intent="info"
          title="icon tuỳ biến"
        />
        <Callout
          description="icon={false} — chỉ còn tiêu đề và mô tả."
          icon={false}
          intent="neutral"
          title="icon={false}"
        />
      </DemoRow>

      <DemoRow
        label="Toast · type (qua showToast())"
        note="ToastContainer singleton ở AppOverlays render đúng qua đây"
      >
        {TOAST_TYPES.map((type) => (
          <Button
            key={type}
            size="sm"
            variant="stroke"
            onClick={() => showToast(type, TOAST_MESSAGE[type])}
          >
            {type}
          </Button>
        ))}
      </DemoRow>

      <DemoRow
        label="Toast · description / duration / action / closable"
        note="ToastProvider + ToastViewport riêng (không qua showToast()) — minh hoạ ghép thô 3 export"
        stacked
        width="narrow"
      >
        <DemoRawToast />
      </DemoRow>

      <DemoRow
        label="EmptyState · size"
        note="sm · md · lg — ô icon, chữ, khoảng cách lớn dần"
        stacked
      >
        <DemoGrid align="start" min="md">
          {EMPTY_STATE_SIZES.map((size) => (
            <Surface key={size} padding="sm">
              <EmptyState
                description="Thử bỏ bớt điều kiện lọc."
                icon="folder-bold"
                iconColor="sky"
                size={size}
                title={`size="${size}"`}
              />
            </Surface>
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow label="EmptyState · iconColor" stacked>
        <DemoGrid min="xs">
          {EMPTY_STATE_ICON_COLORS.map((iconColor) => (
            <Surface key={iconColor} padding="sm">
              <EmptyState icon="star-bold" iconColor={iconColor} title={iconColor} />
            </Surface>
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow label="EmptyState · illustration / action" stacked>
        <DemoGrid min="lg">
          <Surface padding="md">
            <EmptyState
              action={<Button size="sm">Thêm dự án</Button>}
              description="Tạo dự án đầu tiên để bắt đầu theo dõi tiến độ."
              icon="folder-bold"
              iconColor="sky"
              title="Chưa có dự án nào"
            />
          </Surface>
          <Surface padding="md">
            <EmptyState
              description="Thử bỏ bớt điều kiện lọc."
              illustration={<TableEmptyIllustration accentColor="sky" />}
              title="Không có dòng nào khớp bộ lọc"
            />
          </Surface>
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="TableEmptyIllustration · accentColor"
        note="khung / lưới theo token, chỉ 3 chấm đổi màu"
      >
        {ILLUSTRATION_ACCENTS.map((accentColor) => (
          <div key={accentColor} className="flex flex-col items-center gap-1">
            <TableEmptyIllustration accentColor={accentColor} height={54} width={72} />
            <Text className="font-mono" size="extraTiny" skin="muted">
              {accentColor}
            </Text>
          </div>
        ))}
      </DemoRow>
    </DemoSection>
  );
});

export default FeedbackSection;
