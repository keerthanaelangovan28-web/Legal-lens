export interface Language {
  code: string;
  label: string;
  nativeLabel: string;
  whisperCode: string;
  ttsLocale: string;
  rtl: boolean;
}

export const LANGUAGES: Language[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'EN',
    whisperCode: 'en',
    ttsLocale: 'en-IN',
    rtl: false,
  },
  {
    code: 'ta',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    whisperCode: 'ta',
    ttsLocale: 'ta-IN',
    rtl: false,
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिंदी',
    whisperCode: 'hi',
    ttsLocale: 'hi-IN',
    rtl: false,
  },
  {
    code: 'te',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    whisperCode: 'te',
    ttsLocale: 'te-IN',
    rtl: false,
  },
  {
    code: 'kn',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    whisperCode: 'kn',
    ttsLocale: 'kn-IN',
    rtl: false,
  },
  {
    code: 'ml',
    label: 'Malayalam',
    nativeLabel: 'മലയാളം',
    whisperCode: 'ml',
    ttsLocale: 'ml-IN',
    rtl: false,
  },
];

export const getLanguageByCode = (code: string): Language | undefined => {
  return LANGUAGES.find((l) => l.code === code);
};

export const DEFAULT_LANGUAGE = LANGUAGES[0]; // English
