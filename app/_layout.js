import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../config/authcontext.config";

SplashScreen.preventAutoHideAsync();

function Layout() {
  const { user, isloading } = useAuth();

  useEffect(() => {
    if (!isloading) {
      SplashScreen.hideAsync();
    }
  }, [isloading]);

  if (isloading) {
    return null; // Show splash screen while loading
  }

  return (
    <Stack
      screenOptions={{ animationEnabled: false ,headerShown: false}}
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
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}
