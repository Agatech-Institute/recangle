import { useState } from "react";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "../config/useauthstore";
import { useRouter } from "expo-router";

export default function ResetScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const resetpassword = useAuthStore((state) => state.resetpassword);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handlePassReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "enter a valid email");
    }

    try {
      await resetpassword(email.trim());
      Alert.alert(
        "sucess",
        "password reset link sent ,check your email to continue",
        [{ text: "Okay", onPress: () => router.back() }],
      );
    } catch (error) {
      Alert.alert("Error", "Error reseting your password");
    }
  };
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <View>
          <TextInput
            placeholder="ENTER EMAIL"
            keyboardType="email-address"
            value={email}
            onChangeText={(value) => setEmail(value)}
            style={{ borderWidth: 1, borderRadius: 9, height: 49 }}
          />
          <TouchableOpacity
            onPress={handlePassReset}
            style={{ height: 40, backgroundColor: "blue" }}
          >
            {isLoading ? (
              <ActivityIndicator size={15} color={"red"} />
            ) : (
              <Text style={{ color: "white" }}>Reset</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
