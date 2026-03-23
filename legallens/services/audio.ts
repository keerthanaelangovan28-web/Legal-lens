import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface RecordingEntry {
  sessionId: string;
  timestamp: number;
  duration: number;
  fileUri: string;
  crisisType?: string;
}

let recordingInstance: Audio.Recording | null = null;
let checkpointInterval: any = null;

export const startSilentRecording = async (sessionId: string) => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const cacheDir = (FileSystem as any).cacheDirectory;
    if (!cacheDir) return;
    
    const evidenceDir = `${cacheDir}evidence/`;

    const dirInfo = await FileSystem.getInfoAsync(evidenceDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(evidenceDir, { intermediates: true });
    }

    const timestamp = Date.now();
    const fileUri = `${evidenceDir}evidence_${sessionId}_${timestamp}.m4a`;

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    
    recordingInstance = recording;

    // Every 60 seconds: save a checkpoint (so if app crashes, we have audio)
    checkpointInterval = setInterval(async () => {
      if (recordingInstance) {
        const status = await recordingInstance.getStatusAsync();
        console.log('Recording checkpoint:', status.durationMillis);
      }
    }, 60000);

  } catch (err) {
    console.error('Failed to start recording', err);
  }
};

export const stopRecording = async (): Promise<string | null> => {
  try {
    if (checkpointInterval) {
      clearInterval(checkpointInterval);
      checkpointInterval = null;
    }

    if (!recordingInstance) return null;

    await recordingInstance.stopAndUnloadAsync();
    const uri = recordingInstance.getURI();
    recordingInstance = null;
    return uri;
  } catch (err) {
    console.error('Failed to stop recording', err);
    return null;
  }
};

export const getRecordingsList = async (): Promise<RecordingEntry[]> => {
  try {
    const cacheDir = (FileSystem as any).cacheDirectory;
    if (!cacheDir) return [];
    const evidenceDir = `${cacheDir}evidence/`;

    const dirInfo = await FileSystem.getInfoAsync(evidenceDir);
    if (!dirInfo.exists) return [];

    const files = await FileSystem.readDirectoryAsync(evidenceDir);
    const entries: RecordingEntry[] = [];

    for (const file of files) {
      if (file.startsWith('evidence_')) {
        const parts = file.split('_');
        const sessionId = parts[1];
        const timestamp = parseInt(parts[2].split('.')[0]);
        const fileUri = `${evidenceDir}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        if (fileInfo.exists) {
          entries.push({
            sessionId,
            timestamp,
            duration: 0,
            fileUri,
          });
        }
      }
    }
    return entries;
  } catch (err) {
    console.error('Failed to get recordings list', err);
    return [];
  }
};

export const deleteRecording = async (sessionId: string) => {
  try {
    const cacheDir = (FileSystem as any).cacheDirectory;
    if (!cacheDir) return;
    const evidenceDir = `${cacheDir}evidence/`;

    const files = await FileSystem.readDirectoryAsync(evidenceDir);
    for (const file of files) {
      if (file.includes(sessionId)) {
        await FileSystem.deleteAsync(`${evidenceDir}${file}`);
      }
    }
  } catch (err) {
    console.error('Failed to delete recording', err);
  }
};
