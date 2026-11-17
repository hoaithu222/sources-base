import { router } from 'expo-router';
import { View } from 'react-native';

import { AppBar } from '@/shared/ui/navigation';
import { Screen } from '@/shared/ui/screen';

import { ComponentsActionsSection } from '../components/ComponentsActionsSection';
import { ComponentsDisplaySection } from '../components/ComponentsDisplaySection';
import { ComponentsInputsSection } from '../components/ComponentsInputsSection';
import { ComponentsOverlaySection } from '../components/ComponentsOverlaySection';

/**
 * Danh mục component.
 *
 * ⚠️ `keyboardAware` BẬT vì trang có ô nhập: thiếu nó thì bàn phím che mất
 * chính ô đang gõ ở nửa dưới trang, và người thử kết luận là `Input` hỏng.
 */
export function DemoComponentsScreen() {
  return (
    <Screen header={<AppBar title="Component" onBack={router.back} />} keyboardAware>
      <View className="gap-xl py-xs">
        <ComponentsActionsSection />
        <ComponentsInputsSection />
        <ComponentsDisplaySection />
        <ComponentsOverlaySection />
      </View>
    </Screen>
  );
}
