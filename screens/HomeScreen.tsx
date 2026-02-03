
import React from 'react';
import { AppView, NavigationProps } from '../types';
import { ASSETS } from '../assets';
import { Icon } from '../components/Icon';

export const HomeScreen: React.FC<NavigationProps> = ({ navigate }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '早上好！' : hour < 18 ? '下午好！' : '晚上好！';

  return (
    <div className="min-h-[100dvh] w-full pb-32 font-sans overflow-x-hidden">
      {/* Playful Header */}
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-xl px-6 pt-safe pb-4 flex justify-between items-center border-b-4 border-dashed border-primary/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-2xl animate-wiggle">👋</span>
             <span className="text-lg font-black text-primary font-display tracking-wider">{greeting}</span>
          </div>
          <h1 className="text-3xl font-black text-ink font-display text-outline tracking-tight">
            奇妙<span className="text-secondary">万象</span>乐园
          </h1>
        </div>
        <button 
          onClick={() => navigate(AppView.PROFILE)}
          className="w-14 h-14 rounded-full bg-white border-4 border-white shadow-comic active:translate-y-1 active:shadow-comic-hover transition-all overflow-hidden"
        >
          <img src={ASSETS.avatar_user} className="w-full h-full object-cover" alt="User" />
        </button>
      </header>

      <main className="px-5 mt-6 space-y-6">
        
        {/* Hero: Ask Robot */}
        <section 
           onClick={() => navigate(AppView.CHAT)} 
           className="relative w-full rounded-[2.5rem] bg-secondary overflow-hidden shadow-comic group cursor-pointer active:scale-[0.98] transition-transform"
        >
            <div className="p-8 relative z-10">
               <div className="bg-white/20 backdrop-blur-sm w-fit px-4 py-2 rounded-full mb-3 border-2 border-white/40">
                  <span className="text-xs font-black text-white uppercase tracking-widest">✨ 这种植物叫什么?</span>
               </div>
               <h2 className="text-3xl font-display font-black text-white leading-tight mb-2 drop-shadow-md">问问<br/>机器猫 Q-Bot</h2>
               <div className="mt-6 inline-flex items-center gap-2 bg-white text-secondary px-6 py-3 rounded-2xl font-black shadow-lg">
                  <Icon name="chat_bubble" className="font-bold" />
                  开始聊天
               </div>
            </div>
            
            {/* Decor */}
            <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
            <img 
               src={ASSETS.avatar_bot} 
               className="absolute -right-6 bottom-4 w-36 h-36 drop-shadow-xl animate-float" 
               alt="Robot"
            />
        </section>

        {/* Big Buttons Grid */}
        <div className="grid grid-cols-2 gap-4">
           {/* Magic Camera */}
           <div 
             onClick={() => navigate(AppView.AR_SCAN)}
             className="bg-primary rounded-[2rem] p-5 shadow-comic active:translate-y-1 active:shadow-comic-hover transition-all relative overflow-hidden h-44 flex flex-col justify-between group"
           >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/30">
                 <Icon name="view_in_ar" className="text-white text-3xl" />
              </div>
              <div>
                 <h3 className="text-xl font-display font-black text-white">魔法<br/>照相机</h3>
                 <p className="text-white/80 text-xs font-bold mt-1">拍一拍，全知道!</p>
              </div>
              <div className="absolute -right-4 -top-4 text-white/10 rotate-12 group-hover:rotate-45 transition-transform duration-500">
                 <Icon name="shutter_speed" className="text-[100px]" />
              </div>
           </div>

           {/* Fun Fact Card */}
           <div 
             onClick={() => navigate(AppView.CARD_PREVIEW)}
             className="bg-accent rounded-[2rem] p-5 shadow-comic active:translate-y-1 active:shadow-comic-hover transition-all relative overflow-hidden h-44 flex flex-col justify-between group"
           >
              <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center border-2 border-white/40">
                 <Icon name="lightbulb" className="text-yellow-800 text-3xl" />
              </div>
              <div>
                 <h3 className="text-xl font-display font-black text-yellow-900">今日<br/>小知识</h3>
                 <p className="text-yellow-800/80 text-xs font-bold mt-1">那是真的吗?</p>
              </div>
              <div className="absolute -right-4 -bottom-4 text-yellow-900/10 -rotate-12 group-hover:scale-110 transition-transform">
                 <Icon name="school" className="text-[90px]" />
              </div>
           </div>
        </div>

        {/* Featured Story */}
        <div 
          onClick={() => navigate(AppView.CARD_PREVIEW)}
          className="bg-white rounded-[2.5rem] p-2 shadow-comic active:scale-[0.99] transition-transform border-4 border-white"
        >
           <div className="bg-blueberry rounded-[2rem] p-6 relative overflow-hidden">
              <div className="relative z-10 text-center py-4">
                 <span className="text-4xl animate-bounce-slow inline-block mb-2">🚀</span>
                 <h3 className="text-2xl font-display font-black text-white mb-2">太空大冒险</h3>
                 <p className="text-white/70 text-sm font-bold">为什么星星会眨眼睛？</p>
                 <div className="mt-4 inline-block bg-accent text-yellow-900 px-4 py-2 rounded-xl font-black text-xs shadow-lg">
                    去探索
                 </div>
              </div>
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.35) 1px, transparent 1px), radial-gradient(circle at 40% 70%, rgba(255,255,255,0.4) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                  backgroundPosition: '0 0, 12px 12px, 6px 18px'
                }}
              ></div>
           </div>
        </div>

      </main>
    </div>
  );
};
