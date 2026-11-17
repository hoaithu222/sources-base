import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { PATHS } from '@/shell/config';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/auth.schemas';
import { useZodForm } from '@/shared/form/useZodForm';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/input';

export function RegisterScreen() {
  const { errorMessage, isPending, register } = useRegister();
  const form = useZodForm(registerSchema, {
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const submit = form.handleSubmit((values) => register(values));

  return (
    <AuthScreenLayout subtitle="Điền thông tin để bắt đầu" title="Tạo tài khoản">
      <View className="gap-md">
        <FormInput<RegisterFormValues>
          // `words` chứ không phải `none`: đây là TÊN NGƯỜI, viết hoa mỗi từ là
          // đúng quy ước tiếng Việt và đỡ cho người dùng vài lần bấm Shift.
          autoCapitalize="words"
          autoComplete="name"
          control={form.control}
          label="Họ và tên"
          name="name"
          placeholder="Nguyễn Văn A"
          required
          returnKeyType="next"
          textContentType="name"
        />

        <FormInput<RegisterFormValues>
          autoCapitalize="none"
          autoComplete="email"
          control={form.control}
          keyboardType="email-address"
          label="Email"
          name="email"
          placeholder="ban@congty.vn"
          required
          returnKeyType="next"
          textContentType="emailAddress"
        />

        <FormInput<RegisterFormValues>
          autoCapitalize="none"
          // `new-password` để trình quản lý mật khẩu GỢI Ý một mật khẩu mạnh
          // thay vì điền lại mật khẩu cũ.
          autoComplete="new-password"
          control={form.control}
          label="Mật khẩu"
          name="password"
          placeholder="Tối thiểu 8 ký tự"
          required
          returnKeyType="next"
          secure
          textContentType="newPassword"
        />

        <FormInput<RegisterFormValues>
          autoCapitalize="none"
          autoComplete="new-password"
          control={form.control}
          label="Nhập lại mật khẩu"
          name="confirmPassword"
          required
          returnKeyType="done"
          secure
          textContentType="newPassword"
          onSubmitEditing={submit}
        />

        {errorMessage ? <Alert description={errorMessage} tone="error" /> : null}

        <Button fullWidth label="Đăng ký" loading={isPending} onPress={submit} />

        <View className="flex-row items-center justify-center gap-2xs">
          <Text className="text-body-md text-fg-3">Đã có tài khoản?</Text>
          <Link asChild href={PATHS.LOGIN}>
            <Text className="text-link-md font-semibold text-link">Đăng nhập</Text>
          </Link>
        </View>
      </View>
    </AuthScreenLayout>
  );
}
