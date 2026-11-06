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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../config/firebase.config";
import { useAuthStore } from "../../config/useauthstore";
import { apptheme } from "../../utilities/appcolors";
import { getUserChats, updateUserProfile } from "../../utilities/messageUtils";
import {
  connectSpotify,
  disconnectSpotify,
  syncCurrentlyPlaying,
} from "../../utilities/spotifyUtils";

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
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: "",
    bio: "",
    location: "",
  });
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        username: currentUser.username || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.uid || !currentUser?.spotifyConnected) return;

    const syncTrack = async () => {
      try {
        const currentTrack = await syncCurrentlyPlaying(currentUser.uid);
        setUser({ ...currentUser, currentTrack });
      } catch (error) {
        console.error("Error syncing Spotify track:", error);
      }
    };

    syncTrack();
    const interval = setInterval(syncTrack, 30000);

    return () => clearInterval(interval);
  }, [currentUser?.uid, currentUser?.spotifyConnected]);

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

  const handleSaveProfile = async () => {
    const username = profileForm.username.trim();
    if (!username) {
      Alert.alert("Missing username", "Please enter a username.");
      return;
    }

    if (!currentUser?.uid) {
      Alert.alert("Error", "User session not found. Please log in again.");
      return;
    }

    const updatedProfile = {
      username,
      bio: profileForm.bio.trim(),
      location: profileForm.location.trim(),
    };

    try {
      setSavingProfile(true);
      await updateUserProfile(currentUser.uid, updatedProfile);
      setUser({ ...currentUser, ...updatedProfile });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSpotifyConnect = async () => {
    try {
      setSpotifyLoading(true);
      await connectSpotify();
      await updateUserProfile(currentUser.uid, { spotifyConnected: true });
      const currentTrack = await syncCurrentlyPlaying(currentUser.uid);
      setUser({ ...currentUser, spotifyConnected: true, currentTrack });
      
      Alert.alert(
        "Spotify connected",
        "Your current track will now be visible.",
        // [{text:"Okay",onPress:() => router.reload("/(tabs)/profile")}]
      );
    } catch (error) {
      console.error("Error connecting Spotify:", error);
      Alert.alert(
        "Spotify error",
        error.message || "Could not connect Spotify",
      );
    } finally {
      setSpotifyLoading(false);
    }
  };

  const handleSpotifyDisconnect = async () => {
    try {
      setSpotifyLoading(true);
      await disconnectSpotify(currentUser.uid);
      setUser({ ...currentUser, spotifyConnected: false, currentTrack: null });
    } catch {
      Alert.alert("Spotify error", "Could not disconnect Spotify");
    } finally {
      setSpotifyLoading(false);
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
            {isEditing ? (
              <View style={styles.profileForm}>
                <TextInput
                  value={profileForm.username}
                  onChangeText={(username) =>
                    setProfileForm((form) => ({ ...form, username }))
                  }
                  placeholder="Username"
                  style={styles.profileInput}
                  autoCapitalize="none"
                  maxLength={36}
                />
                <TextInput
                  value={profileForm.bio}
                  onChangeText={(bio) =>
                    setProfileForm((form) => ({ ...form, bio }))
                  }
                  placeholder="Bio"
                  style={[styles.profileInput, styles.bioInput]}
                  multiline
                  maxLength={160}
                />
                <TextInput
                  value={profileForm.location}
                  onChangeText={(location) =>
                    setProfileForm((form) => ({ ...form, location }))
                  }
                  placeholder="Location"
                  style={styles.profileInput}
                  maxLength={80}
                />
                <View style={styles.profileActions}>
                  <TouchableOpacity
                    onPress={() => setIsEditing(false)}
                    style={styles.cancelButton}
                    disabled={savingProfile}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveProfile}
                    style={styles.saveButton}
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.username}>
                  {currentUser?.username || "Add a username"}
                </Text>
                <Text style={styles.bio}>
                  {currentUser?.bio || "Add a bio"}
                </Text>
                <View style={styles.locationContainer}>
                  <MaterialIcons name="location-on" size={16} color="#666" />
                  <Text style={styles.location}>
                    {currentUser?.location || "Add a location"}
                  </Text>
                </View>
              </>
            )}
            {!isEditing && (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.editProfileButton}
              >
                <MaterialIcons name="edit" size={18} color="#fff" />
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
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
            <View style={styles.spotifySection}>
              <View style={styles.spotifyTitleRow}>
                <MaterialIcons name="music-note" size={24} color="#1DB954" />
                <Text style={styles.spotifyTitle}>Spotify</Text>
              </View>
              {currentUser.spotifyConnected && currentUser.currentTrack ? (
                <View style={styles.trackRow}>
                  {currentUser.currentTrack.imageUrl ? (
                    <Image
                      source={{ uri: currentUser.currentTrack.imageUrl }}
                      style={styles.trackImage}
                    />
                  ) : null}
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackName} numberOfLines={1}>
                      {currentUser.currentTrack.name}
                    </Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                      {currentUser.currentTrack.artist}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.spotifyStatus}>
                  {currentUser.spotifyConnected
                    ? "Nothing playing right now"
                    : "Show friends what you are listening to"}
                </Text>
              )}
              <TouchableOpacity
                onPress={
                  currentUser.spotifyConnected
                    ? handleSpotifyDisconnect
                    : handleSpotifyConnect
                }
                style={styles.spotifyButton}
                disabled={spotifyLoading}
              >
                {spotifyLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.spotifyButtonText}>
                    {currentUser.spotifyConnected
                      ? "Disconnect Spotify"
                      : "Connect Spotify"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
  profileForm: {
    width: "100%",
    alignItems: "center",
  },
  profileInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    fontSize: 15,
    color: "#000",
  },
  bioInput: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  profileActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: apptheme.navy,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: apptheme.navy,
    fontWeight: "600",
  },
  saveButton: {
    minWidth: 76,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: apptheme.navy,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: apptheme.navy,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 14,
  },
  editProfileText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  spotifySection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  spotifyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  spotifyTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  spotifyStatus: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  trackImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 10,
  },
  trackName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  trackArtist: {
    marginTop: 3,
    fontSize: 13,
    color: "#666",
  },
  spotifyButton: {
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#1DB954",
    paddingVertical: 10,
    marginTop: 12,
  },
  spotifyButtonText: {
    color: "#fff",
    fontWeight: "600",
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
