import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { apptheme } from '../../utilities/appcolors';
import { getAllUsers } from '../../utilities/messageUtils';
import { useAuthStore } from '../../config/useauthstore';

const UserItem = ({ user, onPress }) => (
  <TouchableOpacity style={styles.userItem} onPress={onPress}>
    <View style={styles.avatarContainer}>
      {user.profilePicture ? (
        <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {user.username ? user.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
    </View>
    <View style={styles.userInfo}>
      <Text style={styles.name}>{user.username || 'No username'}</Text>
      <Text style={styles.username}>{user.email}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#666" />
  </TouchableOpacity>
);

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
const currentUser = useAuthStore((state) => state.user);


  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();

      // Filter out the current user
      const filteredUsers = allUsers.filter(u => u.id !== currentUser?.uid);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = searchQuery.trim() === '' ? users : users.filter(user =>
    (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUserPress = (selectedUser) => {
    // Navigate to chat with the user's ID
    router.push({
      pathname: `/(chat)/[id]`,
      params: {
        id: selectedUser.id,
        username: selectedUser.username || selectedUser.email
      }
    });
  };

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
          <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
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
            <UserItem user={item} onPress={() => handleUserPress(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.trim() === '' ? "Type to search users..." : "No users found"}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
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
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 66,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});