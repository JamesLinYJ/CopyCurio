import React, { useState, useEffect } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { ChatScreen } from './screens/ChatScreen';
import { ARScanScreen } from './screens/ARScanScreen';
import { ARDetailScreen } from './screens/ARDetailScreen';
import { CardPreviewScreen } from './screens/CardPreviewScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { UserAgreement } from './screens/UserAgreement';
import { PrivacyPolicy } from './screens/PrivacyPolicy';
import { PrivacySandboxScreen } from './screens/PrivacySandboxScreen';
import { ThemeSettingsScreen } from './screens/ThemeSettingsScreen';
import { NotificationSettingsScreen } from './screens/NotificationSettingsScreen';
import { StorageManagerScreen } from './screens/StorageManagerScreen';
import { BottomNav } from './components/BottomNav';
import { AppView } from './types';
import { ASSETS } from './assets';
import { StorageService } from './utils/storage';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Simple Error Boundary Component to catch crashes
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-50 text-slate-900">
           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
             <span className="material-symbols-outlined text-3xl text-red-500">error_outline</span>
           </div>
           <h2 className="text-xl font-bold text-slate-900 mb-2">应用遇到了一点问题</h2>
           <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
             这就好比探索宇宙时飞船偶尔会遇到的小故障。请尝试刷新页面。
           </p>
           <button 
             onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }} 
             className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-transform"
           >
             刷新页面
           </button>
           
           <div className="mt-12 w-full max-w-md">
             <p className="text-[10px] text-slate-400 font-mono mb-2 text-left">错误详情 (Debug):</p>
             <pre className="text-[10px] text-left w-full bg-white border border-gray-200 p-4 rounded-xl overflow-auto text-red-500 font-mono max-h-32 shadow-sm">
               {this.state.error?.toString() || 'Unknown Error'}
             </pre>
           </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isInitializing, setIsInitializing] = useState(true);

  // Global Theme & Accessibility Manager
  useEffect(() => {
    const applySettings = () => {
      const settings = StorageService.getSettings();
      const root = document.documentElement;
      
      // Theme
      root.classList.remove('dark', 'ink-mode');
      root.style.removeProperty('--bg-color');
      
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else if (settings.theme === 'ink') {
        root.classList.add('ink-mode');
        root.style.setProperty('--bg-color', '#f2efe6');
      } else if (settings.theme === 'system') {
         if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
           root.classList.add('dark');
         }
      }

      // Accessibility
      if (settings.accessibility?.highContrast) {
        root.classList.add('contrast-more');
        root.style.filter = 'contrast(1.25)';
      } else {
        root.classList.remove('contrast-more');
        root.style.filter = '';
      }

      if (settings.accessibility?.reduceMotion) {
        root.style.scrollBehavior = 'auto';
        // Add a global style to kill animations
        document.body.classList.add('motion-reduce');
      } else {
        root.style.scrollBehavior = 'smooth';
        document.body.classList.remove('motion-reduce');
      }
    };

    applySettings();
    window.addEventListener('storage', applySettings);
    return () => window.removeEventListener('storage', applySettings);
  }, []);

  useEffect(() => {
    const preload = async () => {
      const images = [ASSETS.avatar_user, ASSETS.avatar_bot, ASSETS.bg_sky];
      await Promise.all(images.map(src => new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve; // Continue even if image fails
      })));
      setTimeout(() => setIsInitializing(false), 1500);
    };
    preload();
  }, []);

  const navigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-ink z-[100] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-[1.8rem] bg-gradient-to-br from-primary to-accent animate-pulse flex items-center justify-center shadow-xl">
             <span className="material-symbols-outlined text-white text-[40px] font-variation-filled">explore</span>
          </div>
        </div>
        <h1 className="mt-6 text-white font-bold text-2xl tracking-widest">万象解惑</h1>
        <p className="mt-2 text-white/20 text-[9px] tracking-[0.4em] uppercase font-bold">Everything Insight</p>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentView) {
      case AppView.HOME: return <HomeScreen currentView={currentView} navigate={navigate} />;
      case AppView.CHAT: return <ChatScreen currentView={currentView} navigate={navigate} />;
      case AppView.AR_SCAN: return <ARScanScreen currentView={currentView} navigate={navigate} />;
      case AppView.AR_DETAIL: return <ARDetailScreen currentView={currentView} navigate={navigate} />;
      case AppView.CARD_PREVIEW: return <CardPreviewScreen currentView={currentView} navigate={navigate} />;
      case AppView.LIBRARY: return <LibraryScreen currentView={currentView} navigate={navigate} />;
      case AppView.PROFILE: return <ProfileScreen currentView={currentView} navigate={navigate} />;
      case AppView.AGREEMENT: return <UserAgreement currentView={currentView} navigate={navigate} />;
      case AppView.PRIVACY: return <PrivacyPolicy currentView={currentView} navigate={navigate} />;
      case AppView.PRIVACY_SANDBOX: return <PrivacySandboxScreen currentView={currentView} navigate={navigate} />;
      case AppView.THEME_SETTINGS: return <ThemeSettingsScreen currentView={currentView} navigate={navigate} />;
      case AppView.NOTIFICATION_SETTINGS: return <NotificationSettingsScreen currentView={currentView} navigate={navigate} />;
      case AppView.STORAGE_MANAGER: return <StorageManagerScreen currentView={currentView} navigate={navigate} />;
      default: return <HomeScreen currentView={currentView} navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-slate-900 transition-colors duration-500 overflow-x-hidden">
      <style>{`
        .motion-reduce *, .motion-reduce *::before, .motion-reduce *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `}</style>
      <ErrorBoundary>
        <div key={currentView} className="animate-page-enter w-full min-h-screen">
          {renderScreen()}
        </div>
        <BottomNav currentView={currentView} navigate={navigate} />
      </ErrorBoundary>
    </div>
  );
};

export default App;