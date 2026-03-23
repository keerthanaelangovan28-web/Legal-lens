// Frontend Twilio service — triggers SOS calls/SMS via backend
import { api } from './api';

export interface SOSCallRequest {
  userPhone: string;
  lawyerPhone: string;
  crisisType: string;
}

export interface FamilyAlertRequest {
  userPhone: string;
  familyPhone: string;
  crisisType: string;
  locationUrl?: string;
  userName?: string;
}

/**
 * Initiates SOS call bridged by Twilio via backend.
 */
export const initiateSOSCall = async (request: SOSCallRequest): Promise<{ callSid: string }> => {
  const response = await api.post('/twilio/sos-call', request);
  return response.data;
};

/**
 * Sends WhatsApp / SMS alert to family contact.
 */
export const sendFamilyAlert = async (request: FamilyAlertRequest): Promise<{ messageSid: string }> => {
  const response = await api.post('/twilio/family-alert', request);
  return response.data;
};

/**
 * Direct call to NALSA helpline (15100) — opens phone dialer.
 */
export const callNALSA = () => {
  // Linking to phone dialer is handled at the component level
  return 'tel:15100';
};
