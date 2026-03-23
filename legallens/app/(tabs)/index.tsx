import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import NetInfo from '@react-native-community/netinfo';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { LANGUAGES } from '../../constants/languages';
import { useUserStore } from '../../store/userStore';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { CrisisType } from '../../types/crisis';
import { isOfflineAvailable } from '../../services/offline';

const { width } = Dimensions.get('window');

const CRISIS_OPTIONS = [
  { id: CrisisType.POLICE_DETENTION, label: 'Police stopped me', icon: 'shield-outline', color: theme.colors.danger },
  { id: CrisisType.DOMESTIC_VIOLENCE, label: 'Threatened at home', icon: 'home-outline', color: '#F97316' },
  { id: CrisisType.EVICTION, label: 'Landlord evicting', icon: 'business-outline', color: theme.colors.warning },
  { id: CrisisType.SALARY_THEFT, label: 'Boss not paying', icon: 'cash-outline', color: '#3B82F6' },
  { id: CrisisType.CONSUMER_FRAUD, label: 'Bought fake product', icon: 'cart-outline', color: '#A855F7' },
  { id: 'SCAN', label: 'Scan a document', icon: 'camera-outline', color: theme.colors.textSecondary },
];

export default function PanicHomeScreen() {
  const router = useRouter();
  const { preferredLanguage, setPreferredLanguage, demoMode } = useUserStore();
  const [isOffline, setIsOffline] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState<Record<string, boolean>>({});
  
  const scale = useSharedValue(1);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected || !state.isInternetReachable);
    });

    const checkOffline = async () => {
      const status: Record<string, boolean> = {};
      for (const type of Object.values(CrisisType)) {
        status[type] = await isOfflineAvailable(type);
      }
      setOfflineStatus(status);
    };

    checkOffline();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePanicPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/crisis/voice');
  };

  const handleCrisisSelect = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (id === 'SCAN') {
      router.push('/scan');
    } else {
      router.push(`/crisis/${id}`);
    }
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        {demoMode && (
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerText}>DEMO MODE — For demonstration only</Text>
          </View>
        )}
        
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline" size={14} color="#856404" />
            <Text style={styles.offlineBannerText}>Offline — showing cached rights</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>LegalLens</Text>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Language Selector */}
        <View style={styles.langContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langScroll}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setPreferredLanguage(lang.code)}
                style={[
                  styles.langPill,
                  preferredLanguage === lang.code && styles.langPillActive
                ]}
              >
                <Text style={[
                  styles.langText,
                  preferredLanguage === lang.code && styles.langTextActive
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Panic Button */}
        <View style={styles.panicContainer}>
          <Animated.View style={[styles.panicCircle, animatedStyle]}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handlePanicPress}
              style={styles.panicButton}
            >
              <Text style={styles.panicText}>TAP & SPEAK{"\n"}YOUR CRISIS</Text>
              <Ionicons name="mic" size={32} color="white" style={styles.micIcon} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Grid Section */}
        <View style={styles.gridSection}>
          <Text style={styles.sectionLabel}>OR choose your situation:</Text>
          <View style={styles.grid}>
            {CRISIS_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleCrisisSelect(item.id)}
                style={styles.gridCard}
              >
                <Ionicons name={item.icon as any} size={28} color={item.color} />
                <Text style={styles.cardLabel}>{item.label}</Text>
                {offlineStatus[item.id] && (
                  <View style={styles.offlineDot} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your conversation is private. Nothing is stored without permission.
          </Text>
        </View>
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
  offlineBanner: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEEBA',
  },
  offlineBannerText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '600',
  },
  offlineDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.safe,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  langContainer: {
    paddingVertical: theme.spacing.sm,
  },
  langScroll: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  langPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  langPillActive: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
  },
  langText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  langTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  panicContainer: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panicCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.danger,
    elevation: 8,
    shadowColor: theme.colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  panicButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  panicText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  micIcon: {
    marginTop: 10,
  },
  gridSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: (width - 48 - 12) / 2,
    height: 100,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardLabel: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
