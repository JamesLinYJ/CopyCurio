
import React, { useState, useEffect } from 'react';
import { AppView, NavigationProps, AppSettings } from '../types';
import { StorageService, DEFAULT_SETTINGS } from '../utils/storage';
import { Icon } from '../components/Icon';

export const PrivacySandboxScreen: React.FC<NavigationProps> = ({ navigate }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isExporting, setIsExporting] = useState(false);

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

  const toggle = (key: keyof AppSettings['privacy']) => {
    const newSettings = { ...settings, privacy: { ...settings.privacy, [key]: !settings.privacy[key] } };
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(async () => {
      try {
        const [stats, library, sessions, currentSettings] = await Promise.all([
          StorageService.getStats(),
          StorageService.getLibrary(),
          StorageService.getSessions(),
          StorageService.getSettings()
        ]);

        const data = {
          exportDate: new Date().toISOString(),
          stats,
          library,
          sessions,
          settings: currentSettings
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `万象数据备份_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (e) {
        alert('导出失败，请确保存储空间充足。');
      } finally {
        setIsExporting(false);
      }
    }, 800);
  };

  const handleDeleteIdentity = () => {
    if (confirm("确定要重置应用吗？\n\n此操作将清除所有已保存的收藏、对话和设置，且无法恢复。")) {
       StorageService.clearAllData();
    }
  };

  return (
    <div className="bg-[#fcfcfc] dark:bg-slate-900 min-h-screen pb-20 font-sans">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 pt-safe pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center">
        <button onClick={() => navigate(AppView.PROFILE)} className="mr-4 text-slate-400 active:text-slate-600">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">数据安全</h1>
      </header>
      <main className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Safety Badge */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/50">
          <div className="flex items-center gap-3 mb-3 text-emerald-600 dark:text-emerald-400">
            <Icon name="gpp_good" />
            <h2 className="font-bold">默认安全机制已启用</h2>
          </div>
          <p className="text-sm text-emerald-800 dark:text-emerald-300/80 leading-relaxed text-justify">
            您的数据安全是我们的首要任务。当前版本会将对话记录和收藏内容保存到您配置的后端数据库中，并在本地缓存必要数据以提升启动速度。
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">隐私设置</h3>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-50 dark:divide-gray-700">
            <ToggleRow 
              icon="auto_delete" 
              label="退出时自动清理" 
              desc="关闭应用时自动清除临时缓存数据" 
              active={settings.privacy.clearOnExit} 
              onToggle={() => toggle('clearOnExit')}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">数据管理</h3>
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-50 dark:divide-gray-700">
            <ActionRow 
              icon="file_download" 
              label={isExporting ? "正在打包..." : "导出数据备份"}
              desc="将所有个人数据导出为 JSON 文件" 
              onClick={handleExportData}
              loading={isExporting}
            />
            <ActionRow 
              icon="delete_forever" 
              label="重置应用" 
              desc="清除所有数据并恢复初始状态" 
              isDanger 
              onClick={handleDeleteIdentity}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const ToggleRow = ({ icon, label, desc, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-6">
    <div className="flex-1 pr-4">
      <div className="flex items-center gap-3 mb-1">
        <Icon name={icon} className="text-slate-400" />
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</span>
      </div>
      <p className="text-[10px] text-slate-400">{desc}</p>
    </div>
    <button onClick={onToggle} className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-600'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`}></div>
    </button>
  </div>
);

const ActionRow = ({ icon, label, desc, isDanger, onClick, loading }: any) => (
  <div onClick={loading ? undefined : onClick} className={`flex items-center justify-between p-6 transition-colors ${loading ? 'opacity-50 cursor-wait' : 'cursor-pointer active:bg-gray-50 dark:active:bg-slate-700'}`}>
    <div className="flex-1 pr-4">
      <div className="flex items-center gap-3 mb-1">
        {loading ? (
           <Icon name="progress_activity" className="text-primary animate-spin" />
        ) : (
           <Icon name={icon} className={`${isDanger ? 'text-red-400' : 'text-slate-400'}`} />
        )}
        <span className={`text-sm font-bold ${isDanger ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>{label}</span>
      </div>
      <p className="text-[10px] text-slate-400">{desc}</p>
    </div>
    {!loading && <Icon name="chevron_right" className="text-slate-300 dark:text-slate-600" />}
  </div>
);
