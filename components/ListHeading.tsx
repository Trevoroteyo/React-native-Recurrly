import { Text, TouchableOpacity, View } from "react-native";

const ListingHeading = ({title}: ListHeadingProps) => {
    return (
        <View className="list-head">
            <Text className="list-title">{title}</Text>
            <TouchableOpacity>
                <Text className="list-action">View All</Text>
            </TouchableOpacity>
        </View>
    )
}
export default ListingHeading;