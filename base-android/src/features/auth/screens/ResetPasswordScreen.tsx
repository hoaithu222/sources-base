import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { PATHS } from '@/shell/config';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { useResetPassword } from '@/features/auth/hooks/usePasswordRecovery';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas/auth.schemas';
import { useZodForm } from '@/shared/form/useZodForm';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/input';

export function ResetPasswordScreen() {
  /**
   * Mã đặt lại có thể tới theo HAI đường, và cả hai đều phải chạy:
   *
   *  1. **Deep link** — người dùng bấm liên kết trong e-mail, hệ điều hành mở
   *     app tại `baseapp://reset-password?token=abc`. Expo Router đưa `token`
   *     vào đây. Đây là đường mượt nhất và nên là đường chính.
   *
   *  2. **Nhập tay** — người dùng đọc e-mail trên máy tính, hoặc deep link
   *     không hoạt động (app cài từ file APK, e-mail bị chuyển tiếp, ứng dụng
   *     mail mở liên kết trong trình duyệt nội bộ của nó). Lúc đó ô nhập mã là
   *     đường DUY NHẤT — bỏ nó đi là một phần người dùng bị kẹt hoàn toàn.
   */
  const params = useLocalSearchParams<{ token?: string }>();
  const { errorMessage, isPending, resetPassword } = useResetPassword();

  const form = useZodForm(resetPasswordSchema, {
    defaultValues: { token: params.token ?? '', password: '', confirmPassword: '' },
  });

  const submit = form.handleSubmit((values) => resetPassword(values));

  return (
    <AuthScreenLayout
      subtitle="Nhập mã trong e-mail và mật khẩu mới của bạn."
      title="Đặt lại mật khẩu"
    >
      <View className="gap-md">
        {/* Tới bằng deep link thì mã đã điền sẵn — ẩn ô đi cho đỡ rối, vì lúc
            đó nó chỉ là một chuỗi vô nghĩa với người dùng. */}
        {params.token ? null : (
          <FormInput<ResetPasswordFormValues>
            autoCapitalize="none"
            control={form.control}
            label="Mã đặt lại"
            name="token"
            placeholder="Dán mã từ e-mail"
            returnKeyType="next"
          />
        )}

        <FormInput<ResetPasswordFormValues>
          autoCapitalize="none"
          autoComplete="new-password"
          control={form.control}
          label="Mật khẩu mới"
          name="password"
          placeholder="Tối thiểu 8 ký tự"
          returnKeyType="next"
          secure
          textContentType="newPassword"
        />

        <FormInput<ResetPasswordFormValues>
          autoCapitalize="none"
          autoComplete="new-password"
          control={form.control}
          label="Nhập lại mật khẩu mới"
          name="confirmPassword"
          returnKeyType="done"
          secure
          textContentType="newPassword"
          onSubmitEditing={submit}
        />

        {errorMessage ? <Alert description={errorMessage} tone="error" /> : null}

        <Button fullWidth label="Đổi mật khẩu" loading={isPending} onPress={submit} />

        <Link asChild href={PATHS.LOGIN}>
          <Text className="text-center text-body-md text-fg-3">Quay lại đăng nhập</Text>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}
