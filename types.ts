export interface User {
  email: string;
  name: string;
}

export interface ScannedItem {
  id: string;
  timestamp: number;
  originalImage: string; // Base64
  extractedText: string;
  translatedText?: string;
  targetLanguage?: string;
}

export enum ProcessingStage {
  IDLE = 'IDLE',
  PREPROCESSING = 'PREPROCESSING', // Noise reduction, Binarization
  FEATURE_EXTRACTION = 'FEATURE_EXTRACTION', // CNN
  SEQUENCE_PROCESSING = 'SEQUENCE_PROCESSING', // RNN
  CONTEXT_UNDERSTANDING = 'CONTEXT_UNDERSTANDING', // Transformers
  FINALIZING = 'FINALIZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
];