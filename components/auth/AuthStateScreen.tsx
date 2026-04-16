import { PRIMARY_COLOR } from "@/constants/theme";
import { ActivityIndicator, Text, View } from "react-native";

type AuthStateScreenProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
};

export default function AuthStateScreen({
  eyebrow,
  title,
  subtitle,
}: AuthStateScreenProps) {
  return (
    <View className="auth-state-screen">
      <View className="auth-state-card">
        {eyebrow ? (
          <View className="auth-chip">
            <Text className="auth-chip-text">{eyebrow}</Text>
          </View>
        ) : null}
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text className="auth-state-title">{title}</Text>
        <Text className="auth-state-copy">{subtitle}</Text>
      </View>
    </View>
  );
}
