import cn from "clsx";
import type { ComponentProps } from "react";
import { Text, TextInput, View } from "react-native";

type AuthTextFieldProps = {
  label: string;
  error?: string;
  helper?: string;
} & ComponentProps<typeof TextInput>;

export default function AuthTextField({
  label,
  error,
  helper,
  ...props
}: AuthTextFieldProps) {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <TextInput
        placeholderTextColor="rgba(8, 17, 38, 0.45)"
        className={cn("auth-input", error && "auth-input-error")}
        {...props}
      />
      {error ? <Text className="auth-error">{error}</Text> : null}
      {!error && helper ? <Text className="auth-helper">{helper}</Text> : null}
    </View>
  );
}
