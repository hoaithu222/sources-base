import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { PATHS } from '@/shell/config';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { useForgotPassword } from '@/features/auth/hooks/usePasswordRecovery';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas/auth.schemas';
import { useZodForm } from '@/shared/form/useZodForm';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/input';

export function ForgotPasswordScreen() {
  const { errorMessage, isPending, isSuccess, requestReset } = useForgotPassword();
  const form = useZodForm(forgotPasswordSchema, { defaultValues: { email: '' } });

  const submit = form.handleSubmit((values) => requestReset(values));

  return (
    <AuthScreenLayout
      subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu."
      title="Quên mật khẩu"
    >
      <View className="gap-md">
        <FormInput<ForgotPasswordFormValues>
          autoCapitalize="none"
          autoComplete="email"
          control={form.control}
          keyboardType="email-address"
          label="Email"
          name="email"
          placeholder="ban@congty.vn"
          returnKeyType="send"
          textContentType="emailAddress"
          onSubmitEditing={submit}
        />

        {errorMessage ? <Alert description={errorMessage} tone="error" /> : null}

        <Button fullWidth label="Gửi hướng dẫn" loading={isPending} onPress={submit} />

        {/* Sau khi gửi, mở lối sang màn nhập mã. Người dùng nhận mã trong e-mail
            rồi quay lại app — không có deep link thì đây là đường duy nhất. */}
        {isSuccess ? (
          <Link asChild href={PATHS.RESET_PASSWORD}>
            <Text className="text-center text-link-md font-semibold text-link">
              Đã có mã? Nhập mã đặt lại mật khẩu
            </Text>
          </Link>
        ) : null}

        <Link asChild href={PATHS.LOGIN}>
          <Text className="text-center text-body-md text-fg-3">Quay lại đăng nhập</Text>
        </Link>
      </View>
    </AuthScreenLayout>
  );
}
