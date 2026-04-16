import { useClerk, useUser } from "@clerk/expo";
import {styled} from "nativewind";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView)

const Settings = () => {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#ea7a53" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="gap-5 pt-6">
        <View className="rounded-[28px] border border-border bg-card p-5">
          <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
          <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
            Manage your account details and session security.
          </Text>
        </View>

        <View className="rounded-[28px] border border-border bg-card p-5">
          <Text className="text-sm font-sans-semibold text-muted-foreground">
            Signed in as
          </Text>
          <Text className="mt-2 text-2xl font-sans-bold text-primary">
            {user?.fullName || user?.username || "Recurrly user"}
          </Text>
          <Text className="mt-1 text-base font-sans-medium text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress || "No email found"}
          </Text>
        </View>

        <Pressable className="auth-button" onPress={() => signOut()}>
          <Text className="auth-button-text">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
