import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';

interface ScriptedPhraseProps {
  phrase: string;
  language?: string;
}

export const ScriptedPhrase: React.FC<ScriptedPhraseProps> = ({
  phrase,
  language = 'en',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Clipboard.setString(phrase);
    Alert.alert('Copied!', 'Phrase copied to clipboard.');
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSpeaking(true);
    Speech.speak(phrase, {
      language: language,
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>SAY EXACTLY THIS:</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={handleSpeak}
            style={styles.iconBtn}
            accessibilityLabel={isSpeaking ? 'Stop reading aloud' : 'Read aloud'}
          >
            <Ionicons
              name={isSpeaking ? 'stop-circle' : 'volume-high'}
              size={20}
              color={theme.colors.warning}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCopy}
            style={styles.iconBtn}
            accessibilityLabel="Copy phrase to clipboard"
          >
            <Ionicons name="copy" size={20} color={theme.colors.warning} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.phrase}>{phrase}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3DB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
    marginVertical: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(186,117,23,0.1)',
  },
  phrase: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    lineHeight: 24,
  },
});
