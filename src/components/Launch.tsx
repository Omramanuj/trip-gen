import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Globe } from 'lucide-react';

interface LaunchProps {
  onNext: () => void;
}

export function Launch({ onNext }: LaunchProps) {
  const [stage, setStage] = useState(-1);
  const [launchTarget, setLaunchTarget] = useState<'internal' | 'marketplace' | null>(null);

  useEffect(() => {
    if (stage >= 0 && stage < 3) {
      const timer1 = setTimeout(() => setStage(1), 800);
      const timer2 = setTimeout(() => setStage(2), 1600);
      const timer3 = setTimeout(() => setStage(3), 2400);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [stage]);

  const handleStartLaunch = () => {
    setStage(0);
  };

  if (stage === -1) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        <div className="mb-4 text-center">
          <h2 className="font-serif text-3xl text-ink">Launch Configuration</h2>
          <p className="text-ink-muted mt-2 text-sm">Select where this role system should be activated.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <button 
            onClick={() => setLaunchTarget('internal')}
            className={`flex flex-col p-6 border text-left transition-all ${launchTarget === 'internal' ? 'bg-ink/5 border-ink' : 'bg-surface-card border-ink/10 hover:border-ink/30'}`}
          >
            <Briefcase className="w-6 h-6 mb-4 text-ink" />
            <h3 className="font-medium text-lg text-ink mb-1">Internal Teams</h3>
            <p className="text-sm text-ink-muted leading-relaxed">Launch to in-house recruitment and internal referral programs only.</p>
          </button>

          <button 
            onClick={() => setLaunchTarget('marketplace')}
            className={`flex flex-col p-6 border text-left transition-all ${launchTarget === 'marketplace' ? 'bg-ink/5 border-ink' : 'bg-surface-card border-ink/10 hover:border-ink/30'}`}
          >
            <Globe className="w-6 h-6 mb-4 text-ink" />
            <h3 className="font-medium text-lg text-ink mb-1">Marketplace (Vendors)</h3>
            <p className="text-sm text-ink-muted leading-relaxed">Engage specialized external partners and agencies to source candidates.</p>
          </button>
        </div>

        <AnimatePresence>
          {launchTarget === 'marketplace' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-surface-card border border-ink/10 p-6 flex flex-col gap-4">
                <h4 className="font-serif text-lg text-ink border-b border-ink/10 pb-3 mb-2">Commercial & Admin Terms</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-ink-muted">CTC Range</label>
                    <input type="text" defaultValue="45-55 LPA" className="w-full bg-transparent border border-ink/20 px-3 py-2 text-sm font-sans outline-none focus:border-ink/50" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-ink-muted">Commission (%)</label>
                    <input type="text" defaultValue="8.33" className="w-full bg-transparent border border-ink/20 px-3 py-2 text-sm font-sans outline-none focus:border-ink/50" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-ink-muted">Payout Duration</label>
                    <input type="text" defaultValue="90 days post joining" className="w-full bg-transparent border border-ink/20 px-3 py-2 text-sm font-sans outline-none focus:border-ink/50" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-ink-muted">Replacement Clause</label>
                    <input type="text" defaultValue="90 day replacement guarantee" className="w-full bg-transparent border border-ink/20 px-3 py-2 text-sm font-sans outline-none focus:border-ink/50" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end mt-4">
          <button 
            disabled={!launchTarget}
            onClick={handleStartLaunch}
            className={`px-6 py-2.5 font-sans text-sm font-medium transition-colors shadow-sm ${launchTarget ? 'bg-ink text-base hover:bg-ink/90' : 'bg-ink/10 text-ink-muted cursor-not-allowed'}`}
          >
            Launch Role System
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center gap-8">
      <div className="flex gap-1 mb-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ height: 4, opacity: 0.2 }}
            animate={{ 
              height: stage > i ? 24 : 4, 
              opacity: stage > i ? 1 : 0.2,
              backgroundColor: stage > i ? 'var(--color-ink)' : 'var(--color-ink)'
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-8 bg-ink"
          />
        ))}
      </div>

      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-3xl text-ink"
      >
        {stage >= 3 ? 'Role System Activated' : 'System Initializing...'}
      </motion.h2>

      <div className="flex flex-col gap-4 text-left w-full max-w-md mt-8 border border-ink/10 p-6 bg-surface-card">
        <div className="flex items-center justify-between">
          <div className={`font-mono text-xs uppercase tracking-wider ${stage >= 1 ? 'text-ink' : 'text-ink-faint'}`}>
            Crystallized brief
          </div>
          <div className={`font-mono text-xs ${stage >= 1 ? 'text-green-600' : 'text-ink-faint'}`}>
            {stage >= 1 ? 'PUBLISHED' : 'PENDING'}
          </div>
        </div>
        <div className="w-full h-[1px] bg-ink/5"></div>
        <div className="flex items-center justify-between">
          <div className={`font-mono text-xs uppercase tracking-wider ${stage >= 2 ? 'text-ink' : 'text-ink-faint'}`}>
            Signal Journeys (2)
          </div>
          <div className={`font-mono text-xs ${stage >= 2 ? 'text-green-600' : 'text-ink-faint'}`}>
            {stage >= 2 ? 'DEPLOYED' : 'PENDING'}
          </div>
        </div>
        <div className="w-full h-[1px] bg-ink/5"></div>
        <div className="flex items-center justify-between">
          <div className={`font-mono text-xs uppercase tracking-wider ${stage >= 3 ? 'text-ink' : 'text-ink-faint'}`}>
            Sourcing channels {launchTarget === 'marketplace' ? '(Vendors active)' : '(Internal only)'}
          </div>
          <div className={`font-mono text-xs ${stage >= 3 ? 'text-green-600' : 'text-ink-faint'}`}>
            {stage >= 3 ? 'ACTIVATED' : 'PENDING'}
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 3 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="mt-12 flex justify-end w-full max-w-md"
      >
        <button 
          onClick={onNext}
          className="px-6 py-2 bg-ink text-base font-sans text-sm font-medium hover:bg-ink/90 transition-colors shadow-sm"
        >
          Go to Command Surface
        </button>
      </motion.div>
    </div>
  );
}

