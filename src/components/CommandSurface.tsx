import React, { useState } from 'react';
import { MentalMode, UserRole } from '../types';
import { TopBar } from './TopBar';
import { LeftRail } from './LeftRail';
import { RightRail } from './RightRail';
import { CenterCanvas } from './CenterCanvas';
import { VendorPipeline } from './VendorPipeline';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';

interface CommandSurfaceProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export function CommandSurface({ userRole, setUserRole }: CommandSurfaceProps) {
  const [mode, setMode] = useState<MentalMode>('SOURCE');
  const [leftRailOpen, setLeftRailOpen] = useState(true);
  const [rightRailOpen, setRightRailOpen] = useState(true);

  return (
    <div className="flex-1 flex flex-col bg-base text-ink font-sans selection:bg-ink selection:text-base overflow-hidden">
      {/* Custom TopBar for Command Surface */}
      <header className="w-full h-14 border-b border-ink/10 flex items-center justify-between px-6 bg-base sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4">
          {userRole === 'HM' && (
            <button 
              onClick={() => setLeftRailOpen(!leftRailOpen)}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-ink/5 rounded-md transition-colors"
              title={leftRailOpen ? "Collapse Left Panel" : "Expand Left Panel"}
            >
              {leftRailOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
          )}
          <div className="flex flex-col justify-center">
            <div className="text-sm font-medium text-ink leading-tight">Senior Backend Engineer — Payments</div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-ink-muted uppercase tracking-widest leading-tight">
              <span className="text-signal-verified">ACTIVE</span>
              <span>· 12 days live</span>
              {userRole === 'HM' && <span>· 3 branches</span>}
            </div>
          </div>
        </div>
        
        {userRole === 'HM' && (
          <div className="flex items-center bg-surface-card rounded-md p-1 border border-ink/5">
            {(['DEFINE', 'SOURCE', 'EVALUATE', 'CLOSE'] as MentalMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors ${
                  mode === m 
                    ? 'bg-ink/5 text-ink font-medium' 
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">View As:</span>
            <button 
              onClick={() => setUserRole('HM')}
              className={`text-xs font-medium px-2 py-1 rounded-sm transition-colors ${userRole === 'HM' ? 'bg-ink/10 text-ink' : 'text-ink-muted hover:text-ink'}`}
            >
              HM
            </button>
            <button 
              onClick={() => setUserRole('VENDOR')}
              className={`text-xs font-medium px-2 py-1 rounded-sm transition-colors ${userRole === 'VENDOR' ? 'bg-ink/10 text-ink' : 'text-ink-muted hover:text-ink'}`}
            >
              Vendor
            </button>
          </div>
          <div className="w-2 h-2 rounded-full bg-signal-verified"></div>
          <div className="w-8 h-8 rounded-full bg-surface-card border border-ink/10 flex items-center justify-center text-[10px] font-mono text-ink-muted">
            {userRole === 'VENDOR' ? 'VD' : 'HM'}
          </div>
          {userRole === 'HM' && (
            <button 
              onClick={() => setRightRailOpen(!rightRailOpen)}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-ink/5 rounded-md transition-colors"
              title={rightRailOpen ? "Collapse Right Panel" : "Expand Right Panel"}
            >
              {rightRailOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {userRole === 'HM' ? (
          <>
            {leftRailOpen && <LeftRail />}
            <CenterCanvas mode={mode} />
            {rightRailOpen && <RightRail />}
          </>
        ) : (
          <VendorPipeline />
        )}
      </div>
    </div>
  );
}
