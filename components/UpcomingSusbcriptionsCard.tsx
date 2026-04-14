import { formatCurrency } from "@/lib/utils";
import { Image, Text, View } from "react-native";

const UpcomingSubscriptionsCard = ({
  name,
  price,
  daysLeft,
  icon,
  currency,
}: UpcomingSubscriptionCardProps) => {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
      </View>
      <Text className="upcoming-price">{formatCurrency(price, currency)}</Text>
      <Text className="upcoming-meta" numberOfLines={1}>
        {daysLeft > 1
          ? `${daysLeft} days left`
          : daysLeft === 1
            ? "Last day"
            : "Due today"}
      </Text>

      <Text className="upcoming-name" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};

export default UpcomingSubscriptionsCard;
