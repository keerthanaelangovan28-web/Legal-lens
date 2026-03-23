import { CrisisType, LegalResponse, Lawyer } from '../types/crisis';

export interface DemoScenario {
  id: string;
  title: string;
  transcript: string;
  language: 'en' | 'ta';
  crisisType: CrisisType;
  response: LegalResponse;
  lawyer: Lawyer;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-1',
    title: 'Police Detention (Primary)',
    transcript: 'Police stopped me and want to take me to the station',
    language: 'en',
    crisisType: CrisisType.POLICE_DETENTION,
    response: {
      crisisType: CrisisType.POLICE_DETENTION,
      rights: [
        {
          actName: 'CrPC',
          actYear: '1973',
          sectionNumber: '41D',
          description: 'Right to consult and be defended by a legal practitioner of your choice during interrogation.'
        },
        {
          actName: 'Constitution of India',
          actYear: '1950',
          sectionNumber: 'Article 22',
          description: 'No person who is arrested shall be detained in custody without being informed of the grounds for such arrest.'
        },
        {
          actName: 'Supreme Court Guidelines',
          actYear: '1997',
          sectionNumber: 'D.K. Basu',
          description: 'The police officer carrying out the arrest must prepare a memo of arrest at the time of arrest.'
        }
      ],
      scriptedPhrase: 'I am aware of my rights under Section 41D CrPC. I will not answer questions without my lawyer present. I request you show the detention memo as required by D.K. Basu guidelines.',
      confidenceScore: 0.98,
      lawyerAvailable: true,
      nearestLawyerPhone: '+91-98400-12345'
    },
    lawyer: {
      id: 'l-1',
      name: 'Advocate P. Karthikeyan',
      phone: '+91-98400-12345',
      district: 'Chennai',
      crisis_specializations: [CrisisType.POLICE_DETENTION],
      certified: true,
      nalsa_id: 'TN-CH-001'
    }
  },
  {
    id: 'demo-2',
    title: 'Document Scan (Eviction)',
    transcript: 'I received an eviction notice from my landlord today.',
    language: 'en',
    crisisType: CrisisType.EVICTION,
    response: {
      crisisType: CrisisType.EVICTION,
      rights: [
        {
          actName: 'Transfer of Property Act',
          actYear: '1882',
          sectionNumber: '106',
          description: 'A lease of immovable property for any other purpose shall be deemed to be a lease from month to month, terminable, on the part of either lessor or lessee, by fifteen days\' notice.'
        },
        {
          actName: 'Rent Control Act',
          actYear: '1948',
          sectionNumber: 'Section 12',
          description: 'Protection of tenants from eviction as long as they pay the rent and perform the conditions of the tenancy.'
        }
      ],
      scriptedPhrase: 'I have received your notice. Under the Transfer of Property Act, I am entitled to a proper notice period. I will be consulting my legal counsel before vacating.',
      confidenceScore: 0.95,
      lawyerAvailable: true,
      nearestLawyerPhone: '+91-94440-54321'
    },
    lawyer: {
      id: 'l-2',
      name: 'Advocate Meera Nair',
      phone: '+91-94440-54321',
      district: 'Chennai',
      crisis_specializations: [CrisisType.EVICTION],
      certified: true,
      nalsa_id: 'TN-CH-002'
    }
  },
  {
    id: 'demo-3',
    title: 'Tamil Language Input',
    transcript: 'போலீஸ் என்னை நிறுத்தி கூட்டிட்டு போகிறார்கள்',
    language: 'ta',
    crisisType: CrisisType.POLICE_DETENTION,
    response: {
      crisisType: CrisisType.POLICE_DETENTION,
      rights: [
        {
          actName: 'CrPC',
          actYear: '1973',
          sectionNumber: '41D',
          description: 'விசாரணையின் போது உங்கள் விருப்பப்படி ஒரு வழக்கறிஞரை அணுக உங்களுக்கு உரிமை உண்டு.'
        },
        {
          actName: 'இந்திய அரசியலமைப்பு',
          actYear: '1950',
          sectionNumber: 'பிரிவு 22',
          description: 'கைது செய்யப்பட்ட எந்தவொரு நபரும் கைது செய்யப்பட்டதற்கான காரணங்களைத் தெரிவிக்காமல் காவலில் வைக்கப்படக்கூடாது.'
        }
      ],
      scriptedPhrase: 'எனக்கு CrPC பிரிவு 41D-ன் கீழ் உள்ள உரிமைகள் தெரியும். எனது வழக்கறிஞர் இல்லாமல் நான் கேள்விகளுக்கு பதிலளிக்க மாட்டேன்.',
      confidenceScore: 0.99,
      lawyerAvailable: true,
      nearestLawyerPhone: '+91-98400-12345'
    },
    lawyer: {
      id: 'l-1',
      name: 'Advocate P. Karthikeyan',
      phone: '+91-98400-12345',
      district: 'Chennai',
      crisis_specializations: [CrisisType.POLICE_DETENTION],
      certified: true,
      nalsa_id: 'TN-CH-001'
    }
  }
];
