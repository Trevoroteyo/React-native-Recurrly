import SubscriptionsCard from "@/components/SubscriptionsCard";
import { useSubscriptions } from "@/lib/subscriptions";
import { styled } from "nativewind";
import { useDeferredValue, useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return subscriptions;
    }

    return subscriptions.filter((subscription) =>
      [
        subscription.name,
        subscription.category,
        subscription.plan,
        subscription.paymentMethod,
        subscription.status,
        subscription.billing,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery)),
    );
  }, [deferredSearchQuery, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        data={filteredSubscriptions}
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
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View className="subscriptions-header">
              <Text className="subscriptions-title">Subscriptions</Text>
              <Text className="subscriptions-copy">
                Search your current plans by name, category, billing, or
                payment method.
              </Text>
            </View>

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search subscriptions"
              placeholderTextColor="rgba(8, 17, 38, 0.45)"
              className="subscriptions-search"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />

            <Text className="subscriptions-result-count">
              {filteredSubscriptions.length} subscription
              {filteredSubscriptions.length === 1 ? "" : "s"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="subscriptions-empty-card">
            <Text className="subscriptions-empty-title">
              No subscriptions found
            </Text>
            <Text className="subscriptions-empty-copy">
              Try a different search term to find the subscription you are
              looking for.
            </Text>
          </View>
        }
        contentContainerClassName="pb-20"
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
