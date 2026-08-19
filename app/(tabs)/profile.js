import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../config/firebase.config";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../config/useauthstore";
import { apptheme } from "../../utilities/appcolors";
import { getUserChats, updateUserProfile } from "../../utilities/messageUtils";

const SettingItem = ({ icon, title, value }) => (
  <TouchableOpacity style={styles.settingItem}>
    <MaterialIcons name={icon} size={24} color="#666" />
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#666" />
  </TouchableOpacity>
);

export default function Profile() {
  const [connections, setConnections] = useState(0);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadImage = async (uri) => {
    const userId = currentUser?.uid || auth.currentUser?.uid;
    if (!currentUser?.uid) {
      Alert.alert("Error", "User session not found. Please log in again.");
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "upload.jpg",
      });
      formData.append("upload_preset", "ANGLEAPP");
      formData.append("cloud_name", "dc2wu6xw9");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dc2wu6xw9/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (data.secure_url) {
        await updateUserProfile(userId, {
          profilePicture: data.secure_url,
        });
        Alert.alert("Success", "Profile picture updated!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      const unsubscribe = getUserChats(currentUser.uid, (chats) => {
        setConnections(chats.length);
      });
      return () => unsubscribe();
    }
  }, [currentUser?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      Alert.alert("Logout Error", error.message || "Failed to log out");
    }
  };

  const formatDateJoined = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (!currentUser) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Text style={styles.logoutMessage}>You have been logged out.</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity onPress={pickImage} disabled={uploading}>
              {currentUser?.profilePicture ? (
                <Image
                  source={{ uri: currentUser?.profilePicture }}
                  style={styles.avatar}
                />
              ) : (
                <MaterialIcons
                  name="circle"
                  size={100}
                  color="#666"
                  style={styles.avatarPlaceholder}
                />
              )}
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            {/* <Text style={styles.name}>
              {user?.email?.split("@")[0] || "User"}
            </Text> */}
            <Text style={styles.username}>
              {currentUser?.username || "@username".toUpperCase()}
            </Text>
            <Text style={styles.bio}>
              Software Developer | Disc Jockey | Travel Enthusiast
            </Text>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={16} color="#666" />
              <Text style={styles.location}>Abuja, Nigeria</Text>
            </View>
          </View>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentUser?.messagesSent || 0}
              </Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{connections}</Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Joined</Text>
              <Text style={styles.statValue}>
                {formatDateJoined(currentUser?.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.settings}>
            <SettingItem icon="account-circle" title="Account Settings" />
            <SettingItem icon="notifications" title="Notifications" />
            <SettingItem icon="lock" title="Privacy" />
            <SettingItem icon="help" title="Help & Support" />
            <SettingItem icon="info" title="About" />
          </View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: apptheme.pink,
  },
  header: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    marginBottom: 16,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 16, // Match marginBottom of avatar
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  username: {
    fontSize: 36,
    color: "#666",
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    color: "#000",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#eee",
  },
  settings: {
    marginTop: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: "#000",
  },
  settingValue: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    color: apptheme.navy,
    marginLeft: 8,
    fontWeight: "500",
  },
});
