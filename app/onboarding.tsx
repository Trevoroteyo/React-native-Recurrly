import { Link } from "expo-router";
import { View, Text } from "react-native";

const Onboarding = () =>{
    return (
        <View>
            <Text>Onboarding</Text>
            <Link href="/">Go Back</Link>
        </View>
    )
}

export default Onboarding;