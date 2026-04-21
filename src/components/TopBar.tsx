import React from 'react';
import { Phase, UserRole } from '../types';

interface TopBarProps {
  phase: Phase;
  userRole?: UserRole;
  setUserRole?: (role: UserRole) => void;
}

export function TopBar({ phase, userRole, setUserRole }: TopBarProps) {
  return (
    <header className="w-full h-16 border-b border-ink/10 flex items-center justify-between px-6 bg-base/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="font-serif font-semibold text-lg tracking-tight text-ink">Recruitment OS</div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-ink">Senior Backend Engineer</div>
        <div className="w-1 h-1 rounded-full bg-ink/20"></div>
        <div className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">{phase}</div>
      </div>
      
      <div className="flex items-center gap-4">
        {userRole && setUserRole && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">View As:</span>
            <button 
              onClick={() => setUserRole('HM')}
              className={`text-xs font-medium px-2 py-1 rounded-sm transition-colors ${userRole === 'HM' ? 'bg-ink/10 text-ink' : 'text-ink-muted hover:text-ink'}`}
            >
              Hiring Manager
            </button>
            <button 
              onClick={() => setUserRole('VENDOR')}
              className={`text-xs font-medium px-2 py-1 rounded-sm transition-colors ${userRole === 'VENDOR' ? 'bg-ink/10 text-ink' : 'text-ink-muted hover:text-ink'}`}
            >
              Vendor
            </button>
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-surface-card border border-ink/10 flex items-center justify-center text-[10px] font-mono text-ink-muted hover:text-ink hover:border-ink/30 transition-colors cursor-pointer">
          {userRole === 'VENDOR' ? 'VD' : 'HM'}
        </div>
      </div>
    </header>
  );
}
