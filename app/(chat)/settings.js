import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingItem = ({ icon, title, description, value, onValueChange, type = 'toggle' }) => {
  return (
    <View style={styles.settingItem}>
      <MaterialIcons name={icon} size={24} color="#666" style={styles.settingIcon} />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      {type === 'toggle' ? (
        <Switch value={value} onValueChange={onValueChange} />
      ) : (
        <MaterialIcons name="chevron-right" size={24} color="#666" />
      )}
    </View>
  );
};

export default function ChatSettings() {
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    readReceipts: true,
    darkMode: false,
  });

  const updateSetting = (key) => (value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            description="Receive notifications for new messages"
            value={settings.notifications}
            onValueChange={updateSetting('notifications')}
          />
          <SettingItem
            icon="volume-up"
            title="Sound"
            description="Play sound for new messages"
            value={settings.soundEnabled}
            onValueChange={updateSetting('soundEnabled')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <SettingItem
            icon="done-all"
            title="Read Receipts"
            description="Let others know when you've read their messages"
            value={settings.readReceipts}
            onValueChange={updateSetting('readReceipts')}
          />
          <SettingItem
            icon="block"
            title="Blocked Users"
            description="Manage your blocked contacts"
            type="link"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <SettingItem
            icon="dark-mode"
            title="Dark Mode"
            description="Switch to dark theme"
            value={settings.darkMode}
            onValueChange={updateSetting('darkMode')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat Settings</Text>
          <SettingItem
            icon="wallpaper"
            title="Chat Wallpaper"
            description="Change chat background"
            type="link"
          />
          <SettingItem
            icon="font-download"
            title="Font Size"
            description="Adjust message font size"
            type="link"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data and Storage</Text>
          <SettingItem
            icon="storage"
            title="Storage Usage"
            description="Manage storage and downloads"
            type="link"
          />
          <SettingItem
            icon="cleaning-services"
            title="Clear Chat History"
            description="Delete all messages"
            type="link"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#000',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});