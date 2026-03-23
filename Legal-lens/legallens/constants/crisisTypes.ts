import { CrisisType } from '../types/crisis';

export interface CrisisTypeConfig {
  type: CrisisType;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  keywords: string[];
}

export const CRISIS_TYPE_CONFIGS: CrisisTypeConfig[] = [
  {
    type: CrisisType.POLICE_DETENTION,
    label: 'Police Detention',
    shortLabel: 'Police stopped me',
    icon: 'shield-outline',
    color: '#E24B4A',
    bgColor: '#FDE8E8',
    description: 'Being stopped, detained, or arrested by police',
    keywords: ['police', 'arrested', 'detained', 'custody', 'station'],
  },
  {
    type: CrisisType.DOMESTIC_VIOLENCE,
    label: 'Domestic Violence',
    shortLabel: 'Threatened at home',
    icon: 'home-outline',
    color: '#D95B1E',
    bgColor: '#FDEEE5',
    description: 'Violence or threats from family members at home',
    keywords: ['violence', 'abuse', 'threatened', 'hit', 'husband', 'wife'],
  },
  {
    type: CrisisType.EVICTION,
    label: 'Wrongful Eviction',
    shortLabel: 'Landlord evicting me',
    icon: 'key-outline',
    color: '#BA7517',
    bgColor: '#FEF3DB',
    description: 'Being forcibly removed from home or rental property',
    keywords: ['eviction', 'landlord', 'rent', 'evict', 'house', 'vacate'],
  },
  {
    type: CrisisType.SALARY_THEFT,
    label: 'Salary Theft',
    shortLabel: 'Boss not paying',
    icon: 'cash-outline',
    color: '#1A6BAD',
    bgColor: '#E3F0FB',
    description: 'Employer withholding wages or not paying salary',
    keywords: ['salary', 'wages', 'not paid', 'employer', 'labour'],
  },
  {
    type: CrisisType.CONSUMER_FRAUD,
    label: 'Consumer Fraud',
    shortLabel: 'Bought fake product',
    icon: 'bag-outline',
    color: '#7B3FB5',
    bgColor: '#F2E8FD',
    description: 'Cheated in financial or consumer transaction',
    keywords: ['fraud', 'fake', 'cheated', 'refund', 'product', 'scam'],
  },
];

export const getCrisisConfig = (type: string): CrisisTypeConfig | undefined => {
  return CRISIS_TYPE_CONFIGS.find(
    (c) => c.type === type || c.type.toString() === type?.toUpperCase()
  );
};
