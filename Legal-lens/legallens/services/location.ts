import * as Location from 'expo-location';
import { api } from './api';
import { useUserStore } from '../store/userStore';
import { Jurisdiction } from '../types/crisis';

export const getCurrentJurisdiction = async (): Promise<Jurisdiction> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access location was denied');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const response = await api.get<Jurisdiction>(`/lawyer/jurisdiction`, {
    params: {
      lat: location.coords.latitude,
      lon: location.coords.longitude,
    },
  });

  const jurisdiction = response.data;
  useUserStore.getState().setJurisdiction(jurisdiction);
  return jurisdiction;
};

export const getManualJurisdiction = (stateName: string): Jurisdiction => {
  // Static lookup for Indian states to fallback Jurisdiction
  const stateLookup: Record<string, Jurisdiction> = {
    'Tamil Nadu': { state: 'Tamil Nadu', district: 'Chennai', pincode: '600001' },
    'Kerala': { state: 'Kerala', district: 'Thiruvananthapuram', pincode: '695001' },
    'Karnataka': { state: 'Karnataka', district: 'Bengaluru', pincode: '560001' },
    'Maharashtra': { state: 'Maharashtra', district: 'Mumbai', pincode: '400001' },
    'Delhi': { state: 'Delhi', district: 'New Delhi', pincode: '110001' },
    // ... add more as needed, or a generic one
  };

  const jurisdiction = stateLookup[stateName] || { state: stateName, district: 'Unknown', pincode: '000000' };
  useUserStore.getState().setJurisdiction(jurisdiction);
  return jurisdiction;
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];
