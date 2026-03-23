import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { useUserStore } from '../../store/userStore';
import { useCrisisStore } from '../../store/crisisStore';
import { useLocation } from '../../hooks/useLocation';
import { api } from '../../services/api';
import { Lawyer, CrisisType } from '../../types/crisis';
import { INDIAN_STATES } from '../../services/location';
import { DEMO_SCENARIOS } from '../../constants/demo_data';

export default function SOSScreen() {
  const { jurisdiction, setManual, isLoading: locLoading } = useLocation();
  const { activeCrisis } = useCrisisStore();
  const { demoMode } = useUserStore();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'active' | 'ended'>('idle');
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [timer, setTimer] = useState(0);
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    if (demoMode) {
      // Use demo lawyers
      const scenario = DEMO_SCENARIOS.find(s => s.id === 'police_detention');
      if (scenario) {
        setLawyers([scenario.lawyer]);
      }
      setLoading(false);
    } else if (jurisdiction) {
      fetchLawyers();
    }
  }, [jurisdiction, demoMode]);

  useEffect(() => {
    let interval: any;
    if (callStatus === 'active') {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const response = await api.get<Lawyer[]>('/lawyer/nearest', {
        params: {
          latitude: 0, 
          longitude: 0,
          crisis_type: activeCrisis || CrisisType.POLICE_DETENTION,
        },
      });
      setLawyers(response.data);
    } catch (error) {
      console.error('Failed to fetch lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (lawyer: Lawyer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      demoMode ? 'Simulated Call' : 'Confirm Call',
      `Call ${lawyer.name}? This is a free legal aid call.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: demoMode ? 'SIMULATE CALL' : 'CALL FREE', 
          onPress: () => startSOSCall(lawyer) 
        },
      ]
    );
  };

  const startSOSCall = async (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    setCallStatus('calling');
    
    if (demoMode) {
      // Simulate call pickup after 1.5 seconds
      setTimeout(() => {
        setCallStatus('active');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 1500);
      return;
    }

    try {
      await api.post('/lawyer/sos/call', {
        user_phone: '+919999999999', 
        user_name: 'Keerthana', 
        lawyer_phone: lawyer.phone,
        crisis_type: activeCrisis || 'Emergency',
        family_phone: '+918888888888', 
        location_url: 'https://maps.google.com/?q=12.9716,77.5946',
      });
      
      setTimeout(() => {
        setCallStatus('active');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate call. Please try the NALSA helpline.');
      setCallStatus('idle');
    }
  };

  const endCall = () => {
    setCallStatus('ended');
    setShowSurvey(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (locLoading || (loading && !jurisdiction)) {
    return (
      <SafeScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.safe} />
          <Text style={styles.loadingText}>Searching legal aid network...</Text>
        </View>
      </SafeScreen>
    );
  }

  if (!jurisdiction && !demoMode) {
    return (
      <SafeScreen>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Select Your State</Text>
          <Text style={styles.subHeader}>We need your location to find legal aid.</Text>
          <View style={styles.stateGrid}>
            {INDIAN_STATES.map((state) => (
              <TouchableOpacity 
                key={state} 
                style={styles.stateItem}
                onPress={() => setManual(state)}
              >
                <Text style={styles.stateText}>{state}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        {demoMode && (
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerText}>DEMO MODE — For demonstration only</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>Emergency Legal Aid</Text>
            <View style={styles.jurisdictionBadge}>
              <Ionicons name="location" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.jurisdictionText}>
                {demoMode ? 'Bengaluru, Karnataka' : `${jurisdiction?.district}, ${jurisdiction?.state}`}
              </Text>
            </View>
          </View>

          {lawyers.length > 0 ? (
            lawyers.map((lawyer) => (
              <View key={lawyer.id} style={styles.lawyerCard}>
                <View style={styles.lawyerHeader}>
                  <View style={[styles.avatar, { backgroundColor: getDistrictColor(lawyer.district) }]}>
                    <Text style={styles.avatarText}>{lawyer.name.split(' ').map(n => n[0]).join('')}</Text>
                  </View>
                  <View style={styles.lawyerInfo}>
                    <Text style={styles.lawyerName}>{lawyer.name}</Text>
                    <View style={styles.certifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color={theme.colors.safe} />
                      <Text style={styles.certifiedText}>NALSA Certified</Text>
                    </View>
                    <Text style={styles.lawyerDistrict}>{lawyer.district}</Text>
                    <Text style={styles.specialization}>{lawyer.crisis_specializations.join(', ')}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.callBtn} 
                    onPress={() => handleCall(lawyer)}
                    accessibilityLabel={`Call lawyer ${lawyer.name}`}
                  >
                    <Ionicons name="call" size={20} color="white" />
                    <Text style={styles.callBtnText}>{demoMode ? 'SIMULATE CALL' : 'CALL FREE'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.whatsappBtn} accessibilityLabel="Message on WhatsApp">
                    <Ionicons name="logo-whatsapp" size={24} color={theme.colors.safe} />
                    <Text style={styles.whatsappText}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No lawyers registered in your district yet. Calling NALSA 15100...</Text>
            </View>
          )}

          <View style={styles.fallbackSection}>
            <Text style={styles.fallbackHeader}>District Legal Services Authority</Text>
            <View style={styles.fallbackItem}>
              <Text style={styles.fallbackLabel}>{demoMode ? 'Bengaluru' : jurisdiction?.district} DLSA:</Text>
              <Text style={styles.fallbackValue}>+91 44 2534 2441</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.helplineBtn}
              accessibilityLabel="Call NALSA National Helpline 15100"
            >
              <View>
                <Text style={styles.helplineTitle}>NALSA National Helpline</Text>
                <Text style={styles.helplineNumber}>15100</Text>
              </View>
              <Ionicons name="call" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.whatsappHelpline} accessibilityLabel="Message WhatsApp legal aid">
              <Ionicons name="logo-whatsapp" size={20} color={theme.colors.safe} />
              <Text style={styles.whatsappHelplineText}>WhatsApp legal aid: +91 94444 33333</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Call Status Modal */}
      <Modal visible={callStatus !== 'idle'} animationType="slide">
        <View style={styles.callModal}>
          <View style={styles.callHeader}>
            <View style={styles.callAvatar}>
              <Text style={styles.callAvatarText}>{selectedLawyer?.name[0]}</Text>
            </View>
            <Text style={styles.callName}>{selectedLawyer?.name}</Text>
            <Text style={styles.callStatusText}>
              {callStatus === 'calling' ? 'Connecting...' : demoMode ? 'Simulated Active Call' : 'Active Call'}
            </Text>
            {callStatus === 'active' && (
              <Text style={styles.timer}>{formatTime(timer)}</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.endCallBtn} 
            onPress={endCall}
            accessibilityLabel="End call"
          >
            <Ionicons name="call" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Post-Call Survey Modal */}
      <Modal visible={showSurvey} transparent animationType="fade">
        <View style={styles.surveyOverlay}>
          <View style={styles.surveyCard}>
            <Text style={styles.surveyTitle}>Did you get help?</Text>
            <TouchableOpacity style={styles.surveyBtn} onPress={() => setShowSurvey(false)}>
              <Text style={styles.surveyBtnText}>Yes, I'm safe now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.surveyBtn} onPress={() => setShowSurvey(false)}>
              <Text style={styles.surveyBtnText}>No, I need more help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.surveyBtn, styles.surveyBtnCrisis]} onPress={() => setShowSurvey(false)}>
              <Text style={styles.surveyBtnTextCrisis}>Still in crisis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

const getDistrictColor = (district: string) => {
  const colors = ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#9013FE'];
  const index = district.length % colors.length;
  return colors[index];
};

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
  scrollContent: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  jurisdictionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jurisdictionText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  lawyerCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  lawyerHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  lawyerInfo: {
    flex: 1,
  },
  lawyerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  certifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  certifiedText: {
    fontSize: 12,
    color: theme.colors.safe,
    fontWeight: 'bold',
  },
  lawyerDistrict: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  specialization: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  callBtn: {
    flex: 2,
    backgroundColor: theme.colors.safe,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  callBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  whatsappBtn: {
    flex: 1,
    backgroundColor: 'white',
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.safe,
  },
  whatsappText: {
    color: theme.colors.safe,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    color: theme.colors.textSecondary,
  },
  fallbackSection: {
    marginTop: 32,
    padding: 20,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  fallbackHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  fallbackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fallbackLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  fallbackValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  helplineBtn: {
    backgroundColor: theme.colors.textPrimary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  helplineTitle: {
    color: 'white',
    fontSize: 12,
  },
  helplineNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  whatsappHelpline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  whatsappHelplineText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  stateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  stateItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stateText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  subHeader: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  callModal: {
    flex: 1,
    backgroundColor: theme.colors.textPrimary,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 100,
  },
  callHeader: {
    alignItems: 'center',
  },
  callAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  callAvatarText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  callName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  callStatusText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    marginBottom: 16,
  },
  timer: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'monospace',
  },
  endCallBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D0021B',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
  surveyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  surveyCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  surveyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  surveyBtn: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    marginBottom: 12,
    alignItems: 'center',
  },
  surveyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  surveyBtnCrisis: {
    backgroundColor: '#D0021B',
  },
  surveyBtnTextCrisis: {
    color: 'white',
    fontWeight: 'bold',
  },
});
