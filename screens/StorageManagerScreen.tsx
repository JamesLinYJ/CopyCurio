
import React, { useState, useEffect } from 'react';
import { AppView, NavigationProps } from '../types';
import { StorageService } from '../utils/storage';

export const StorageManagerScreen: React.FC<NavigationProps> = ({ navigate }) => {
  const [breakdown, setBreakdown] = useState({
      librarySize: "计算中...",
      libraryCount: 0,
      sessionsSize: "计算中...",
      sessionsCount: 0,
      systemSize: "0.0",
      totalSize: "0.0"
  });
  const [isCleaning, setIsCleaning] = useState<string | null>(null);

  const refreshData = async () => {
    const data = await StorageService.getStorageBreakdown();
    setBreakdown(data);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleClearSessions = () => {
    if (confirm('确定要清空所有对话记录吗？此操作无法撤销。')) {
      setIsCleaning('sessions');
      setTimeout(async () => {
        await StorageService.clearSessions();
        await refreshData();
        setIsCleaning(null);
      }, 800);
    }
  };

  const handleOptimizeImages = () => {
    if (confirm('确定要压缩所有本地图片吗？\n\n这将移除“万象识物”拍摄的高清快照以释放空间，但会保留您的文字记录。')) {
      setIsCleaning('images');
      setTimeout(async () => {
        await StorageService.optimizeImages();
        await refreshData();
        setIsCleaning(null);
      }, 1000);
    }
  };

  const handleFactoryReset = async () => {
    if (confirm('⚠️ 警告：这将清除本应用的所有数据，使其恢复到刚安装时的状态。\n\n您确定要继续吗？')) {
      await StorageService.clearAllData();
    }
  };

  // Calculate percentage for visual bar (Assumed quota 5MB for LocalStorage, visually represented)
  // Since IDB is much larger, we just show relative usage or a small value if IDB is large to avoid breaking UI
  const totalSizeVal = parseFloat(breakdown.totalSize) + parseFloat(breakdown.librarySize === "计算中..." ? "0" : breakdown.librarySize) + parseFloat(breakdown.sessionsSize === "计算中..." ? "0" : breakdown.sessionsSize);
  const percentUsed = Math.min((totalSizeVal / 50000) * 100, 100); // Assume 50MB budget for visual scaling

  return (
    <div className="bg-[#fcfcfc] dark:bg-slate-900 min-h-screen pb-20 font-sans transition-colors duration-500">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center">
        <button onClick={() => navigate(AppView.PROFILE)} className="mr-4 text-slate-400 dark:text-slate-500 active:text-slate-600">
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">空间管家</h1>
      </header>
      
      <main className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Dashboard */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden">
           <div className="flex justify-between items-end mb-4 relative z-10">
              <div>
                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{totalSizeVal.toFixed(1)}</span>
                <span className="text-sm font-bold text-slate-400 ml-1">KB</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">已用空间</div>
                <div className="text-sm font-bold text-primary">{percentUsed.toFixed(1)}%</div>
              </div>
           </div>
           
           {/* Progress Bar */}
           <div className="h-4 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-1000 ease-out" style={{width: `${percentUsed}%`}}></div>
           </div>
           <p className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 relative z-10">本地存储状态正常</p>

           {/* Decor */}
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-50 dark:bg-orange-900/10 rounded-full blur-3xl z-0"></div>
        </div>

        {/* Granular Controls */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">分类管理</h3>
          
          {/* Chat History */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-1 shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                     <span className="material-symbols-rounded">forum</span>
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">对话记忆</h4>
                      <p className="text-[10px] text-slate-400">{breakdown.sessionsCount} 个会话 · {breakdown.sessionsSize} KB</p>
                   </div>
                </div>
                <button 
                  onClick={handleClearSessions}
                  disabled={breakdown.sessionsCount === 0 || isCleaning === 'sessions'}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border 
                    ${breakdown.sessionsCount === 0 
                      ? 'border-transparent text-gray-300 dark:text-gray-600' 
                      : 'border-gray-200 dark:border-gray-600 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-500 hover:border-red-200'}`}
                >
                  {isCleaning === 'sessions' ? '清理中...' : '清空'}
                </button>
             </div>
          </div>

          {/* Media Optimization */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-1 shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
                     <span className="material-symbols-rounded">image</span>
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">媒体缓存</h4>
                      <p className="text-[10px] text-slate-400">{breakdown.libraryCount} 个收藏条目 · {breakdown.librarySize} KB</p>
                   </div>
                </div>
                <button 
                  onClick={handleOptimizeImages}
                  disabled={breakdown.libraryCount === 0 || isCleaning === 'images'}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-600 text-slate-600 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all"
                >
                  {isCleaning === 'images' ? '压缩中...' : '压缩图片'}
                </button>
             </div>
          </div>

          {/* System Cache */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-1 shadow-sm border border-gray-100 dark:border-gray-700 opacity-60">
             <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                     <span className="material-symbols-rounded">settings</span>
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">系统配置</h4>
                      <p className="text-[10px] text-slate-400">必要数据 · {breakdown.systemSize} KB</p>
                   </div>
                </div>
                <span className="text-[10px] font-bold text-slate-300 px-4">系统占用</span>
             </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-8">
           <button 
             onClick={handleFactoryReset}
             className="w-full py-4 rounded-[2rem] border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-500 font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20"
           >
             <span className="material-symbols-rounded text-[18px]">delete_forever</span>
             恢复出厂设置 (清除所有数据)
           </button>
        </div>
      </main>
    </div>
  );
};
