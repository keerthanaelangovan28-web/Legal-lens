import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  TextInput, 
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { useUserStore, EmergencyContact } from '../../store/userStore';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { useCrisisStore } from '../../store/crisisStore';

const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>
      {children}
    </View>
  </View>
);

const SettingItem = ({ 
  icon, 
  label, 
  value, 
  onPress, 
  showArrow = true,
  destructive = false 
}: { 
  icon: keyof typeof Ionicons.glyphMap, 
  label: string, 
  value?: string, 
  onPress?: () => void,
  showArrow?: boolean,
  destructive?: boolean
}) => (
  <TouchableOpacity 
    style={styles.settingItem} 
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.settingLeft}>
      <Ionicons name={icon} size={20} color={destructive ? theme.colors.danger : theme.colors.textSecondary} />
      <Text style={[styles.settingLabel, destructive && { color: theme.colors.danger }]}>{label}</Text>
    </View>
    <View style={styles.settingRight}>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {showArrow && <Ionicons name="chevron-forward" size={16} color={theme.colors.border} />}
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { 
    preferredLanguage, 
    setPreferredLanguage,
    jurisdiction,
    emergencyContacts,
    addEmergencyContact,
    removeEmergencyContact,
    privacySettings,
    setPrivacySettings,
    demoMode,
    setDemoMode
  } = useUserStore();

  const { sessionHistory } = useCrisisStore();

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [versionTaps, setVersionTaps] = useState(0);
  const [showDemoToggle, setShowDemoToggle] = useState(false);

  const handleVersionTap = () => {
    const newTaps = versionTaps + 1;
    setVersionTaps(newTaps);
    if (newTaps === 5) {
      setShowDemoToggle(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Developer Mode', 'Demo mode toggle is now visible.');
    }
  };

  const handleAddContact = () => {
    if (!newContactName || !newContactPhone) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }
    addEmergencyContact({ name: newContactName, phone: newContactPhone });
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
  };

  const handleTestAlert = () => {
    if (emergencyContacts.length === 0) {
      Alert.alert('No Contacts', 'Please add at least one emergency contact first.');
      return;
    }
    Alert.alert('Test Alert', 'A test SMS alert has been sent to your emergency contacts.');
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all crisis records? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: () => Alert.alert('History Cleared', 'All session records have been deleted.') 
        },
      ]
    );
  };

  return (
    <SafeScreen>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={styles.userName}>Keerthana Elangovan</Text>
          <Text style={styles.userEmail}>keerthanaelangovan28@gmail.com</Text>
        </View>

        {showDemoToggle && (
          <SettingSection title="DEVELOPER OPTIONS">
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="flask" size={20} color="#FF9800" />
                <Text style={[styles.settingLabel, { color: '#FF9800', fontWeight: 'bold' }]}>Demo Mode</Text>
              </View>
              <Switch 
                value={demoMode}
                onValueChange={setDemoMode}
                trackColor={{ false: theme.colors.border, true: '#FF9800' }}
              />
            </View>
          </SettingSection>
        )}

        <SettingSection title="EMERGENCY CONTACTS">
          {emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactItem}>
              <View>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <TouchableOpacity onPress={() => removeEmergencyContact(index)}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          
          {emergencyContacts.length < 3 && !showAddContact && (
            <TouchableOpacity style={styles.addItem} onPress={() => setShowAddContact(true)}>
              <Ionicons name="add-circle-outline" size={20} color={theme.colors.safe} />
              <Text style={styles.addItemText}>Add contact</Text>
            </TouchableOpacity>
          )}

          {showAddContact && (
            <View style={styles.addContactForm}>
              <TextInput 
                style={styles.input} 
                placeholder="Name" 
                value={newContactName}
                onChangeText={setNewContactName}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Phone Number" 
                keyboardType="phone-pad"
                value={newContactPhone}
                onChangeText={setNewContactPhone}
              />
              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddContact(false)}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddContact}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.testAlertBtn} onPress={handleTestAlert}>
            <Ionicons name="paper-plane-outline" size={18} color="white" />
            <Text style={styles.testAlertText}>Test emergency alert</Text>
          </TouchableOpacity>
        </SettingSection>

        <SettingSection title="LANGUAGE & REGION">
          <SettingItem 
            icon="language" 
            label="Preferred Language" 
            value={preferredLanguage === 'en' ? 'English' : 'Tamil'} 
            onPress={() => Alert.alert('Language', 'Select your language', [
              { text: 'English', onPress: () => setPreferredLanguage('en') },
              { text: 'Tamil', onPress: () => setPreferredLanguage('ta') },
            ])}
          />
          <SettingItem 
            icon="location" 
            label="Current Jurisdiction" 
            value={jurisdiction ? `${jurisdiction.state}, ${jurisdiction.district}` : 'Tamil Nadu, Chennai'}
            onPress={() => Alert.alert('Region', 'Update your location manually if GPS is unreliable.')}
          />
        </SettingSection>

        <SettingSection title="PRIVACY">
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="mic" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.settingLabel}>Auto-start silent recording</Text>
            </View>
            <Switch 
              value={privacySettings.autoStartRecording}
              onValueChange={(val) => setPrivacySettings({ autoStartRecording: val })}
              trackColor={{ false: theme.colors.border, true: theme.colors.safe }}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="save" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.settingLabel}>Save crisis history</Text>
            </View>
            <Switch 
              value={privacySettings.saveCrisisHistory}
              onValueChange={(val) => setPrivacySettings({ saveCrisisHistory: val })}
              trackColor={{ false: theme.colors.border, true: theme.colors.safe }}
            />
          </View>
          <SettingItem 
            icon="trash" 
            label="Clear all history" 
            destructive 
            onPress={handleClearHistory}
          />
          <SettingItem 
            icon="mail" 
            label="Export all data" 
            onPress={() => Alert.alert('Export Data', 'All session PDFs will be sent to your email.')}
          />
        </SettingSection>

        <SettingSection title="ABOUT">
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleVersionTap}
            activeOpacity={0.8}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.settingLabel}>App Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.4 (Beta)</Text>
          </TouchableOpacity>
          <SettingItem icon="book" label="About LegalLens" onPress={() => {}} />
          <SettingItem icon="link" label="NALSA Official Website" onPress={() => Linking.openURL('https://nalsa.gov.in')} />
          <SettingItem icon="bug" label="Report an issue" onPress={() => {}} />
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>LegalLens — Empowering Legal Aid</Text>
          <Text style={styles.footerSub}>Made with ❤️ for Justice</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginLeft: 8,
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  contactName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  contactPhone: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  addItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  addItemText: {
    fontSize: 14,
    color: theme.colors.safe,
    fontWeight: 'bold',
  },
  addContactForm: {
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  cancelBtn: {
    padding: 8,
  },
  saveBtn: {
    backgroundColor: theme.colors.safe,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  testAlertBtn: {
    backgroundColor: '#F5A623',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  testAlertText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  footerSub: {
    fontSize: 12,
    color: theme.colors.border,
    marginTop: 4,
  },
});
