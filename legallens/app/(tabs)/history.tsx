import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { useCrisisStore } from '../../store/crisisStore';
import { useUserStore } from '../../store/userStore';
import { CrisisSession, CrisisType } from '../../types/crisis';
import { exportSessionToPDF } from '../../services/pdf';
import { SafeScreen } from '../../components/layout/SafeScreen';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const getCrisisColor = (type: CrisisType) => {
  switch (type) {
    case CrisisType.POLICE_DETENTION: return theme.colors.danger;
    case CrisisType.DOMESTIC_VIOLENCE: return '#E91E63';
    case CrisisType.EVICTION: return '#FF9800';
    case CrisisType.SALARY_THEFT: return '#4CAF50';
    case CrisisType.CONSUMER_FRAUD: return '#2196F3';
    default: return theme.colors.textSecondary;
  }
};

const SessionItem = ({ session }: { session: CrisisSession }) => {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(session.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleLongPress = () => {
    Alert.alert(
      'Session Options',
      'What would you like to do with this record?',
      [
        { text: 'Export evidence PDF', onPress: () => exportSessionToPDF(session) },
        { text: 'Share with lawyer', onPress: () => console.log('Share with lawyer') },
        { text: 'Delete session', style: 'destructive', onPress: () => console.log('Delete session') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const shortDesc = session.voiceTranscript 
    ? session.voiceTranscript.split(' ').slice(0, 8).join(' ') + '...'
    : 'No transcript available';

  return (
    <TouchableOpacity 
      style={[styles.sessionCard, { borderLeftColor: getCrisisColor(session.detectedCrisis) }]}
      onPress={toggleExpand}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.sessionHeader}>
        <View>
          <Text style={styles.sessionTime}>{dateStr}, {timeStr}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.typeBadge, { backgroundColor: getCrisisColor(session.detectedCrisis) + '20' }]}>
              <Text style={[styles.typeBadgeText, { color: getCrisisColor(session.detectedCrisis) }]}>
                {session.detectedCrisis.replace('_', ' ')}
              </Text>
            </View>
            {session.audioRecordingUri && (
              <View style={styles.recordingIndicator}>
                <Ionicons name="mic" size={12} color={theme.colors.danger} />
                <Text style={styles.recordingText}>Has recording</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={theme.colors.textSecondary} 
        />
      </View>

      <Text style={styles.shortDesc}>{shortDesc}</Text>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Full Transcript</Text>
          <Text style={styles.fullTranscript}>{session.voiceTranscript}</Text>
          
          <Text style={styles.sectionTitle}>Rights Provided</Text>
          {session.response.rights.map((right, index) => (
            <View key={index} style={styles.rightItem}>
              <Text style={styles.rightHeader}>{right.actName} - Section {right.sectionNumber}</Text>
              <Text style={styles.rightDesc}>{right.description}</Text>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.exportBtn}
            onPress={() => exportSessionToPDF(session)}
          >
            <Ionicons name="document-text" size={18} color="white" />
            <Text style={styles.exportBtnText}>Export Evidence PDF</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function HistoryScreen() {
  const { sessionHistory } = useCrisisStore();
  const { demoMode } = useUserStore();

  return (
    <SafeScreen>
      <View style={styles.container}>
        {demoMode && (
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerText}>DEMO MODE — For demonstration only</Text>
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.title}>Evidence Timeline</Text>
          <Text style={styles.subtitle}>Long-press any record to export or share</Text>
        </View>

        {sessionHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark-outline" size={64} color={theme.colors.border} />
            <Text style={styles.emptyTitle}>No crisis sessions recorded yet.</Text>
            <Text style={styles.emptySubtitle}>Your crisis sessions will appear here. Everything is private.</Text>
          </View>
        ) : (
          <FlatList
            data={sessionHistory}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SessionItem session={item} />}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  demoBanner: {
    backgroundColor: '#FF9800',
    paddingVertical: 4,
    alignItems: 'center',
  },
  demoBannerText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordingText: {
    fontSize: 10,
    color: theme.colors.danger,
    fontWeight: '600',
  },
  shortDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  fullTranscript: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  rightItem: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  rightHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.danger,
    marginBottom: 4,
  },
  rightDesc: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  exportBtn: {
    backgroundColor: theme.colors.textPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  exportBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
