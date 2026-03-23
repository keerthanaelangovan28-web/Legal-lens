import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { CrisisType } from '../../types/crisis';

interface CrisisTypeBadgeProps {
  crisisType: string;
  size?: 'sm' | 'md';
}

const CRISIS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  POLICE_DETENTION: { label: 'Police Detention', color: '#E24B4A', bg: '#FDE8E8' },
  DOMESTIC_VIOLENCE: { label: 'Domestic Violence', color: '#D95B1E', bg: '#FDEEE5' },
  EVICTION: { label: 'Wrongful Eviction', color: '#BA7517', bg: '#FEF3DB' },
  SALARY_THEFT: { label: 'Salary Theft', color: '#1A6BAD', bg: '#E3F0FB' },
  CONSUMER_FRAUD: { label: 'Consumer Fraud', color: '#7B3FB5', bg: '#F2E8FD' },
  OTHER: { label: 'General Rights', color: '#5F5E5A', bg: '#EFEFEF' },
};

export const CrisisTypeBadge: React.FC<CrisisTypeBadgeProps> = ({
  crisisType,
  size = 'md',
}) => {
  const normalizedType = crisisType?.toUpperCase() || 'OTHER';
  const config = CRISIS_CONFIG[normalizedType] ?? CRISIS_CONFIG['OTHER'];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.color },
        isSmall && styles.badgeSm,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Crisis type: ${config.label}`}
    >
      <Text
        style={[
          styles.label,
          { color: config.color },
          isSmall && styles.labelSm,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

export const getCrisisColor = (crisisType: string): string => {
  const config = CRISIS_CONFIG[crisisType?.toUpperCase()] ?? CRISIS_CONFIG['OTHER'];
  return config.color;
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelSm: {
    fontSize: 11,
  },
});
