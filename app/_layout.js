import { Stack,SplashScreen } from "expo-router";
import {  } from "expo-router";
import { useState } from "react";
import { AuthProvider, useAuth } from "../config/authcontext.config";

function Layout() {
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
        name="index"
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
