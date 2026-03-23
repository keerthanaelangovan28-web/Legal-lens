import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { CrisisType, LegalResponse } from '../../types/crisis';
import { useUserStore } from '../../store/userStore';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { demoMode } = useUserStore();
  
  const response: LegalResponse = params.data ? JSON.parse(params.data as string) : null;
  const mode = params.mode as 'online' | 'cache' | 'offline';
  const crisisType = params.type as CrisisType;

  useEffect(() => {
    if (response) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [response]);

  const handleShare = async () => {
    if (!response) return;
    await Share.share({
      message: `LegalLens Alert: I am in a crisis (${crisisType}). My rights: ${response.rights[0].description}. Script: ${response.scriptedPhrase}`,
    });
  };

  if (!response) {
    return (
      <SafeScreen>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.danger} />
          <Text style={styles.errorText}>Failed to load legal protections.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
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

        {/* Top Banner */}
        <View style={[styles.banner, { backgroundColor: theme.colors.danger }]}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerText}>{crisisType.replace('_', ' ')} Rights</Text>
            {mode === 'cache' && (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineText}>Offline response</Text>
              </View>
            )}
          </View>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{mode === 'online' ? 'High confidence' : 'Cached'}</Text>
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Rights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Your Rights Right Now</Text>
            {response.rights.map((right, index) => (
              <View key={index} style={styles.rightCard}>
                <View style={[styles.numberCircle, { backgroundColor: theme.colors.danger }]}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <View style={styles.rightInfo}>
                  <Text style={styles.rightDesc}>{right.description}</Text>
                  <View style={[styles.citationPill, { backgroundColor: theme.colors.danger + '20' }]}>
                    <Text style={[styles.citationText, { color: theme.colors.danger }]}>
                      {right.sectionNumber} · {right.actName} {right.actYear}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Scripted Phrase Section */}
          <View style={styles.scriptSection}>
            <View style={styles.scriptHeaderRow}>
              <Text style={styles.scriptLabel}>SAY EXACTLY THIS:</Text>
              <TouchableOpacity accessibilityLabel="Copy script to clipboard">
                <Ionicons name="copy-outline" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.scriptText}>{response.scriptedPhrase}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.primaryBtn}
              onPress={() => router.push('/sos')}
              accessibilityLabel="Call a free lawyer"
            >
              <Ionicons name="call" size={24} color="white" />
              <Text style={styles.primaryBtnText}>Call a free lawyer now</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryBtn} 
              onPress={handleShare}
              accessibilityLabel="Alert family"
            >
              <Ionicons name="mail-outline" size={24} color={theme.colors.textPrimary} />
              <Text style={styles.secondaryBtnText}>Alert my family</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  banner: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  offlineBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  offlineText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confidenceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  rightCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rightInfo: {
    flex: 1,
  },
  rightDesc: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 20,
  },
  citationPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  citationText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scriptSection: {
    backgroundColor: '#FEF3C7', // amber-100
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.warning + '40',
  },
  scriptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scriptLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  scriptText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: theme.colors.danger,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: theme.colors.card,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.textPrimary,
    borderRadius: 24,
  },
  backBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
