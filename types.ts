
export enum AppView {
  HOME = 'HOME',
  CHAT = 'CHAT',
  AR_SCAN = 'AR_SCAN',
  AR_DETAIL = 'AR_DETAIL',
  CARD_PREVIEW = 'CARD_PREVIEW',
  LIBRARY = 'LIBRARY',
  PROFILE = 'PROFILE',
  AGREEMENT = 'AGREEMENT',
  PRIVACY = 'PRIVACY',
  PRIVACY_SANDBOX = 'PRIVACY_SANDBOX',
  THEME_SETTINGS = 'THEME_SETTINGS',
  NOTIFICATION_SETTINGS = 'NOTIFICATION_SETTINGS',
  STORAGE_MANAGER = 'STORAGE_MANAGER'
}

export interface NavigationProps {
  currentView: AppView;
  navigate: (view: AppView) => void;
}

// Data Models
export interface LibraryItem {
  id: string;
  type: 'scan' | 'card';
  title: string;
  content: string;
  category: string;
  date: number;
  thumbnail?: string;
  funFact?: string;
  relatedQuestions?: string[];
  tags?: string[];
}

export interface UserStats {
  itemsSaved: number;
  daysActive: number;
  lastLogin: number;
  joinDate: number;
  xp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system' | 'ink';
  notifications: {
    dailyFact: boolean;
    explorationGoal: boolean;
    systemUpdates: boolean;
  };
  privacy: {
    clearOnExit: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
  };
}
