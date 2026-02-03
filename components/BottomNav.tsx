
import React from 'react';
import { AppView } from '../types';

interface BottomNavProps {
  currentView: AppView;
  navigate: (view: AppView) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, navigate }) => {
  // Hide bottom nav in Chat to allow full screen input and prevent blocking
  const isMainTab = [AppView.HOME, AppView.LIBRARY, AppView.PROFILE].includes(currentView);

  if (!isMainTab) return null;

  return (
    <div className="fixed bottom-6 left-0 w-full px-6 z-50 pointer-events-none">
      <nav className="mx-auto max-w-sm bg-white border-2 border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-[2.5rem] p-2 flex items-center justify-between pointer-events-auto">
        
        <NavButton 
          active={currentView === AppView.HOME} 
          onClick={() => navigate(AppView.HOME)} 
          icon="home" 
          color="text-secondary"
          bgColor="bg-secondary/10"
        />
        
        {/* Chat button navigates to Chat view, which then hides this nav bar */}
        <NavButton 
          active={currentView === AppView.CHAT} 
          onClick={() => navigate(AppView.CHAT)} 
          icon="smart_toy" 
          color="text-primary"
          bgColor="bg-primary/10"
        />

        <NavButton 
          active={currentView === AppView.LIBRARY} 
          onClick={() => navigate(AppView.LIBRARY)} 
          icon="star" 
          color="text-accent"
          bgColor="bg-accent/20"
        />
        
        <NavButton 
          active={currentView === AppView.PROFILE} 
          onClick={() => navigate(AppView.PROFILE)} 
          icon="face" 
          color="text-blueberry"
          bgColor="bg-blueberry/10"
        />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, color, bgColor }: any) => (
  <button 
    onClick={onClick}
    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90
      ${active ? `${bgColor} ${color} shadow-sm scale-110` : 'text-gray-300 hover:text-gray-400'}`}
  >
    <span className={`material-symbols-rounded text-[32px] ${active ? 'animate-pop-in' : ''}`}>
      {icon}
    </span>
    {active && <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-current"></span>}
  </button>
);
