import { useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../services/api';
import { getOfflineResponse } from '../services/offline';
import { LegalResponse, CrisisType } from '../types/crisis';
import { useUserStore } from '../store/userStore';

interface QueryResult {
  response: LegalResponse | null;
  mode: 'online' | 'offline' | 'cache';
  error: string | null;
}

export const useLegalQuery = () => {
  const [loading, setLoading] = useState(false);
  const { preferredLanguage } = useUserStore();

  const queryLegalRights = useCallback(async (
    transcript: string, 
    crisisType: CrisisType
  ): Promise<QueryResult> => {
    setLoading(true);
    
    try {
      const netState = await NetInfo.fetch();
      
      if (netState.isConnected && netState.isInternetReachable) {
        // Try API with 3s timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        try {
          const response = await api.post<LegalResponse>('/crisis/analyze', {
            transcript,
            crisis_type: crisisType,
            language: preferredLanguage
          }, { signal: controller.signal });
          
          clearTimeout(timeoutId);
          setLoading(false);
          return { response: response.data, mode: 'online', error: null };
        } catch (apiError: any) {
          clearTimeout(timeoutId);
          console.log('API failed or timed out, falling back to offline cache');
        }
      }
      
      // Fallback to offline SQLite
      const offlineRes = await getOfflineResponse(crisisType, preferredLanguage);
      setLoading(false);
      
      if (offlineRes) {
        return { response: offlineRes, mode: 'cache', error: null };
      } else {
        return { response: null, mode: 'offline', error: 'Offline cache not available for this crisis.' };
      }
      
    } catch (error: any) {
      setLoading(false);
      return { response: null, mode: 'offline', error: error.message };
    }
  }, [preferredLanguage]);

  return { queryLegalRights, loading };
};
