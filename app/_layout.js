import { Stack } from "expo-router";
import { useState } from "react";
import VideoSplashScreen from "../components/VideoSplashScreen";
import { AuthProvider, useAuth } from "../config/authcontext.config";

function Layout() {
  const { isloading } = useAuth();
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  // Show splash screen if video hasn't finished OR if auth is still loading
  if (!isSplashFinished || isloading) {
    return <VideoSplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          title: "tabs"
        }}
      />

      <Stack.Screen
        name="signin"
        options={{
          title: "signin",
          headerShown: false
        }} />


      <Stack.Screen
        name="signup"
        options={{
          title: "signup",
          headerShown: false
        }} />

      <Stack.Screen
        name="(chat)/[id]"
        options={{
          title: "chat id",
          headerShown: false
        }} />

    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  )
}
