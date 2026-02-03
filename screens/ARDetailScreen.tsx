
import React, { useState } from 'react';
import { AppView, NavigationProps } from '../types';
import { ASSETS } from '../assets';
import { Icon } from '../components/Icon';

export const ARDetailScreen: React.FC<NavigationProps> = ({ navigate }) => {
  const [mode, setMode] = useState<'simple' | 'geek'>('simple');

  return (
    <div className="bg-gray-100 dark:bg-[#221f10] font-display antialiased overflow-hidden select-none h-[100dvh] w-full relative flex flex-col items-center justify-center">
      {/* Background (Blurred) */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: `url('${ASSETS.bg_ar_detail}')`}}></div>
        <div className="absolute inset-0 backdrop-blur-[8px] bg-white/10 dark:bg-black/40"></div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 w-full z-10 pt-safe pb-4 px-6 flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="h-8 px-3 bg-black/20 backdrop-blur-md rounded-full flex items-center gap-2 text-white border border-white/10">
            <Icon name="view_in_ar" className="text-[18px]" />
            <span className="text-xs font-medium tracking-wide">AR 探索者</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 pointer-events-auto">
          <button className="flex items-center justify-center rounded-full size-10 bg-black/20 backdrop-blur-md text-white border border-white/10 hover:bg-black/30">
            <Icon name="more_vert" className="text-[20px]" />
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="relative z-20 w-full max-w-md px-4 transition-all duration-500">
        <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-[0_20px_60px_-10px_rgba(242,204,13,0.25)] overflow-hidden flex flex-col">
          {/* Header Gradient */}
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#f2cc0d]/30 via-[#f2cc0d]/5 to-transparent z-0"></div>
          
          <div className="relative z-10 flex flex-col p-6 gap-6">
            {/* 3D Illustration */}
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-sm bg-white/50 dark:bg-black/20 flex items-center justify-center group">
               <div className="absolute inset-0 opacity-10" style={{backgroundImage: `url('${ASSETS.il_cubes}')`}}></div>
               <div className="w-4/5 h-4/5 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3" style={{backgroundImage: `url('${ASSETS.il_gears}')`}}></div>
               <div className="absolute top-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-700 dark:text-yellow-400">物理 101</span>
               </div>
            </div>

            <div className="flex flex-col gap-2 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">齿轮传动</h2>
              <p className="text-yellow-700 dark:text-yellow-500 font-medium text-sm tracking-wide uppercase opacity-80">机械动力核心</p>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                齿轮通过啮合传递扭矩。大小齿轮的组合可以改变速度和力量，是现代机械的心脏。
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4">
              <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-full w-full relative">
                 <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-700 rounded-full shadow-sm z-0 transition-all duration-300 ${mode === 'geek' ? 'translate-x-[calc(100%+4px)]' : 'left-1'}`}></div>
                 <button onClick={() => setMode('simple')} className={`flex-1 relative z-10 py-2 text-sm font-bold transition-colors ${mode === 'simple' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>简单</button>
                 <button onClick={() => setMode('geek')} className={`flex-1 relative z-10 py-2 text-sm font-bold transition-colors ${mode === 'geek' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>极客模式</button>
              </div>

              <button className="group relative w-full h-12 flex items-center justify-center gap-2 bg-[#f2cc0d] hover:bg-yellow-400 text-gray-900 rounded-full font-bold text-base shadow-[0_4px_14px_0_rgba(242,204,13,0.39)] transition-all active:scale-[0.98]">
                <Icon name="science" className="text-[20px] transition-transform group-hover:rotate-12" />
                <span>验证概念</span>
                <span className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-normal bg-black/10 px-2 py-0.5 rounded-full">AR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Close */}
        <div className="mt-6 flex justify-center">
          <button onClick={() => navigate(AppView.AR_SCAN)} className="flex items-center justify-center size-12 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur text-gray-800 dark:text-white shadow-lg hover:bg-white transition-all active:scale-90 border border-white/20">
            <Icon name="close" className="text-[24px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
