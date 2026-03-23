import * as SQLite from 'expo-sqlite';
import { LegalResponse, CrisisType } from '../types/crisis';
import { api } from './api';

const DB_NAME = 'legallens_offline.db';

export const initOfflineDB = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_responses (
      id TEXT PRIMARY KEY,
      crisis_type TEXT NOT NULL,
      jurisdiction TEXT,
      language TEXT NOT NULL,
      rights_json TEXT NOT NULL,
      scripted_phrase TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
};

export const syncOfflineCache = async () => {
  try {
    const response = await api.get<any[]>('/crisis/offline-pack');
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // Clear old cache
    await db.runAsync('DELETE FROM offline_responses');
    
    // Insert new pack
    for (const item of response.data) {
      await db.runAsync(
        'INSERT INTO offline_responses (id, crisis_type, jurisdiction, language, rights_json, scripted_phrase, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          item.id,
          item.crisis_type,
          item.jurisdiction || null,
          item.language,
          JSON.stringify(item.rights),
          item.scripted_phrase,
          Date.now()
        ]
      );
    }
    console.log('Offline cache synced successfully');
  } catch (error) {
    console.error('Failed to sync offline cache', error);
  }
};

export const getOfflineResponse = async (crisisType: string, language: string): Promise<LegalResponse | null> => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // Try exact match
    let result = await db.getFirstAsync<any>(
      'SELECT * FROM offline_responses WHERE crisis_type = ? AND language = ?',
      [crisisType, language]
    );
    
    // Fallback to English if not found
    if (!result && language !== 'en') {
      result = await db.getFirstAsync<any>(
        'SELECT * FROM offline_responses WHERE crisis_type = ? AND language = ?',
        [crisisType, 'en']
      );
      if (result) {
        result.scripted_phrase = `[Offline: showing English response] ${result.scripted_phrase}`;
      }
    }
    
    if (result) {
      return {
        crisisType: result.crisis_type as CrisisType,
        rights: JSON.parse(result.rights_json),
        scriptedPhrase: result.scripted_phrase,
        confidenceScore: 1.0,
        lawyerAvailable: false, // Offline fallback
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting offline response', error);
    return null;
  }
};

export const isOfflineAvailable = async (crisisType: string): Promise<boolean> => {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    const result = await db.getFirstAsync<any>(
      'SELECT id FROM offline_responses WHERE crisis_type = ? LIMIT 1',
      [crisisType]
    );
    return !!result;
  } catch (error) {
    return false;
  }
};
