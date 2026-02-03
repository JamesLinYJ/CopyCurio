
import React, { useEffect, useState, useRef } from 'react';
import { AppView, NavigationProps } from '../types';
import { ASSETS } from '../assets';
import { GoogleGenAI } from "@google/genai";
import { StorageService } from '../utils/storage';

interface ScanAttribute {
  label: string;
  value: string;
}

interface ScanResult {
  name: string;
  scientificName?: string;
  category: string;
  description: string;
  attributes: ScanAttribute[];
  funFact: string;
  relatedQuestions: string[];
}

const PROCESS_STEPS = [
  "正在捕获光场信息...",
  "提取物体轮廓特征...",
  "检索全球知识图谱...",
  "合成全息数据...",
  "解析完成"
];

export const ARScanScreen: React.FC<NavigationProps> = ({ navigate }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [processText, setProcessText] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Camera Management ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        if (videoRef.current && videoRef.current.srcObject) {
           const oldStream = videoRef.current.srcObject as MediaStream;
           oldStream.getTracks().forEach(t => t.stop());
        }

        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: facingMode,
            width: { ideal: 1920 }, 
            height: { ideal: 1080 },
            aspectRatio: { ideal: 9/16 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCameraPermission(true);
        }
      } catch (e) { 
        console.warn("Camera init failed:", e);
        setHasCameraPermission(false);
      }
    };

    if (!capturedImage) {
      startCamera();
    }

    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [facingMode, capturedImage]);

  // --- Analysis Logic ---
  const simulateProcess = () => {
    let step = 0;
    setProcessText(PROCESS_STEPS[0]);
    const interval = setInterval(() => {
      step++;
      if (step < PROCESS_STEPS.length - 1) { // Don't show "Complete" until actual data
        setProcessText(PROCESS_STEPS[step]);
      }
    }, 800);
    return interval;
  };

  const analyzeImage = async (base64: string) => {
    setCapturedImage(`data:image/jpeg;base64,${base64}`);
    setAnalyzing(true); 
    setResult(null); 
    setIsSaved(false);
    
    // Simulate shutter flash
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const processInterval = simulateProcess();
    
    if (navigator.vibrate) navigator.vibrate([20]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Structured Prompt for rich data
      const prompt = `
        Analyze this image meticulously. Identify the main subject (plant, animal, object, landmark, etc.).
        Return STRICT JSON format (no markdown code blocks):
        {
          "name": "Common Name (Simplified Chinese)",
          "scientificName": "Scientific/Latin Name or Alternate Name (Simplified Chinese)",
          "category": "Broad Category (e.g. 显花植物, 哺乳动物, 巴洛克建筑)",
          "description": "A sophisticated, educational description (approx 100 chars, Simplified Chinese). Tone: Objective & Encyclopedia-like.",
          "attributes": [
            {"label": "Key Trait 1", "value": "Value 1"},
            {"label": "Key Trait 2", "value": "Value 2"},
            {"label": "Key Trait 3", "value": "Value 3"}
          ] (3 key attributes, e.g. 'Era', 'Material', 'Origin', 'Habitat'),
          "funFact": "One fascinating, lesser-known fact (Simplified Chinese).",
          "relatedQuestions": ["Q1?", "Q2?"] (2 deep-dive questions)
        }
      `;
      
      const response = await ai.models.generateContent({
         model: 'gemini-3-flash-preview', 
         contents: { 
           parts: [
             { inlineData: { mimeType: 'image/jpeg', data: base64 } }, 
             { text: prompt }
           ] 
         },
         config: { responseMimeType: 'application/json' }
      });
      
      clearInterval(processInterval);
      setProcessText(PROCESS_STEPS[PROCESS_STEPS.length - 1]);

      let text = response.text || '{}';
      // Strip markdown code blocks if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const data = JSON.parse(text);
      
      // Delay slightly for smooth transition
      setTimeout(() => {
        if (data.name) {
          setResult({
            name: data.name,
            scientificName: data.scientificName || "",
            category: data.category || "通用",
            description: data.description || "暂无详细描述",
            attributes: data.attributes || [],
            funFact: data.funFact || "正在从知识库检索更多信息。",
            relatedQuestions: data.relatedQuestions || []
          });
          if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
        } else {
          throw new Error("No data");
        }
        setAnalyzing(false);
      }, 500);

    } catch (e) {
      clearInterval(processInterval);
      setResult({ 
        name: "识别中断", 
        scientificName: "Unknown Error",
        category: "系统消息",
        description: "图像信号似乎受到了干扰，或者主体不够清晰。请调整角度或光线后重试。",
        attributes: [],
        funFact: "即使是最好的探索者，有时也需要擦亮镜头。",
        relatedQuestions: []
      });
      setAnalyzing(false);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Flip if using front camera
    if (facingMode === 'user') {
      ctx?.translate(canvas.width, 0);
      ctx?.scale(-1, 1);
    }
    
    ctx?.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
    analyzeImage(base64);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64 = result.split(',')[1];
      analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const saveResult = async () => {
    if (result && !isSaved) {
      await StorageService.saveToLibrary({ 
        type: 'scan', 
        title: result.name, 
        content: result.description, 
        category: result.category,
        thumbnail: capturedImage || ASSETS.thumb_cat,
        funFact: result.funFact,
        relatedQuestions: result.relatedQuestions,
        tags: result.attributes.map(a => a.value)
      });
      setIsSaved(true);
      if (navigator.vibrate) navigator.vibrate(20);
    }
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setResult(null);
    setAnalyzing(false);
    setIsSaved(false);
    setProcessText("");
  };

  // Custom keyframes for the laser scan effect
  const scanStyle = `
    @keyframes scan-move {
      0% { transform: translateY(0%); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(80vh); opacity: 0; }
    }
  `;

  return (
    <div className="bg-black h-[100dvh] w-full relative overflow-hidden font-sans flex flex-col">
       
       {/* Shutter Flash Effect */}
       {flashEffect && <div className="absolute inset-0 bg-white z-[60] animate-shutter pointer-events-none"></div>}

       {/* Main Viewport */}
       <div className="flex-1 relative overflow-hidden bg-black">
         {/* Live Video */}
         <video 
           ref={videoRef} 
           autoPlay playsInline muted 
           className={`w-full h-full object-cover transition-all duration-500 ${capturedImage ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100'} ${facingMode === 'user' ? '-scale-x-100' : ''}`}
         />
         
         {/* Captured Freeze Frame */}
         {capturedImage && (
           <div 
             className="absolute inset-0 bg-contain bg-center bg-no-repeat bg-black z-10 transition-transform duration-700 ease-out" 
             style={{backgroundImage: `url('${capturedImage}')`, transform: result ? 'translateY(-10%) scale(0.9)' : 'scale(1)'}}
           >
             <div className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${result ? 'opacity-100' : 'opacity-0'}`}></div>
           </div>
         )}

         {/* Permission Error State */}
         {hasCameraPermission === false && (
           <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
              <span className="material-symbols-rounded text-4xl mb-4 text-gray-500">no_photography</span>
              <p className="font-bold">无法访问相机</p>
              <p className="text-sm text-gray-400 mt-2">请在App设置中允许访问，或使用相册导入。</p>
           </div>
         )}
         
         {/* Top Bar */}
         <div className="absolute top-0 w-full pt-12 px-5 flex justify-between items-center z-30 bg-gradient-to-b from-black/80 to-transparent pb-12">
           <button onClick={() => navigate(AppView.HOME)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
             <span className="material-symbols-rounded text-[22px]">close</span>
           </button>
           
           <div className="bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${analyzing ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-xs font-bold text-white tracking-widest uppercase">万象视界</span>
           </div>

           <button 
             onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
             className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
           >
             <span className="material-symbols-rounded text-[20px]">flip_camera_ios</span>
           </button>
         </div>

         {/* Analysis Overlay UI */}
         {analyzing && (
           <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none bg-black/30 backdrop-blur-[2px] transition-all duration-500">
             <style>{scanStyle}</style>
             
             {/* Holographic Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

             {/* Laser Scan Bar */}
             <div className="absolute top-0 left-0 w-full h-2 bg-secondary/80 shadow-[0_0_20px_rgba(78,205,196,1)] animate-[scan-move_2s_ease-in-out_infinite]"></div>

             {/* Central HUD */}
             <div className="relative z-10">
                {/* Rotating Rings */}
                <div className="w-48 h-48 rounded-full border border-white/20 flex items-center justify-center animate-[spin_8s_linear_infinite]">
                   <div className="absolute top-0 w-1 h-2 bg-white/60"></div>
                   <div className="absolute bottom-0 w-1 h-2 bg-white/60"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-36 h-36 rounded-full border border-dashed border-white/30 animate-[spin_12s_linear_infinite_reverse]"></div>
                </div>
                
                {/* Center Icon Pulse */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-secondary/50 shadow-[0_0_30px_rgba(78,205,196,0.4)] animate-pulse">
                      <span className="material-symbols-rounded text-white text-4xl">view_in_ar</span>
                   </div>
                </div>
             </div>
             
             {/* Text Status */}
             <div className="mt-8 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex flex-col items-center gap-1">
               <p className="text-secondary font-mono text-xs tracking-[0.2em] uppercase font-bold text-shadow">
                 {processText}
               </p>
               <div className="flex gap-1 h-1">
                 <div className="w-1 bg-white/50 animate-[bounce_1s_infinite]"></div>
                 <div className="w-1 bg-white/50 animate-[bounce_1s_infinite_0.1s]"></div>
                 <div className="w-1 bg-white/50 animate-[bounce_1s_infinite_0.2s]"></div>
               </div>
             </div>
           </div>
         )}

         {/* Focus Reticle (Live Mode) */}
         {!capturedImage && !analyzing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 relative opacity-60">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/50 rounded-full"></div>
              </div>
              <p className="absolute bottom-32 text-white/50 text-[10px] tracking-widest uppercase font-bold">对准主体 · 点击识别</p>
            </div>
         )}
       </div>

       {/* Bottom Controls Area */}
       {!result && (
         <div className="h-40 bg-black flex items-center justify-around px-8 pb-6 z-20 relative">
            <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-transparent to-black pointer-events-none -translate-y-full"></div>
            
            {/* Gallery */}
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform w-16">
               <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                 <span className="material-symbols-rounded text-white text-[20px]">photo_library</span>
               </div>
               <span className="text-[10px] text-gray-400 font-bold">导入</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept="image/*" hidden />

            {/* Shutter Button */}
            <button 
              onClick={handleCapture}
              disabled={analyzing}
              className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 relative group"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] group-active:scale-90 transition-transform duration-200"></div>
            </button>

            {/* History */}
            <button onClick={() => navigate(AppView.LIBRARY)} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform w-16">
               <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                 <span className="material-symbols-rounded text-white text-[20px]">history</span>
               </div>
               <span className="text-[10px] text-gray-400 font-bold">历史</span>
            </button>
         </div>
       )}

       {/* ---------------- RESULT SHEET ---------------- */}
       {result && (
         <div className="absolute bottom-0 left-0 right-0 z-40 h-[80vh] flex flex-col animate-slide-up">
            {/* Floating Action Button (Close) */}
            <div className="absolute -top-16 right-4 z-50">
               <button onClick={resetScanner} className="w-12 h-12 bg-black/50 backdrop-blur-md border border-white/20 rounded-full text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                  <span className="material-symbols-rounded">refresh</span>
               </button>
            </div>

            <div className="flex-1 bg-white rounded-t-[2rem] shadow-[0_-10px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative">
                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={resetScanner}>
                   <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">
                   {/* Header Section */}
                   <div className="mt-2 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="px-2 py-0.5 rounded-md bg-orange-50 text-primary border border-orange-100 text-[10px] font-bold uppercase tracking-wider">
                           {result.category}
                         </span>
                         {result.scientificName && (
                           <span className="text-[10px] text-slate-400 font-serif italic">{result.scientificName}</span>
                         )}
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight mb-4">{result.name}</h2>
                      
                      {/* Attributes Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-6">
                         {result.attributes.map((attr, idx) => (
                           <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                              <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">{attr.label}</div>
                              <div className="text-xs font-bold text-slate-700 truncate">{attr.value}</div>
                           </div>
                         ))}
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed text-justify font-medium">
                        {result.description}
                      </p>
                   </div>

                   {/* Fun Fact */}
                   <div className="bg-gradient-to-br from-[#195de6] to-[#60a5fa] p-5 rounded-2xl text-white shadow-lg shadow-blue-500/20 mb-6 relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-10">
                         <span className="material-symbols-rounded text-[100px]">auto_awesome</span>
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                           <span className="material-symbols-rounded text-sm">lightbulb</span>
                           <span className="text-[10px] font-bold uppercase tracking-widest">知识拓展</span>
                        </div>
                        <p className="text-sm font-bold leading-relaxed">{result.funFact}</p>
                      </div>
                   </div>

                   {/* Actions */}
                   {result.name === '识别中断' ? (
                       <div className="mb-8">
                           <button 
                             onClick={resetScanner}
                             className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                           >
                             <span className="material-symbols-rounded">refresh</span>
                             重新识别
                           </button>
                       </div>
                   ) : (
                       <div className="flex gap-3 mb-8">
                          <button 
                            onClick={saveResult}
                            disabled={isSaved}
                            className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95
                            ${isSaved ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-ink text-white shadow-lg'}`}
                          >
                            <span className="material-symbols-rounded text-[18px]">{isSaved ? 'check_circle' : 'bookmark'}</span>
                            {isSaved ? '已归档' : '存入知识库'}
                          </button>
                          <button className="h-12 w-12 rounded-xl border border-gray-200 flex items-center justify-center text-slate-600 active:bg-gray-50">
                            <span className="material-symbols-rounded">share</span>
                          </button>
                       </div>
                   )}
                </div>
            </div>
         </div>
       )}
    </div>
  );
};
