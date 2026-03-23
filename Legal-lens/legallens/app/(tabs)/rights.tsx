import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RIGHTS_DATA = [
  {
    category: 'Police Detention',
    color: '#E24B4A',
    icon: 'shield-outline',
    rights: [
      {
        title: 'Right to Know Grounds of Arrest',
        section: 'Section 50, CrPC 1973',
        description: 'Police must inform you of the reason for your arrest at the time of arrest.',
      },
      {
        title: 'Right to Meet a Lawyer',
        section: 'Section 41D, CrPC 1973',
        description: 'You have the right to consult your lawyer during police interrogation.',
      },
      {
        title: 'Right Against Detention Beyond 24 Hours',
        section: 'Section 57, CrPC 1973',
        description: 'Police cannot detain you for more than 24 hours without producing you before a magistrate.',
      },
      {
        title: 'Protection Against Arbitrary Arrest',
        section: 'Article 22, Constitution of India',
        description: 'You have constitutional protection against arbitrary detention and arrest.',
      },
    ],
  },
  {
    category: 'Domestic Violence',
    color: '#D95B1E',
    icon: 'home-outline',
    rights: [
      {
        title: 'Right to Protection Order',
        section: 'Section 18, PWDVA 2005',
        description: 'You can obtain a protection order from a magistrate against the abuser.',
      },
      {
        title: 'Right to Reside in Shared Household',
        section: 'Section 17, PWDVA 2005',
        description: 'You cannot be removed from the shared household regardless of ownership.',
      },
      {
        title: 'Right to File Complaint',
        section: 'Section 12, PWDVA 2005',
        description: 'You can approach any magistrate to file a domestic violence complaint.',
      },
      {
        title: 'Cruelty by Husband — Criminal Offense',
        section: 'Section 498A, IPC 1860',
        description: 'Cruelty by husband or relatives is a cognizable, non-bailable offence.',
      },
    ],
  },
  {
    category: 'Wrongful Eviction',
    color: '#BA7517',
    icon: 'key-outline',
    rights: [
      {
        title: 'Notice Period Required',
        section: 'Section 106, Transfer of Property Act 1882',
        description: 'Landlord must give 15 days notice for month-to-month and 6 months for annual leases.',
      },
      {
        title: 'Right Against Forcible Eviction',
        section: 'Section 441, IPC 1860',
        description: 'A landlord entering your property without consent is criminal trespass.',
      },
      {
        title: 'Right to Injunction',
        section: 'Section 38, Specific Relief Act 1963',
        description: 'You can get a court injunction preventing illegal eviction.',
      },
    ],
  },
  {
    category: 'Salary Theft',
    color: '#1A6BAD',
    icon: 'cash-outline',
    rights: [
      {
        title: 'Right to Timely Payment',
        section: 'Section 5, Payment of Wages Act 1936',
        description: 'Wages must be paid within 7 days of wage period end for establishments with under 1,000 workers.',
      },
      {
        title: 'Right to File Wage Claim',
        section: 'Section 15, Payment of Wages Act 1936',
        description: 'You can file a claim with the Payment of Wages Authority for unpaid wages.',
      },
      {
        title: 'Right to Minimum Wage',
        section: 'Section 12, Minimum Wages Act 1948',
        description: 'No employer can pay below the minimum wage fixed by the government.',
      },
    ],
  },
  {
    category: 'Consumer Fraud',
    color: '#7B3FB5',
    icon: 'bag-outline',
    rights: [
      {
        title: 'Right to File Consumer Complaint',
        section: 'Section 35, Consumer Protection Act 2019',
        description: 'You can file complaint in district commission for amounts up to ₹1 crore.',
      },
      {
        title: 'Right to Refund or Replacement',
        section: 'Section 38, Consumer Protection Act 2019',
        description: 'You are entitled to refund, repair, or replacement for deficient goods/services.',
      },
      {
        title: 'Protection Against Online Fraud',
        section: 'Section 66C, IT Act 2000',
        description: 'Identity theft and online financial fraud is punishable with imprisonment.',
      },
    ],
  },
];

export default function RightsScreen() {
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = async (category: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleShare = async (right: { title: string; section: string; description: string }) => {
    try {
      await Share.share({
        message: `*${right.title}*\n${right.section}\n\n${right.description}\n\n— Shared via LegalLens`,
      });
    } catch {}
  };

  const filtered = RIGHTS_DATA.map((cat) => ({
    ...cat,
    rights: cat.rights.filter(
      (r) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.section.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.rights.length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Know Your Rights</Text>
        <Text style={styles.subtitle}>Indian law protections — tap to expand</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search rights, sections..."
          placeholderTextColor={theme.colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search legal rights"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map((cat) => {
          const isExpanded = expandedCategory === cat.category;
          return (
            <View key={cat.category} style={styles.section}>
              <TouchableOpacity
                style={[styles.categoryHeader, { borderLeftColor: cat.color }]}
                onPress={() => toggleCategory(cat.category)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                accessibilityLabel={`${cat.category} rights, ${cat.rights.length} items`}
              >
                <View style={styles.categoryLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: cat.color + '20' }]}>
                    <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                  </View>
                  <Text style={styles.categoryName}>{cat.category}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={[styles.count, { color: cat.color }]}>{cat.rights.length}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              {isExpanded &&
                cat.rights.map((right, idx) => (
                  <View key={idx} style={styles.rightCard}>
                    <View style={styles.rightHeader}>
                      <Text style={styles.rightTitle}>{right.title}</Text>
                      <TouchableOpacity
                        onPress={() => handleShare(right)}
                        style={styles.shareBtn}
                        accessibilityLabel={`Share ${right.title}`}
                      >
                        <Ionicons name="share-outline" size={16} color={cat.color} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.rightDescription}>{right.description}</Text>
                    <View style={[styles.sectionPill, { borderColor: cat.color }]}>
                      <Text style={[styles.sectionPillText, { color: cat.color }]}>
                        {right.section}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.surface },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary },
  subtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: theme.colors.textPrimary },
  scroll: { paddingHorizontal: 16 },
  section: { marginBottom: 10 },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  categoryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary },
  categoryRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: { fontSize: 13, fontWeight: '700' },
  rightCard: {
    backgroundColor: '#FAFAF9',
    borderRadius: 10,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rightHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rightTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginRight: 8,
  },
  shareBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  rightDescription: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19, marginBottom: 8 },
  sectionPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  sectionPillText: { fontSize: 11, fontWeight: '600' },
});
