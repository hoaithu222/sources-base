import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { PATHS } from '@/shell/config';
import { AuthScreenLayout } from '@/features/auth/components/AuthScreenLayout';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth.schemas';
import { useZodForm } from '@/shared/form/useZodForm';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { FormInput } from '@/shared/ui/input';

export function LoginScreen() {
  const { errorMessage, isPending, login } = useLogin();
  const form = useZodForm(loginSchema, {
    defaultValues: { email: '', password: '' },
  });

  const submit = form.handleSubmit((values) => login(values));

  return (
    <AuthScreenLayout subtitle="Đăng nhập để tiếp tục" title="Chào mừng trở lại">
      <View className="gap-md">
        {/* ⛔ Không truyền `error` từ `formState`: `FormInput` tự lấy lỗi từ
            `fieldState` của chính trường đó. Bới `formState.errors` theo tên là
            chỗ rất dễ gõ sai tên trường, và khi sai thì lỗi "không hiện" một
            cách im lặng. */}
        <FormInput<LoginFormValues>
          autoCapitalize="none"
          autoComplete="email"
          control={form.control}
          keyboardType="email-address"
          label="Email"
          name="email"
          placeholder="ban@congty.vn"
          // Bàn phím hiện nút "Tiếp" thay vì "Xong" — người dùng biết còn ô nữa.
          returnKeyType="next"
          textContentType="emailAddress"
        />

        <FormInput<LoginFormValues>
          autoCapitalize="none"
          autoComplete="current-password"
          control={form.control}
          label="Mật khẩu"
          name="password"
          placeholder="••••••••"
          returnKeyType="done"
          secure
          textContentType="password"
          // Gửi form ngay từ bàn phím, không phải cụp bàn phím rồi mới bấm nút.
          onSubmitEditing={submit}
        />

        {/* Lỗi từ máy chủ (sai mật khẩu, tài khoản bị khoá) hiện Ở ĐÂY chứ không
            phải bằng toast: nó thuộc về form, và nó phải còn nguyên trên màn
            hình trong lúc người dùng sửa lại — toast tự tắt sau 5 giây. */}
        {errorMessage ? <Alert description={errorMessage} tone="error" /> : null}

        <Button fullWidth label="Đăng nhập" loading={isPending} onPress={submit} />

        <View className="items-center gap-sm">
          <Link asChild href={PATHS.FORGOT_PASSWORD}>
            <Text className="text-link-md font-semibold text-link">Quên mật khẩu?</Text>
          </Link>

          <View className="flex-row items-center gap-2xs">
            <Text className="text-body-md text-fg-3">Chưa có tài khoản?</Text>
            <Link asChild href={PATHS.REGISTER}>
              <Text className="text-link-md font-semibold text-link">Đăng ký</Text>
            </Link>
          </View>
        </View>
      </View>
    </AuthScreenLayout>
  );
}
