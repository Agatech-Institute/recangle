import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Alert,  ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../config/authcontext.config";
import { apptheme } from "../../utilities/appcolors";
import { getUserChats } from '../../utilities/messageUtils';

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

  const { user, logout } = useAuth()
  const [connections, setConnections] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = getUserChats(user.uid, (chats) => {
        setConnections(chats.length);
      });
      return () => unsubscribe();
    }
  }, [user?.uid]);

  const handleSignout = async () => {
    try {
      await logout()
    } catch (error) {
      Alert.alert("an error occued loging out", "might be network",error)

    }
  }

  const formatDateJoined = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
          <TouchableOpacity>
               <MaterialIcons name="person" size={200} color="#666" />
          </TouchableOpacity>
            <Text style={styles.name}>{user?.email?.split('@')[0] || 'User'}</Text>
            <Text style={styles.username}>{user?.username || '@username'}</Text>
            <Text style={styles.bio}>Software Developer | Disc Jockey | Travel Enthusiast</Text>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={16} color="#666" />
              <Text style={styles.location}>Abuja, Nigeria</Text>
            </View>
          </View>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.messagesSent || 0}</Text>
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
              <Text style={styles.statValue}>{formatDateJoined(user?.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.settings}>
            <SettingItem icon="account-circle" title="Account Settings" />
            <SettingItem icon="notifications" title="Notifications" />
            <SettingItem icon="lock" title="Privacy" />
            <SettingItem icon="help" title="Help & Support" />
            <SettingItem icon="info" title="About" />
          </View>

          <TouchableOpacity onPress={handleSignout} style={styles.logoutButton}>
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
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    color: '#000',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#eee',
  },
  settings: {
    marginTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#000',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    color: apptheme.navy,
    marginLeft: 8,
    fontWeight: '500',
  },
});