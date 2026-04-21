import React from 'react';
import { Phase } from '../types';

interface PhaseIndicatorProps {
  currentPhase: Phase;
  setPhase: (phase: Phase) => void;
}

const PHASES: { id: Phase; label: string }[] = [
  { id: 'EXPRESS', label: 'Express' },
  { id: 'PROMPT_LAB', label: 'Prompt Lab' },
  { id: 'CRYSTALLIZE', label: 'Fine Tune' },
  { id: 'JOURNEY_OUTREACH', label: 'Outreach' },
  { id: 'EVALUATION_JOURNEYS', label: 'Evaluation Journeys' },
  { id: 'PREVIEW', label: 'Preview' },
  { id: 'LAUNCHED', label: 'Launch' },
];

export function PhaseIndicator({ currentPhase, setPhase }: PhaseIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      {PHASES.map((phase, index) => {
        const isActive = phase.id === currentPhase;
        const isPast = PHASES.findIndex(p => p.id === currentPhase) > index;
        
        return (
          <React.Fragment key={phase.id}>
            <button 
              onClick={() => setPhase(phase.id)}
              className={`transition-colors duration-200 ${
                isActive 
                  ? 'text-ink font-medium border-b border-ink pb-0.5' 
                  : isPast 
                    ? 'text-ink-muted hover:text-ink' 
                    : 'text-ink-faint hover:text-ink-muted'
              }`}
            >
              {phase.label}
            </button>
            {index < PHASES.length - 1 && (
              <span className="text-ink-faint/30">→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
