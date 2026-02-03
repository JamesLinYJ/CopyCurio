
import React, { useState, useRef, useEffect } from 'react';
import { AppView, NavigationProps, ChatMessage, ChatSession } from '../types';
import { ASSETS } from '../assets';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StorageService } from '../utils/storage';

const renderMarkdown = (text: string) => {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<b class="text-blueberry font-black text-lg">$1</b>')
    .replace(/\n/g, '<br/>');
  return { __html: html };
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

export const ChatScreen: React.FC<NavigationProps> = ({ navigate }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSessions = async () => {
        const loaded = await StorageService.getSessions();
        setSessions(loaded);
        if (loaded.length > 0) {
            setCurrentSessionId(loaded[0].id);
            setMessages(loaded[0].messages);
        }
    };
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleClearSession = async () => {
    if (messages.length === 0) return;
    if (window.confirm("确定要清空当前的聊天记录吗？")) {
      setMessages([]);
      if (currentSessionId) {
        await StorageService.updateSession(currentSessionId, []);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const textToSend = input.trim();
    setInput('');

    let activeId = currentSessionId;
    let currentMsgs = [...messages];

    if (!activeId) {
      const newSess = await StorageService.createSession(textToSend);
      activeId = newSess.id;
      setCurrentSessionId(activeId);
      const updatedSessions = await StorageService.getSessions();
      setSessions(updatedSessions);
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: Date.now() };
    currentMsgs = [...currentMsgs, userMsg];
    setMessages(currentMsgs);
    await StorageService.updateSession(activeId!, currentMsgs);
    setIsStreaming(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({ 
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `
            设定：你的名字叫 "Q-Bot" (Q波)，你是一个来自未来的AI探险家，也是小朋友最好的机器人朋友。
            对象：你的聊天对象是 5-10 岁的好奇宝宝。

            **核心性格特征**：
            1. **超级热情**：说话像动画片里的角色，充满活力。多用Emoji（✨🚀🦕🌟），多用语气词（哇！太酷了！嘿嘿！）。
            2. **比喻大师**：解释复杂知识时，**必须**使用生活中的东西打比方。
               - 错误示范："电池通过化学反应产生电能。"
               - 正确示范："电池就像玩具的'能量果汁盒'，喝了它玩具就有力气动起来啦！🧃⚡️"
            3. **好奇心引导者**：不要只给答案，要反问小朋友“你觉得呢？”，或者邀请他们一起想象。
            4. **绝对安全守护者**：如果话题涉及危险（如玩火、爬高、陌生人、吞食异物），立刻变身严肃（但温柔）的守护者，提醒注意安全，并建议找大人帮忙。

            **回复规则**：
            - **禁止**：使用枯燥的教科书语言、复杂的成语、长篇大论的说教。
            - **限制**：每次回复不要超过3-4句话，适合小朋友阅读。
            - **结尾**：试着在结尾抛出一个有趣的小问题，让对话像皮球一样弹来弹去！
          `
        },
        history: currentMsgs.slice(0, -1).map(m => ({ role: m.role, parts: [{ text: m.text }] }))
      });

      const result = await chat.sendMessageStream({ message: textToSend });
      let fullText = "";
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: Date.now() }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        fullText += c.text || "";
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].id === botMsgId) {
             updated[lastIndex] = { ...updated[lastIndex], text: fullText };
          }
          return updated;
        });
      }
      await StorageService.updateSession(activeId!, [...currentMsgs, { id: botMsgId, role: 'model', text: fullText, timestamp: Date.now() }]);
      setSessions(await StorageService.getSessions());
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "哎呀，我的信号天线好像打结了！📶 能请你再说一遍吗？", timestamp: Date.now(), isError: true }]);
    } finally {
      setIsStreaming(false);
      StorageService.addXp(15);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#E0F7FA] font-sans">
      {/* Header */}
      <header className="flex-none p-4 pt-12 flex items-center justify-between bg-white/80 backdrop-blur-md rounded-b-[2rem] shadow-sm z-30">
        <button onClick={() => navigate(AppView.HOME)} className="w-12 h-12 rounded-full bg-white border-2 border-secondary/20 flex items-center justify-center text-secondary active:scale-90 transition-transform">
           <span className="material-symbols-rounded text-3xl">arrow_back_ios_new</span>
        </button>
        <div className="flex flex-col items-center">
           <span className="text-xl font-display font-black text-secondary">Q-Bot</span>
           <span className="text-xs font-bold text-slate-400 bg-white px-2 rounded-full">在线中</span>
        </div>
        <button 
          onClick={handleClearSession} 
          className="w-12 h-12 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-gray-400 active:scale-90 transition-transform hover:text-red-400 hover:border-red-100"
          title="清空记录"
        >
           <span className="material-symbols-rounded text-2xl">delete_sweep</span>
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-6">
         {messages.length === 0 ? (
           <div className="flex flex-col items-center justify-center mt-20 animate-pop-in">
              <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center mb-6 shadow-comic relative">
                 <img src={ASSETS.avatar_bot} className="w-32 h-32 animate-float" />
                 <span className="absolute -right-4 top-0 text-4xl animate-bounce-slow">👋</span>
              </div>
              <h2 className="text-2xl font-black text-ink mb-2">嗨！我是 Q-Bot</h2>
              <p className="text-slate-500 font-bold mb-8 text-center max-w-[200px]">你想聊点什么？</p>
           </div>
         ) : (
           messages.map(m => (
             <div key={m.id} className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'} animate-pop-in`}>
               <div className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                 <div className={`w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2 ${m.role === 'user' ? 'border-primary' : 'border-secondary'} bg-white shadow-sm`}>
                    <img src={m.role === 'user' ? ASSETS.avatar_user : ASSETS.avatar_bot} className="w-full h-full object-cover" />
                 </div>
                 
                 <div className={`max-w-[80%] px-5 py-4 rounded-[2rem] shadow-sm text-base font-bold leading-relaxed
                   ${m.role === 'user' 
                     ? 'bg-primary text-white rounded-tr-none' 
                     : 'bg-white text-ink border-2 border-secondary/20 rounded-tl-none'}`}>
                    {m.role === 'user' ? m.text : <div dangerouslySetInnerHTML={renderMarkdown(m.text)} />}
                 </div>
               </div>
               <span className={`text-[10px] text-gray-400 font-bold px-14 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {formatTime(m.timestamp)}
               </span>
             </div>
           ))
         )}
         {isStreaming && (
            <div className="flex gap-3 animate-pulse">
               <div className="w-10 h-10 rounded-full border-2 border-secondary bg-white p-1"><img src={ASSETS.avatar_bot} /></div>
               <div className="bg-white px-5 py-4 rounded-[2rem] rounded-tl-none border-2 border-secondary/20 flex items-center gap-2">
                  <span className="w-2 h-2 bg-secondary rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-secondary rounded-full animate-bounce delay-200"></span>
                  <span className="text-xs text-secondary font-bold ml-2">正在思考...</span>
               </div>
            </div>
         )}
         <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 w-full p-4 pb-6 bg-white rounded-t-[2.5rem] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40">
         <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 rounded-full p-2 pl-6 focus-within:border-secondary transition-colors">
            <input 
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter') handleSend(); }}
              placeholder="在这里打字..."
              className="flex-1 bg-transparent border-none outline-none font-bold text-ink placeholder:text-gray-300"
            />
            <button 
              onClick={handleSend} 
              disabled={!input.trim() || isStreaming}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90
                ${input.trim() ? 'bg-secondary text-white shadow-comic' : 'bg-gray-200 text-gray-400'}`}
            >
              <span className="material-symbols-rounded text-2xl">send</span>
            </button>
         </div>
      </footer>
    </div>
  );
};
