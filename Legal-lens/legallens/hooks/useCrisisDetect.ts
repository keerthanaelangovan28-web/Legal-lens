import { useCallback } from 'react';
import { CrisisType } from '../types/crisis';

const KEYWORD_MAP: Record<string, string[]> = {
  POLICE_DETENTION: [
    'police', 'arrested', 'detained', 'station', 'handcuffs', 'officer',
    'fir', 'custody', 'interrogation', 'warrant', 'cop', 'constable',
    'lock up', 'taken', 'following me', 'stopped me', 'search me',
  ],
  DOMESTIC_VIOLENCE: [
    'husband', 'wife', 'beating', 'violence', 'threatened', 'hit', 'abuse',
    'family', 'home', 'domestic', 'marriage', 'dowry', 'hurt', 'danger at home',
    'partner', 'spouse', 'relative',
  ],
  EVICTION: [
    'eviction', 'landlord', 'rent', 'thrown out', 'house', 'flat', 'tenant',
    'notice', 'leave house', 'property', 'kicked out', 'owner asking to leave',
    'evict', 'vacate',
  ],
  SALARY_THEFT: [
    'salary', 'wages', 'boss', 'employer', 'not paid', 'payment', 'job',
    'office', 'company', 'cheated', 'work', 'employee', 'labour', 'dues',
    'overtime', 'withheld',
  ],
  CONSUMER_FRAUD: [
    'fraud', 'cheated', 'product', 'refund', 'fake', 'consumer', 'shop',
    'online', 'bought', 'defective', 'scam', 'money', 'payment failed',
    'mislead', 'false advertisement',
  ],
};

export const useCrisisDetect = () => {
  const detect = useCallback(
    (text: string): { crisisType: string; confidence: number } => {
      if (!text || text.trim().length === 0) {
        return { crisisType: 'OTHER', confidence: 0 };
      }
      const lower = text.toLowerCase();
      const scores: Record<string, number> = {};

      for (const [type, keywords] of Object.entries(KEYWORD_MAP)) {
        let score = 0;
        for (const keyword of keywords) {
          if (lower.includes(keyword)) score += 1;
        }
        scores[type] = score;
      }

      const topType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
      if (!topType || topType[1] === 0) {
        return { crisisType: 'OTHER', confidence: 0 };
      }

      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      const confidence = total > 0 ? topType[1] / total : 0;
      return { crisisType: topType[0], confidence: Math.round(confidence * 100) / 100 };
    },
    []
  );

  return { detect };
};
