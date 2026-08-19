import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator } from "react-native";
import { useAuthStore } from "../../config/useauthstore";

export default function Layout() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isLoading && !isAuthenticated) {
    return (
      <ActivityIndicator
        size={"large"}
        color={"black"}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="chats"
        options={{
          headerShown: false,
          title: "CHATS",
          tabBarIcon: () => (
            <MaterialIcons name="wechat" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          headerShown: false,
          title: "USERS",
          tabBarIcon: () => (
            <FontAwesome6 name="user-group" size={24} color="black" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: () => (
            <SimpleLineIcons name="settings" size={24} color="black" />
          ),
        }}
      />
    </Tabs>
  );
}
