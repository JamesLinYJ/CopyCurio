
import React, { useState, useEffect } from 'react';
import { AppView, NavigationProps, AppSettings } from '../types';
import { StorageService, DEFAULT_SETTINGS } from '../utils/storage';
import { Icon } from '../components/Icon';

export const NotificationSettingsScreen: React.FC<NavigationProps> = ({ navigate }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    const loadSettings = async () => {
      const data = await StorageService.getSettings();
      setSettings(data);
    };
    void loadSettings();
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
    const handleSync = (event: Event) => {
      const key = (event as CustomEvent).detail?.key;
      if (!key || key === 'settings') {
        void loadSettings();
      }
    };
    window.addEventListener('storage-sync', handleSync);
    return () => window.removeEventListener('storage-sync', handleSync);
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert("您的设备不支持通知功能。");
      return false;
    }
    const result = await Notification.requestPermission();
    setPermissionStatus(result);
    return result === 'granted';
  };

  const toggle = async (key: keyof AppSettings['notifications']) => {
    // If turning ON, check permissions
    if (!settings.notifications[key]) {
      const granted = await requestPermission();
      if (!granted && permissionStatus === 'denied') {
        alert('通知权限已被拒绝。请在设备设置中允许本应用发送通知。');
        return; 
      }
      if (!granted) return; // User closed dialog or denied
    }

    const newSettings = { ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } };
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-20 font-sans">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-6 pt-safe pb-4 border-b border-gray-100 flex items-center">
        <button onClick={() => navigate(AppView.PROFILE)} className="mr-4 text-slate-400 active:text-slate-600">
          <Icon name="arrow_back" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">消息提醒</h1>
      </header>
      <main className="p-6">
        {permissionStatus === 'denied' && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2">
            <Icon name="error" className="text-sm" />
            通知权限受限，请在系统设置中开启。
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          <NotifyRow 
            label="每日新知推送" 
            desc="每天早晨 08:00 为您准备一条精选的科学知识" 
            active={settings.notifications.dailyFact} 
            onToggle={() => toggle('dailyFact')}
          />
          <NotifyRow 
            label="探索目标达成" 
            desc="当您解锁新的收藏等级或知识深度时提醒" 
            active={settings.notifications.explorationGoal} 
            onToggle={() => toggle('explorationGoal')}
          />
          <NotifyRow 
            label="功能与安全更新" 
            desc="重要系统升级与隐私政策变动通知" 
            active={settings.notifications.systemUpdates} 
            onToggle={() => toggle('systemUpdates')}
          />
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
           <div className="flex justify-center mb-4 opacity-50">
              <Icon name="notifications_off" className="text-4xl text-slate-300" />
           </div>
           <p className="text-[10px] text-slate-400 leading-relaxed text-center">
             我们会严格控制推送频率。即使开启所有选项，我们承诺每天最多发送 1-2 条通知，以免打扰您的专注。
           </p>
        </div>
      </main>
    </div>
  );
};

const NotifyRow = ({ label, desc, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-6">
    <div className="flex-1 pr-4">
      <h4 className="text-sm font-bold text-slate-800 mb-1">{label}</h4>
      <p className="text-[10px] text-slate-400">{desc}</p>
    </div>
    <button onClick={onToggle} className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-primary' : 'bg-gray-200'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${active ? 'left-7' : 'left-1'}`}></div>
    </button>
  </div>
);
