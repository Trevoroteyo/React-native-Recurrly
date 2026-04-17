import { useUser } from "@clerk/expo";
import ListingHeading from "@/components/ListHeading";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import SubscriptionsCard from "@/components/SubscriptionsCard";
import UpcomingSubscriptionsCard from "@/components/UpcomingSusbcriptionsCard";
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { useSubscriptions } from "@/lib/subscriptions";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const { subscriptions, addSubscription } = useSubscriptions();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const trimmedFirstName = user?.firstName?.trim();

  const displayName =
    trimmedFirstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "there";

  const handleCreateSubscription = (subscription: Subscription) => {
    addSubscription(subscription);
    setExpandedSubscriptionId(subscription.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View>
        <FlatList
          ListHeaderComponent={() => (
            <>
              <View className="home-header">
                <View className="home-user">
                  <Image source={images.avatar} className="home-avatar" />
                  <Text className="home-user-name">{displayName}</Text>
                </View>

                <Pressable onPress={() => setIsCreateModalVisible(true)}>
                  <Image source={icons.add} className="home-add-icon" />
                </Pressable>
              </View>

              <View className="home-balance-card">
                <Text className="home-balance-label">Balance</Text>
                <View className="home-balance-row">
                  <Text className="home-balance-amount">
                    {formatCurrency(HOME_BALANCE.amount)}
                  </Text>
                  <Text className="home-balance-date">
                    {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                  </Text>
                </View>
              </View>

              <View className="mb-5">
                <ListingHeading title="Upcoming" />

                <FlatList
                  data={UPCOMING_SUBSCRIPTIONS}
                  renderItem={({ item }) => (
                    <UpcomingSubscriptionsCard {...item} />
                  )}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text className="home-empty">
                      No upcoming subscriptions
                    </Text>
                  }
                />
              </View>

              <ListingHeading title="All Subscriptions" />
            </>
          )}
          data={subscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionsCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() =>
                setExpandedSubscriptionId((currentId) =>
                  currentId === item.id ? null : item.id,
                )
              }
            />
          )}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="home-empty">No subscriptions yet.</Text>
          }
          contentContainerClassName="pb-20"
        />

        <CreateSubscriptionModal
          visible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onCreate={handleCreateSubscription}
        />
      </View>
    </SafeAreaView>
  );
}
