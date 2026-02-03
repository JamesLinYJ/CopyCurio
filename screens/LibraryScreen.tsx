
import React, { useEffect, useState } from 'react';
import { AppView, NavigationProps, LibraryItem } from '../types';
import { ASSETS } from '../assets';
import { StorageService } from '../utils/storage';

export const LibraryScreen: React.FC<NavigationProps> = ({ navigate }) => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const data = await StorageService.getLibrary();
        setItems(data);
      } catch (error) {
        console.error("Failed to load library:", error);
      }
    };
    fetchLibrary();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('确定删除吗？')) {
      const updated = await StorageService.deleteFromLibrary(id);
      setItems(updated);
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-[100dvh] w-full pb-28 font-display text-slate-900">
      <header className="sticky top-0 z-30 bg-[#f8f9fa]/90 backdrop-blur-md px-5 pt-12 pb-4 flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">我的收藏</h1>
        <span className="text-sm font-bold text-gray-400">{items.length} 项</span>
      </header>
      
      <main className="px-5 mt-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-60">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <span className="material-symbols-rounded text-4xl">bookmarks</span>
            </div>
            <p className="text-sm font-bold text-gray-500">这里空空如也</p>
            <p className="text-xs text-gray-400 mt-1">去探索并收藏一些内容吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
             {items.map((item) => (
               <article 
                 key={item.id} 
                 onClick={() => setSelectedItem(item)}
                 className="group flex flex-col bg-white rounded-[20px] p-2.5 shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer"
               >
                 <div className="aspect-[4/3] w-full overflow-hidden rounded-[16px] mb-3 relative bg-gray-100">
                   <img className="h-full w-full object-cover" src={item.thumbnail || ASSETS.thumb_quantum} alt={item.title} />
                   <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md">
                     <span className="text-[10px] font-bold text-white uppercase">{item.category}</span>
                   </div>
                 </div>
                 <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1 px-1 line-clamp-2">{item.title}</h4>
                 <div className="mt-auto px-1 pt-2 flex justify-between items-center opacity-60">
                   <span className="text-[10px] text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                   <button onClick={(e) => handleDelete(e, item.id)}>
                     <span className="material-symbols-rounded text-[16px]">delete</span>
                   </button>
                 </div>
               </article>
             ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
          <div className="bg-white w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="relative h-48 bg-gray-100">
              <img src={selectedItem.thumbnail || ASSETS.bg_card_default} className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/30 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/50"
              >
                <span className="material-symbols-rounded text-sm">close</span>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                 <span className="px-2 py-1 rounded-md bg-orange-50 text-[#f49d25] text-[10px] font-bold uppercase tracking-wider">{selectedItem.category}</span>
                 <span className="text-[10px] text-gray-400">{new Date(selectedItem.date).toLocaleDateString()}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-4 leading-tight">{selectedItem.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{selectedItem.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
