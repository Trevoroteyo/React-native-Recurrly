
import { Link } from "expo-router";
import { View, Text } from "react-native";

const SignIn = () =>{
    return (
        <View>
            <Text>Sign In</Text>
            <Link href="/(auth)/sign-up">Create Account</Link>
        </View>
    )
}

export default SignIn;