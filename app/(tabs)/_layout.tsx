import AuthStateScreen from "@/components/auth/AuthStateScreen";
import { useAuth } from "@clerk/expo";
import { tabs } from "@/constants/data";
import cn from "clsx";
import { colors, components} from "@/constants/theme";
import { Redirect, Tabs } from "expo-router";
import { View , Image} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { TabIconProps } from "@/type";

const tabBar = components.tabBar;

const TabLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isLoaded) {
    return (
      <AuthStateScreen
        eyebrow="Secure access"
        title="Restoring your workspace"
        subtitle="We are confirming your account before opening your subscription dashboard."
      />
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  const TabIcon = ({ focused, icon }: TabIconProps) => {
    return (
        <View className="tabs-icon">
        <View className={cn("tabs-pill", focused && "tabs-active")}>
          <Image source={icon} resizeMode="contain" className="tabs-glyph" />
        </View>
      </View>
    );
  };

  return (
    <Tabs screenOptions={{ 
      headerShown: false ,
      tabBarShowLabel: false,
      tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation : 0,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle :{
          width : tabBar.iconFrame,
          height : tabBar.iconFrame,
          alignItems : "center",
        }
      }}>
      {tabs.map((tab) => (
        <Tabs.Screen
          name={tab.name}
          key={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
