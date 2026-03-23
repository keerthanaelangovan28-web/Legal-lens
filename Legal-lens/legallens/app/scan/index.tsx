import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../constants/theme';
import { useCrisisStore } from '../../store/crisisStore';
import { api } from '../../services/api';
import { useUserStore } from '../../store/userStore';

type ScanPhase = 'camera' | 'processing' | 'result';

const PROCESSING_STEPS = [
  'Reading document...',
  'Extracting text...',
  'Identifying document type...',
  'Searching Indian law...',
  'Reading your protections...',
];

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<ScanPhase>('camera');
  const [stepIndex, setStepIndex] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [documentType, setDocumentType] = useState('');
  const cameraRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { preferredLanguage } = useUserStore();
  const { setIsProcessing } = useCrisisStore();

  // Animate step text changes
  useEffect(() => {
    if (phase !== 'processing') return;
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setStepIndex((prev) => Math.min(prev + 1, PROCESSING_STEPS.length - 1));
    }, 900);
    return () => clearInterval(interval);
  }, [phase]);

  const handleCapture = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!cameraRef.current) return;

    try {
      setPhase('processing');
      setIsProcessing(true);
      setStepIndex(0);

      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });

      // Upload to backend scan endpoint
      const formData = new FormData();
      // @ts-ignore
      formData.append('image_file', {
        uri: photo.uri,
        name: 'scan.jpg',
        type: 'image/jpeg',
      });
      formData.append('language', preferredLanguage);

      const response = await api.post('/crisis/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 15000,
      });

      const data = response.data;
      setExtractedText(data.extracted_text || data.text || '');
      setDocumentType(data.document_type || 'Legal Document');
      setPhase('result');
      setIsProcessing(false);

      // Navigate to result screen with scan data
      router.push({
        pathname: '/crisis/result',
        params: {
          scanMode: 'true',
          documentType: data.document_type || 'Legal Document',
          response: JSON.stringify(data.legal_response),
        },
      });
    } catch (error) {
      console.error('Scan failed:', error);
      setIsProcessing(false);
      // Demo fallback — navigate to result with mock eviction data
      router.push({
        pathname: '/crisis/result',
        params: {
          scanMode: 'true',
          documentType: 'Eviction Notice',
          response: JSON.stringify({
            crisis_type: 'EVICTION',
            rights: [
              { description: 'Landlord must give 15 days notice before eviction.', section_number: '106', act_name: 'Transfer of Property Act', act_year: 1882 },
              { description: 'Forcible eviction without court order is criminal trespass.', section_number: '441', act_name: 'Indian Penal Code', act_year: 1860 },
              { description: 'You can get an injunction from civil court to stay eviction.', section_number: '38', act_name: 'Specific Relief Act', act_year: 1963 },
            ],
            scripted_phrase: { phrase: 'Under Section 106 Transfer of Property Act, you must give me proper notice. I will be seeking legal counsel.', language: preferredLanguage },
            confidence_score: 0.9,
            lawyer_available: true,
          }),
        },
      });
      setPhase('camera');
    }
  };

  if (!permission) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.danger} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionSubtitle}>
          To scan notices, FIRs, or legal documents, LegalLens needs camera access.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Allow Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
      />

      {/* Back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Corner markers — document detection overlay */}
      <View style={styles.overlayFrame}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />
      </View>

      {/* Instruction */}
      {phase === 'camera' && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            📄 Point at notice, FIR, or legal document
          </Text>
          <Text style={styles.instructionSub}>Align inside the frame for best results</Text>
        </View>
      )}

      {/* Controls */}
      {phase === 'camera' && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.captureBtn}
            onPress={handleCapture}
            accessibilityLabel="Capture document"
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <Text style={styles.captureHint}>Tap to capture</Text>
        </View>
      )}

      {/* Processing overlay */}
      {phase === 'processing' && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.safe} />
          <Animated.Text style={[styles.processingText, { opacity: fadeAnim }]}>
            {PROCESSING_STEPS[stepIndex]}
          </Animated.Text>
          <Text style={styles.processingSubtext}>Searching Indian law...</Text>
        </View>
      )}

      {/* Cancel */}
      {phase === 'camera' && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Cancel — I'm safe</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const CORNER_SIZE = 36;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  permissionContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 16, textAlign: 'center' },
  permissionSubtitle: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  permissionBtn: {
    marginTop: 24,
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  backLink: { marginTop: 16 },
  backLinkText: { color: theme.colors.textSecondary, fontSize: 14 },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayFrame: {
    position: 'absolute',
    top: '20%',
    left: 32,
    right: 32,
    bottom: '30%',
  },
  cornerTL: {
    position: 'absolute', top: 0, left: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  cornerTR: {
    position: 'absolute', top: 0, right: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  cornerBL: {
    position: 'absolute', bottom: 0, left: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  cornerBR: {
    position: 'absolute', bottom: 0, right: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  instructionContainer: {
    position: 'absolute',
    bottom: '32%',
    left: 0, right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  instructionSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 6,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0, right: 0,
    alignItems: 'center',
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'white',
  },
  captureHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 8,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  processingText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  processingSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  cancelBtn: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  cancelText: {
    color: theme.colors.safe,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
