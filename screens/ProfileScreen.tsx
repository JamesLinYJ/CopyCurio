
import React, { useEffect, useState } from 'react';
import { AppView, NavigationProps, UserStats } from '../types';
import { ASSETS } from '../assets';
import { StorageService, DEFAULT_STATS } from '../utils/storage';
import { Icon } from '../components/Icon';

export const ProfileScreen: React.FC<NavigationProps> = ({ navigate }) => {
  const [stats, setStats] = useState<UserStats | null>(DEFAULT_STATS);

  // Function to refresh data, called on mount and when needed
  const loadData = async () => {
    const data = await StorageService.getStats();
    setStats(data);
  };

  useEffect(() => {
    void loadData();
    const handleStorage = () => {
      void loadData();
    };
    const handleSync = (event: Event) => {
      const key = (event as CustomEvent).detail?.key;
      if (!key || key === 'stats' || key === 'library') {
        void loadData();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('storage-sync', handleSync);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('storage-sync', handleSync);
    };
  }, []);

  const xp = stats?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;
  
  // Real Achievement Logic
  const itemsSaved = stats?.itemsSaved || 0;
  const daysActive = stats?.daysActive || 1;

  return (
    <div className="bg-[#fcfcfc] min-h-[100dvh] w-full pb-32 font-sans text-slate-900 overflow-x-hidden">
      
      {/* 1. Header: "个人中心" on left, "close" text on right */}
      <header className="sticky top-0 z-30 bg-[#fcfcfc]/95 backdrop-blur-sm px-6 pt-safe pb-4 flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">个人中心</h1>
        <button 
          onClick={() => navigate(AppView.HOME)} 
          className="text-slate-400 font-bold text-sm active:text-slate-600 transition-colors"
        >
          close
        </button>
      </header>

      <main className="px-6 space-y-8 mt-2">
        
        {/* 2. User Card (White, Shadow, Rounded) */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-50 relative overflow-hidden">
           
           {/* Top Section: Avatar & Info */}
           <div className="flex gap-6 mb-8 items-start relative z-10">
              {/* Avatar with Badge */}
              <div className="relative shrink-0">
                 <div className="w-20 h-20 rounded-[1.5rem] bg-[#FF6B6B] flex items-center justify-center shadow-lg shadow-red-200">
                    <div className="w-14 h-14 bg-[#FFE66D] rounded-full flex items-center justify-center relative">
                        <div className="absolute top-4 left-3 w-1.5 h-1.5 bg-black rounded-full"></div>
                        <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-black rounded-full"></div>
                        <div className="absolute bottom-3 w-6 h-3 border-b-2 border-black rounded-full"></div>
                    </div>
                 </div>
                 <div className="absolute -bottom-2 -right-2 bg-[#2D3436] text-white text-[10px] font-black px-2.5 py-1 rounded-full border-2 border-white">
                   Lv.{level}
                 </div>
              </div>

              {/* Info Column */}
              <div className="flex-1 pt-1">
                 <h2 className="text-xl font-black text-slate-900 leading-tight">知识探索者</h2>
                 <p className="text-xs font-bold text-[#FF6B6B] mt-1 mb-4">见习探索者</p>
                 
                 {/* Progress */}
                 <div className="flex justify-between items-end mb-1">
                   <span className="text-[9px] font-bold text-slate-300">当前等级进度</span>
                   <span className="text-[9px] font-bold text-slate-400">{currentLevelXp}/100 XP</span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 rounded-full" style={{width: `${currentLevelXp}%`}}></div>
                 </div>
              </div>
           </div>

           {/* Bottom Section: Stats Grid */}
           <div className="grid grid-cols-3 gap-2 border-t border-gray-50 pt-6 relative z-10">
              <StatItem label="活跃天数" value={daysActive} />
              <StatItem label="收藏条目" value={itemsSaved} />
              <StatItem label="知识深度" value={xp} />
           </div>

           {/* Soft Background Decor */}
           <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
        </div>

        {/* 3. Achievements Section */}
        <section>
           <h3 className="text-xs font-bold text-slate-400 tracking-widest mb-4 pl-2">探索成就</h3>
           <div className="grid grid-cols-2 gap-4">
              <AchievementCard 
                icon="menu_book" 
                title="博古通今" 
                desc="收藏超过 10 项内容" 
                progress={`${Math.min(itemsSaved, 10)}/10`}
                percent={(Math.min(itemsSaved, 10) / 10) * 100}
                isActive={itemsSaved >= 10}
              />
              <AchievementCard 
                icon="verified" 
                title="持之以恒" 
                desc="活跃天数达到 3 天" 
                progress={`${Math.min(daysActive, 3)}/3`}
                percent={(Math.min(daysActive, 3) / 3) * 100}
                isActive={daysActive >= 3}
              />
           </div>
        </section>

        {/* 4. Preferences Section: Settings Links */}
        <section>
           <h3 className="text-xs font-bold text-slate-400 tracking-widest mb-4 pl-2">偏好设置</h3>
           <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
             <MenuRow icon="palette" label="界面主题" onClick={() => navigate(AppView.THEME_SETTINGS)} />
             <MenuRow icon="notifications" label="消息提醒" onClick={() => navigate(AppView.NOTIFICATION_SETTINGS)} />
             <MenuRow icon="verified_user" label="隐私与数据" onClick={() => navigate(AppView.PRIVACY_SANDBOX)} />
             <MenuRow icon="sd_storage" label="空间管家" onClick={() => navigate(AppView.STORAGE_MANAGER)} />
           </div>
        </section>

      </main>
    </div>
  );
};

const StatItem = ({label, value}: {label: string, value: number}) => (
  <div className="text-center flex flex-col gap-1">
    <div className="text-xl font-black text-slate-900">{value}</div>
    <div className="text-[10px] font-bold text-slate-400">{label}</div>
  </div>
);

const AchievementCard = ({icon, title, desc, progress, percent, isActive}: any) => (
  <div className="bg-white p-5 rounded-[1.8rem] flex flex-col gap-3 border border-gray-50 shadow-sm relative overflow-hidden group">
     {/* Icon */}
     <div className="text-slate-300 group-hover:text-primary transition-colors">
        <Icon name={icon} className="text-3xl" />
     </div>
     
     {/* Texts */}
     <div>
        <h4 className="font-bold text-slate-800 text-sm mb-1">{title}</h4>
        <p className="text-[10px] text-slate-400 font-bold leading-tight h-6">{desc}</p>
     </div>

     {/* Progress */}
     <div className="mt-2">
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
           <div className={`h-full rounded-full transition-all duration-1000 ${isActive ? 'bg-primary' : 'bg-slate-300'}`} style={{width: `${percent}%`}}></div>
        </div>
        <div className="text-[9px] text-slate-300 font-bold text-right">{progress}</div>
     </div>
  </div>
);

const MenuRow = ({icon, label, onClick}: any) => (
  <div onClick={onClick} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer group active:bg-gray-100">
     <div className="flex items-center gap-4">
       <Icon name={icon} className="text-slate-300 group-hover:text-primary transition-colors" />
       <span className="text-sm font-bold text-slate-700">{label}</span>
     </div>
     <Icon name="chevron_right" className="text-slate-200 text-[18px]" />
  </div>
);
