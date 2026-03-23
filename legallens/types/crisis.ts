export enum CrisisType {
  POLICE_DETENTION = 'POLICE_DETENTION',
  DOMESTIC_VIOLENCE = 'DOMESTIC_VIOLENCE',
  EVICTION = 'EVICTION',
  SALARY_THEFT = 'SALARY_THEFT',
  CONSUMER_FRAUD = 'CONSUMER_FRAUD',
}

export interface LegalRight {
  description: string;
  sectionNumber: string;
  actName: string;
  actYear: string;
}

export interface LegalResponse {
  crisisType: CrisisType;
  rights: LegalRight[];
  scriptedPhrase: string;
  confidenceScore: number;
  lawyerAvailable: boolean;
  nearestLawyerPhone?: string;
}

export interface Jurisdiction {
  state: string;
  district: string;
  pincode: string;
}

export interface Lawyer {
  id: string;
  name: string;
  district: string;
  certified: boolean;
  phone: string;
  crisis_specializations: string[];
  nalsa_id: string;
}

export interface CrisisSession {
  id: string;
  userId: string;
  timestamp: number;
  voiceTranscript: string;
  detectedCrisis: CrisisType;
  languageCode: string;
  jurisdiction: Jurisdiction;
  response: LegalResponse;
  audioRecordingUri?: string;
}
