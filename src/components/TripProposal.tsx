import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TripProposalData } from '../types';
import { Check, X, Edit2, ArrowRight } from 'lucide-react';

interface TripProposalProps {
  trips: TripProposalData[];
  setTrips: React.Dispatch<React.SetStateAction<TripProposalData[]>>;
  onNext: () => void;
}

export function TripProposal({ trips, setTrips, onNext }: TripProposalProps) {
  const [hrEmail, setHrEmail] = useState('');
  const [appForm, setAppForm] = useState({
    resume: true,
    linkedin: true,
    github: false,
    portfolio: false,
    customQuestions: [
      { id: 1, text: 'Why are you interested in this role?', type: 'audio' }
    ]
  });

  const handleAction = (id: string, action: 'included' | 'removed') => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: action } : t));
  };

  const toggleAppForm = (field: keyof typeof appForm) => {
    if (field === 'customQuestions') return;
    setAppForm(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const addCustomQuestion = () => {
    setAppForm(prev => ({
      ...prev,
      customQuestions: [...prev.customQuestions, { id: Date.now(), text: '', type: 'audio' }]
    }));
  };

  const updateCustomQuestion = (id: number, text: string) => {
    setAppForm(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.map(q => q.id === id ? { ...q, text } : q)
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto flex flex-col gap-12"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl text-ink">Candidate Journeys</h2>
          <p className="text-sm font-sans text-ink-muted">Based on this role's evaluation needs, here are the signal journeys we'd recommend.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Default Journey 1: Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-ink/10 p-6 transition-all hover:shadow-sm hover:border-ink/20 bg-surface-active/30"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-1">
              <div className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                JOURNEY 1 (DEFAULT)
              </div>
              <div className="font-sans text-lg font-medium text-ink">
                Application Form
              </div>
            </div>
            <div className="font-mono text-sm text-ink-muted">
              ~5 mins
            </div>
          </div>

          <p className="font-serif text-[15px] leading-relaxed text-ink mb-8 max-w-2xl">
            Purpose: Initial signal gathering and interest validation. This is the mandatory first step for all candidates.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pt-6 border-t border-ink/5">
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-ink-faint mb-4">Standard Fields</h4>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${appForm.resume ? 'bg-ink border-ink' : 'border-ink/30 group-hover:border-ink/50'}`}>
                    {appForm.resume && <Check className="w-3 h-3 text-base" />}
                  </div>
                  <span className="text-sm text-ink/90">Resume / CV</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${appForm.linkedin ? 'bg-ink border-ink' : 'border-ink/30 group-hover:border-ink/50'}`}>
                    {appForm.linkedin && <Check className="w-3 h-3 text-base" />}
                  </div>
                  <span className="text-sm text-ink/90">LinkedIn Profile</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleAppForm('github')}>
                  <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${appForm.github ? 'bg-ink border-ink' : 'border-ink/30 group-hover:border-ink/50'}`}>
                    {appForm.github && <Check className="w-3 h-3 text-base" />}
                  </div>
                  <span className="text-sm text-ink/90">GitHub Profile</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleAppForm('portfolio')}>
                  <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${appForm.portfolio ? 'bg-ink border-ink' : 'border-ink/30 group-hover:border-ink/50'}`}>
                    {appForm.portfolio && <Check className="w-3 h-3 text-base" />}
                  </div>
                  <span className="text-sm text-ink/90">Portfolio Link</span>
                </label>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-ink-faint">Custom Questions</h4>
                <button onClick={addCustomQuestion} className="text-[10px] font-mono text-ink-muted hover:text-ink transition-colors">+ Add</button>
              </div>
              <div className="flex flex-col gap-4">
                {appForm.customQuestions.map((q, idx) => (
                  <div key={q.id} className="flex flex-col gap-2">
                    <input 
                      type="text" 
                      value={q.text}
                      onChange={(e) => updateCustomQuestion(q.id, e.target.value)}
                      placeholder="Enter question..."
                      className="w-full bg-transparent border-b border-ink/20 pb-1 text-sm text-ink outline-none focus:border-ink/50 transition-colors"
                    />
                    <div className="flex items-center gap-2 text-[10px] font-mono text-ink-muted">
                      <span>Response format:</span>
                      <span className="px-1.5 py-0.5 bg-ink/5 rounded-sm">Audio Note (Max 2m)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {trips.filter(t => t.status !== 'removed').map((trip, i) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`border border-ink/10 p-6 transition-all hover:shadow-sm hover:border-ink/20 ${
              trip.status === 'included' ? 'bg-surface-active/30' : 'bg-surface-card'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <div className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
                  {trip.id.toUpperCase().replace('TRIP', 'JOURNEY ')}
                </div>
                <div className="font-sans text-lg font-medium text-ink">
                  {trip.title}
                </div>
              </div>
              <div className="font-mono text-sm text-ink-muted">
                {trip.duration}
              </div>
            </div>

            <p className="font-serif text-[15px] leading-relaxed text-ink mb-8 max-w-2xl">
              Purpose: {trip.purpose}
            </p>

            {/* Journey Visualization */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              {trip.blocks.map((block, idx) => (
                <React.Fragment key={block.id}>
                  <div className="px-4 py-2 border border-ink/20 bg-base font-mono text-xs text-ink">
                    {block.name}
                  </div>
                  {idx < trip.blocks.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-ink-faint" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-6 border-t border-ink/5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-faint mb-1">Signal Yield</div>
                <div className="text-xs font-sans text-ink-muted">
                  {trip.signals.join(' • ')}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-faint mb-1">Dropout Risk</div>
                <div className={`text-xs font-sans ${
                  trip.dropoutRisk === 'Low' ? 'text-green-600' :
                  trip.dropoutRisk === 'Medium' ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {trip.dropoutRisk}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-faint mb-1">Funnel Position</div>
                <div className="text-xs font-sans text-ink-muted">
                  {trip.funnelPosition}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-ink/5">
              <button 
                onClick={() => handleAction(trip.id, 'included')}
                className={`flex items-center gap-1.5 text-xs font-sans transition-colors ${
                  trip.status === 'included' ? 'text-green-600' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                Include
              </button>
              <button className="flex items-center gap-1.5 text-xs font-sans text-ink-muted hover:text-ink transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button 
                onClick={() => handleAction(trip.id, 'removed')}
                className="flex items-center gap-1.5 text-xs font-sans text-ink-muted hover:text-ink transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-end mt-8 gap-4">
        <div className="flex flex-col items-end gap-2">
          <span className="text-sm font-serif text-ink-muted italic">Done with the strategic input!</span>
          <div className="flex items-center gap-3">
            <input 
              type="email" 
              placeholder="HR Admin Email" 
              value={hrEmail}
              onChange={(e) => setHrEmail(e.target.value)}
              className="px-3 py-2 border border-ink/20 bg-transparent text-sm outline-none focus:border-ink/50 transition-colors w-64"
            />
            <button 
              onClick={onNext}
              disabled={!hrEmail}
              className={`px-6 py-2 text-base font-sans text-sm font-medium transition-colors ${
                hrEmail ? 'bg-ink text-base hover:bg-ink/90' : 'bg-ink/10 text-ink-muted cursor-not-allowed'
              }`}
            >
              Hand off to HR admin
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
