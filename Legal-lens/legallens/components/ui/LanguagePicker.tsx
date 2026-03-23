import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { useUserStore } from '../../store/userStore';

const LANGUAGES = [
  { code: 'en', label: 'EN', fullName: 'English' },
  { code: 'ta', label: 'தமிழ்', fullName: 'Tamil' },
  { code: 'hi', label: 'हिंदी', fullName: 'Hindi' },
  { code: 'te', label: 'తెలుగు', fullName: 'Telugu' },
  { code: 'kn', label: 'ಕನ್ನಡ', fullName: 'Kannada' },
  { code: 'ml', label: 'മലയാളം', fullName: 'Malayalam' },
];

export const LanguagePicker: React.FC = () => {
  const { preferredLanguage, setLanguage } = useUserStore();

  const handleSelect = async (code: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(code);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      style={styles.container}
    >
      {LANGUAGES.map((lang) => {
        const isActive = preferredLanguage === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => handleSelect(lang.code)}
            accessibilityLabel={`Select ${lang.fullName} language`}
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {lang.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
});
