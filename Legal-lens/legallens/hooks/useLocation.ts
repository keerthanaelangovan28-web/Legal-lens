import { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { getCurrentJurisdiction, getManualJurisdiction } from '../services/location';
import { Jurisdiction } from '../types/crisis';

export const useLocation = () => {
  const { jurisdiction, setJurisdiction } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectJurisdiction = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCurrentJurisdiction();
      setJurisdiction(result);
    } catch (err: any) {
      setError(err.message || 'Failed to detect location');
    } finally {
      setIsLoading(false);
    }
  };

  const setManual = (stateName: string) => {
    const result = getManualJurisdiction(stateName);
    setJurisdiction(result);
    setError(null);
  };

  useEffect(() => {
    if (!jurisdiction) {
      detectJurisdiction();
    }
  }, []);

  return {
    jurisdiction,
    isLoading,
    error,
    requestPermission: detectJurisdiction,
    setManual,
  };
};
