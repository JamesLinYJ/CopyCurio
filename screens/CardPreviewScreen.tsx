
import React, { useEffect, useState } from 'react';
import { AppView, NavigationProps } from '../types';
import { ASSETS } from '../assets';
import { GoogleGenAI } from "@google/genai";

const LOADING_TIPS = [
  "正在绘制知识卡片...",
  "正在查找有趣的图片...",
  "正在整理神奇的故事...",
  "正在为知识涂上颜色...",
  "Q-Bot 正在翻阅百科全书..."
];

export const CardPreviewScreen: React.FC<NavigationProps> = ({ navigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  
  // Date string like "2026/2/3"
  const dateStr = new Date().toLocaleDateString('zh-CN').replace(/\//g, '/');

  useEffect(() => {
    const interval = setInterval(() => {
        setTipIndex(prev => (prev + 1) % LOADING_TIPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setData(null);

    try {
        const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        const prompt = `
        为儿童生成一个自然科学知识卡片。
        JSON格式:
        {
           "title": "标题(如：为什么...?)",
           "content": "简单解释，约50字",
           "category": "自然 (或 动物/植物)",
           "keyword": "nature" 
        }
        `;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts: [{ text: prompt }] },
          config: { responseMimeType: 'application/json' }
        });
        
        const text = response.text || '{}';
        const result = JSON.parse(text);
        
        // Minimum loading time for visual effect
        await new Promise(r => setTimeout(r, 2000));
        setData(result);
    } catch (e) {
        setData({ 
          title: "仙人掌为什么全身都是刺？", 
          content: "很久以前，仙人掌为了在干旱的沙漠里藏住水分，把宽大的叶子缩成了尖尖的细刺，还能防止坏蛋偷吃呢！", 
          category: "自然", 
          keyword: "cactus"
        });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleClose = () => {
    navigate(AppView.HOME);
  };

  return (
    <div className="bg-slate-900/90 min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 backdrop-blur-sm relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      {loading ? (
        <div className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl relative z-10 animate-pop-in">
           {/* Skeleton Header */}
           <div className="h-64 bg-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 via-gray-200 to-gray-100 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                 <span className="material-symbols-rounded text-6xl text-gray-300 animate-bounce">image</span>
              </div>
           </div>
           
           {/* Skeleton Content */}
           <div className="p-6 space-y-6">
              <div className="flex gap-3">
                 <div className="h-6 w-16 bg-gray-100 rounded-lg animate-pulse"></div>
                 <div className="h-6 w-24 bg-gray-100 rounded-lg animate-pulse delay-75"></div>
              </div>
              <div className="space-y-3">
                 <div className="h-8 w-3/4 bg-gray-100 rounded-xl animate-pulse delay-150"></div>
                 <div className="h-8 w-1/2 bg-gray-100 rounded-xl animate-pulse delay-200"></div>
              </div>
              <div className="space-y-2 pt-2">
                 <div className="h-4 w-full bg-gray-100 rounded-md animate-pulse delay-300"></div>
                 <div className="h-4 w-full bg-gray-100 rounded-md animate-pulse delay-400"></div>
                 <div className="h-4 w-5/6 bg-gray-100 rounded-md animate-pulse delay-500"></div>
              </div>
           </div>
           
           {/* Loading Status Pill */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/50 flex items-center gap-3 min-w-[200px] justify-center">
                 <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></span>
                 </div>
                 <span className="text-xs font-bold text-slate-600 text-center animate-fade-in">{LOADING_TIPS[tipIndex]}</span>
              </div>
           </div>
        </div>
      ) : (
        // The Main Card Container
        <div className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-pop-in relative z-10">
          {/* Top Half: Image Area */}
          <div className="relative h-64 w-full bg-gray-100 group">
             <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${ASSETS.bg_card_default}')` }}></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
             
             <button 
               onClick={handleClose}
               className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white rounded-full w-8 h-8 flex items-center justify-center border border-white/20 active:scale-90 transition-all hover:bg-black/50"
             >
               <span className="material-symbols-rounded text-lg">close</span>
             </button>
          </div>

          {/* Bottom Half: Content Area */}
          <div className="p-6 bg-white relative">
             <div className="absolute -top-8 right-6 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center rotate-3">
                <span className="text-3xl">💡</span>
             </div>

             {/* Meta Row */}
             <div className="flex items-center gap-3 mb-4">
               <span className="bg-orange-50 text-orange-500 border border-orange-100 px-3 py-1 rounded-lg text-[10px] font-black tracking-wide uppercase">
                 {data?.category || '自然'}
               </span>
               <span className="text-gray-300 text-[10px] font-bold font-mono">
                 {dateStr}
               </span>
             </div>

             {/* Title */}
             <h2 className="text-2xl font-black text-slate-800 mb-4 leading-tight tracking-tight">
               {data?.title}
             </h2>

             {/* Body Text */}
             <p className="text-slate-600 text-sm leading-relaxed text-justify font-bold opacity-90">
               {data?.content}
             </p>
             
             {/* Action Bar */}
             <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                <div className="flex -space-x-2">
                   <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-white"></div>
                   <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white"></div>
                   <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-white"></div>
                </div>
                <button className="text-xs font-bold text-slate-400 flex items-center gap-1">
                   <span className="material-symbols-rounded text-sm">favorite</span>
                   收藏
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
