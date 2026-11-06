import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../config/useauthstore";
import { apptheme } from "../../utilities/appcolors";
import {
    acceptFriendRequest,
    cancelFriendRequest,
    getAllUsers,
    getFriendRequests,
    sendFriendRequest,
} from "../../utilities/messageUtils";

const UserItem = ({ user, status, onPress, onAction }) => (
  <View style={styles.userItem}>
    <TouchableOpacity
      style={styles.userMain}
      onPress={onPress}
      disabled={status !== "accepted"}
    >
      <View style={styles.avatarContainer}>
        {user.profilePicture ? (
          <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user.username
                ? user.username.charAt(0).toUpperCase()
                : user.email.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.name}>{user.username || "No username"}</Text>
        <Text style={styles.username}>{user.email}</Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.friendButton,
        status === "accepted" && styles.friendButtonAccepted,
      ]}
      onPress={onAction}
      disabled={status === "accepted"}
    >
      <Text style={styles.friendButtonText}>
        {status === "accepted"
          ? "Friends"
          : status === "pending-sent"
            ? "Requested"
            : status === "pending-received"
              ? "Accept"
              : "Add friend"}
      </Text>
    </TouchableOpacity>
  </View>
);

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [allUsers, friendRequests] = await Promise.all([
        getAllUsers(),
        getFriendRequests(currentUser?.uid),
      ]);

      // Filter out the current user
      const filteredUsers = allUsers.filter((u) => u.id !== currentUser?.uid);
      setUsers(filteredUsers);
      setRequests(friendRequests);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers =
    searchQuery.trim() === ""
      ? users
      : users.filter(
          (user) =>
            (user.username &&
              user.username
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            (user.email &&
              user.email.toLowerCase().includes(searchQuery.toLowerCase())),
        );

  const handleUserPress = (selectedUser) => {
    if (getFriendStatus(selectedUser.id) !== "accepted") return;
    router.push({
      pathname: `/(chat)/[id]`,
      params: {
        id: selectedUser.id,
        username: selectedUser.username || selectedUser.email,
      },
    });
  };

  const getFriendStatus = (userId) => {
    const request = requests.find(
      (item) => item.senderId === userId || item.recipientId === userId,
    );
    if (!request) return "none";
    if (request.status === "accepted") return "accepted";
    return request.senderId === currentUser?.uid
      ? "pending-sent"
      : "pending-received";
  };

  const handleFriendAction = async (selectedUser) => {
    const status = getFriendStatus(selectedUser.id);
    try {
      if (status === "pending-received") {
        const request = requests.find(
          (item) => item.senderId === selectedUser.id,
        );
        await acceptFriendRequest(request.id, currentUser.uid);
      } else if (status === "pending-sent") {
        const request = requests.find(
          (item) => item.recipientId === selectedUser.id,
        );
        Alert.alert("Cancel friend request?", "This request will be removed.", [
          { text: "Keep", style: "cancel" },
          {
            text: "Cancel request",
            style: "destructive",
            onPress: async () => {
              try {
                await cancelFriendRequest(request.id, currentUser.uid);
                await fetchUsers();
              } catch (error) {
                console.error("Error cancelling friend request:", error);
                Alert.alert("Error", "Could not cancel friend request");
              }
            },
          },
        ]);
        return;
      } else if (status === "none") {
        await sendFriendRequest(currentUser.uid, selectedUser.id);
      }
      await fetchUsers();
    } catch (error) {
      console.error("Error updating friend request:", error);
      Alert.alert("Error", error.message || "Could not update friend request");
    }
  };

  const incomingRequests = requests.filter(
    (request) =>
      request.recipientId === currentUser?.uid && request.status === "pending",
  );

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={24}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by username or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserItem
              user={item}
              status={getFriendStatus(item.id)}
              onPress={() => handleUserPress(item)}
              onAction={() => handleFriendAction(item)}
            />
          )}
          ListHeaderComponent={
            incomingRequests.length > 0 ? (
              <View style={styles.requestsHeader}>
                <Text style={styles.requestsTitle}>Friend requests</Text>
                {incomingRequests.map((request) => {
                  const requester = users.find(
                    (user) => user.id === request.senderId,
                  );
                  if (!requester) return null;
                  return (
                    <UserItem
                      key={request.id}
                      user={requester}
                      status="pending-received"
                      onPress={() => {}}
                      onAction={() => handleFriendAction(requester)}
                    />
                  );
                })}
              </View>
            ) : null
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.trim() === ""
                  ? "Type to search users..."
                  : "No users found"}
              </Text>
            </View>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: apptheme.pink,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  userItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  userMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  friendButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 8,
  },
  friendButtonAccepted: {
    backgroundColor: "#72B886",
  },
  friendButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  requestsHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  requestsTitle: {
    color: "#6a0404",
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 66,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
