import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { useCrisisStore } from '../../store/crisisStore';

export default function CrisisInputScreen() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const { setRecording, setProcessing } = useCrisisStore();
  
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  
  const isVoiceMode = type === 'voice';

  // Waveform animation
  const bar1 = useSharedValue(10);
  const bar2 = useSharedValue(20);
  const bar3 = useSharedValue(15);
  const bar4 = useSharedValue(25);
  const bar5 = useSharedValue(10);

  useEffect(() => {
    if (isVoiceMode) {
      setRecording(true);
      const animate = (val: any, duration: number) => {
        val.value = withRepeat(withTiming(40, { duration }), -1, true);
      };
      animate(bar1, 400);
      animate(bar2, 600);
      animate(bar3, 500);
      animate(bar4, 700);
      animate(bar5, 450);

      // Simulate transcription and auto-stop
      setTimeout(() => setTranscript("The police are detaining me..."), 1500);
      setTimeout(() => {
        setRecording(false);
        setProcessing(true);
        setTimeout(() => router.push('/crisis/result'), 2000);
      }, 4500);
    }
  }, [isVoiceMode]);

  const handleSubmit = () => {
    setProcessing(true);
    setTimeout(() => router.push('/crisis/result'), 2000);
  };

  const renderWaveform = () => (
    <View style={styles.waveform}>
      {[bar1, bar2, bar3, bar4, bar5].map((bar, i) => (
        <View key={i}>
          <Animated.View 
            style={[styles.waveBar, useAnimatedStyle(() => ({ height: bar.value }))] } 
          />
        </View>
      ))}
    </View>
  );

  return (
    <SafeScreen>
      <View style={[styles.container, isVoiceMode && styles.darkOverlay]}>
        {isVoiceMode ? (
          <View style={styles.voiceContent}>
            <View style={styles.topSection}>
              <Text style={styles.listeningText}>Listening...</Text>
              <View style={styles.dots}>
                <ActivityIndicator size="small" color="white" />
              </View>
            </View>

            <View style={styles.centerSection}>
              {renderWaveform()}
            </View>

            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptText}>{transcript || "Speak now..."}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.manualContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{String(type).replace('_', ' ')}</Text>
            </View>

            <Text style={styles.instructionText}>Describe what's happening in a few words</Text>
            
            <TextInput
              style={styles.input}
              multiline
              placeholder="Type here..."
              placeholderTextColor={theme.colors.textSecondary}
              value={manualText}
              onChangeText={setManualText}
            />

            <View style={styles.manualActions}>
              <TouchableOpacity style={styles.voiceBtn}>
                <Ionicons name="mic" size={24} color={theme.colors.danger} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, !manualText && styles.disabledBtn]} 
                onPress={handleSubmit}
                disabled={!manualText}
              >
                <Text style={styles.submitBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.cancelLink} onPress={() => router.back()}>
          <Text style={styles.cancelText}>CANCEL — I'm safe</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  darkOverlay: {
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  voiceContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 40,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  listeningText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dots: {
    marginTop: 4,
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 60,
  },
  waveBar: {
    width: 6,
    backgroundColor: theme.colors.danger,
    borderRadius: 3,
  },
  transcriptContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 16,
  },
  transcriptText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  manualContent: {
    flex: 1,
    padding: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 20,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 20,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  manualActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  voiceBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  submitBtn: {
    flex: 1,
    height: 56,
    backgroundColor: theme.colors.danger,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelLink: {
    padding: 24,
    alignItems: 'center',
  },
  cancelText: {
    color: theme.colors.safe,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
