import { SplashScreen, Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase.config";
import { useEffect } from "react";
import { useAuthStore } from "../config/useauthstore";
import { View,ActivityIndicator } from "react-native";

// SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    // Start listening to Firebase auth changes when the app boots up
    initializeAuth();
  }, []);
  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{ animationEnabled: false, headerShown: false }}
      initialRouteName={user ? "(tabs)" : "index"}
    >
      {/* Auth screens */}
      <Stack.Screen
        name="index"
        options={{
          title: "signin",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: "signup",
          headerShown: false,
        }}
      />

      {/* App screens */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          title: "tabs",
        }}
      />
      <Stack.Screen
        name="(chat)/[id]"
        options={{
          title: "chat id",
          // headerShown: false,
          // presentation: "modal",
        }}
      />
      <Stack.Screen
        name="passwordreset"
        options={{
          title: "password reset",
        }}
      />
    </Stack>
  );
}

// export default function RootLayout() {
//   return (
//     <AuthProvider>
//       <Layout />
//     </AuthProvider>
//   );
// }
