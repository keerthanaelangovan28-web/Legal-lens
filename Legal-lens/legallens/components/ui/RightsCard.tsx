import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { LegalRight } from '../../types/crisis';

interface RightsCardProps {
  right: LegalRight;
  index: number;
  crisisColor?: string;
}

export const RightsCard: React.FC<RightsCardProps> = ({
  right,
  index,
  crisisColor = theme.colors.danger,
}) => {
  return (
    <View style={styles.card} accessibilityRole="text">
      <View style={styles.row}>
        {/* Number circle */}
        <View style={[styles.numberCircle, { backgroundColor: crisisColor }]}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {right.description}
        </Text>
      </View>
      {/* Law citation pill */}
      <View style={[styles.citationPill, { borderColor: crisisColor }]}>
        <Text style={[styles.citationText, { color: crisisColor }]}>
          Section {right.sectionNumber} · {right.actName} {right.actYear}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
    marginTop: 1,
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },
  citationPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
    marginLeft: 40,
  },
  citationText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
