import AuthStateScreen from "@/components/auth/AuthStateScreen";
import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <AuthStateScreen
        eyebrow="Secure access"
        title="Preparing your session"
        subtitle="We are checking for an existing sign-in so we can send you to the right place."
      />
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
