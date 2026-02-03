
import React, { useState, useEffect } from 'react';
import { AppView, NavigationProps, AppSettings } from '../types';
import { StorageService, DEFAULT_SETTINGS } from '../utils/storage';
import { Icon } from '../components/Icon';

export const ThemeSettingsScreen: React.FC<NavigationProps> = ({ navigate }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await StorageService.getSettings();
      setSettings(data);
    };
    void loadSettings();
    const handleSync = (event: Event) => {
      const key = (event as CustomEvent).detail?.key;
      if (!key || key === 'settings') {
        void loadSettings();
      }
    };
    window.addEventListener('storage-sync', handleSync);
    return () => window.removeEventListener('storage-sync', handleSync);
  }, []);

  const setTheme = (theme: AppSettings['theme']) => {
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    if (navigator.vibrate) navigator.vibrate(5);
    window.dispatchEvent(new Event('storage'));
  };

  const toggleAccessibility = (key: keyof AppSettings['accessibility']) => {
    const newSettings = { 
      ...settings, 
      accessibility: { ...settings.accessibility, [key]: !settings.accessibility[key] } 
    };
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    if (navigator.vibrate) navigator.vibrate(5);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="bg-[#fcfcfc] dark:bg-slate-900 min-h-screen pb-20 font-sans transition-colors duration-500">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 pt-safe pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center">
        <button onClick={() => navigate(AppView.PROFILE)} className="mr-4 text-slate-400 dark:text-slate-500">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">界面主题</h1>
      </header>
      <main className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <ThemeCard 
            label="系统自适应" 
            id="system" 
            active={settings.theme === 'system'} 
            onSelect={() => setTheme('system')}
            previewClass="bg-gradient-to-br from-white to-slate-900 border-gray-200"
          />
          <ThemeCard 
            label="纯净明亮" 
            id="light" 
            active={settings.theme === 'light'} 
            onSelect={() => setTheme('light')}
            previewClass="bg-white border border-gray-100"
          />
          <ThemeCard 
            label="深邃黑夜" 
            id="dark" 
            active={settings.theme === 'dark'} 
            onSelect={() => setTheme('dark')}
            previewClass="bg-slate-900 border border-slate-700"
          />
          <ThemeCard 
            label="水墨丹青" 
            id="ink" 
            active={settings.theme === 'ink'} 
            onSelect={() => setTheme('ink')}
            previewClass="bg-[#f2efe6] border border-[#dcd9ce]"
          />
        </div>

        <div className="mt-12 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">视觉辅助</h3>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-50 dark:divide-gray-700">
             
             <div className="flex items-center justify-between p-6 cursor-pointer" onClick={() => toggleAccessibility('highContrast')}>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">高对比度模式</span>
                  <span className="text-[10px] text-slate-400">增强文字与背景的清晰度</span>
                </div>
                <button className={`w-12 h-6 rounded-full transition-colors relative ${settings.accessibility?.highContrast ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-600'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.accessibility?.highContrast ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>

             <div className="flex items-center justify-between p-6 cursor-pointer" onClick={() => toggleAccessibility('reduceMotion')}>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">减弱动态效果</span>
                  <span className="text-[10px] text-slate-400">减少界面切换动画</span>
                </div>
                <button className={`w-12 h-6 rounded-full transition-colors relative ${settings.accessibility?.reduceMotion ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-600'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.accessibility?.reduceMotion ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>

          </div>
        </div>
      </main>
    </div>
  );
};

const ThemeCard = ({ label, active, onSelect, previewClass }: any) => (
  <button onClick={onSelect} className={`flex flex-col gap-3 p-4 rounded-[2rem] border-2 transition-all ${active ? 'border-primary bg-white dark:bg-slate-800 shadow-lg' : 'border-transparent bg-gray-50 dark:bg-slate-800/50'}`}>
    <div className={`w-full aspect-square rounded-2xl shadow-inner ${previewClass}`}></div>
    <div className="flex items-center justify-between px-1 w-full">
      <span className={`text-[10px] font-black uppercase tracking-wider ${active ? 'text-primary' : 'text-slate-400'}`}>{label}</span>
      {active && <Icon name="check_circle" className="text-primary text-[14px]" />}
    </div>
  </button>
);
