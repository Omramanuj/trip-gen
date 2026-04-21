import React, { useState } from 'react';

type VendorStage = 'Prospect' | 'Interested' | 'Ready to Submit' | 'Client Eval';

interface VendorCandidate {
  id: string;
  name: string;
  headline: string;
  stage: VendorStage;
  notes?: string;
  submittedAt?: string;
  tripStatus?: string;
}

const INITIAL_CANDIDATES: VendorCandidate[] = [
  { id: '1', name: 'Alex Chen', headline: '5 yrs · Stripe', stage: 'Prospect' },
  { id: '2', name: 'Sam Taylor', headline: '7 yrs · Square', stage: 'Interested' },
  { id: '3', name: 'Candidate A', headline: '8 yrs · Razorpay', stage: 'Ready to Submit', notes: '✓ Screening notes added' },
  { id: '4', name: 'Candidate B', headline: 'Submitted Apr 1', stage: 'Client Eval', tripStatus: 'Journey A in progress' },
];

const STAGES: VendorStage[] = ['Prospect', 'Interested', 'Ready to Submit', 'Client Eval'];

export function VendorPipeline() {
  const [candidates, setCandidates] = useState<VendorCandidate[]>(INITIAL_CANDIDATES);

  const moveCandidate = (id: string, newStage: VendorStage) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, stage: newStage } : c));
  };

  const addCandidate = () => {
    const newCandidate: VendorCandidate = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Candidate',
      headline: 'Unknown background',
      stage: 'Prospect'
    };
    setCandidates(prev => [...prev, newCandidate]);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-base">
      {/* Vendor Left Rail */}
      <aside className="w-[220px] shrink-0 border-r border-ink/10 bg-base h-full overflow-y-auto p-5 flex flex-col gap-8 custom-scrollbar">
        <section>
          <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-3 border-b border-ink/10 pb-1">Active Roles</h3>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between items-center cursor-pointer text-ink font-medium">
              <span>Senior Backend Eng</span>
              <span className="font-mono text-ink-muted">{candidates.length}</span>
            </div>
            <div className="flex justify-between items-center cursor-pointer hover:text-ink text-ink/60 transition-colors">
              <span>Product Manager</span>
              <span className="font-mono text-ink-muted">2</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-3 border-b border-ink/10 pb-1">Actions</h3>
          <div className="flex flex-col gap-2 text-xs">
            <button onClick={addCandidate} className="text-left text-ink/80 hover:text-ink transition-colors">+ Add Candidate</button>
            <button className="text-left text-ink/80 hover:text-ink transition-colors">Bulk Import</button>
          </div>
        </section>
      </aside>

      {/* Vendor Center Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Role Brief Header */}
        <div className="border-b border-ink/10 p-6 bg-base/50 shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-serif text-xl mb-1">Senior Backend Engineer — Payments</h2>
              <div className="text-xs font-mono text-ink-muted">Client: Acme Corp · 45-55L · Bangalore (Hybrid)</div>
            </div>
            <button className="text-xs font-medium text-ink border border-ink/20 px-3 py-1.5 rounded-sm hover:bg-ink/5 transition-colors">
              View Full Brief
            </button>
          </div>
          <div className="text-sm text-ink/80 max-w-3xl">
            <span className="font-medium text-ink">Quality Bar:</span> Must include screening notes, verify current employment, and assess location flexibility before submission.
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto p-6 custom-scrollbar">
          <div className="flex gap-6 h-full min-w-max">
            
            {STAGES.map(stage => {
              const stageCandidates = candidates.filter(c => c.stage === stage);
              return (
                <div key={stage} className="w-72 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-2">
                    <span>{stage}</span>
                    <span>{stageCandidates.length}</span>
                  </div>
                  
                  {stageCandidates.map(candidate => (
                    <div key={candidate.id} className={`border border-ink/10 rounded-sm p-4 bg-surface-card hover:border-ink/30 transition-colors ${stage === 'Client Eval' ? 'opacity-70' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-sm">{candidate.name}</div>
                        <select 
                          value={candidate.stage}
                          onChange={(e) => moveCandidate(candidate.id, e.target.value as VendorStage)}
                          className="text-[10px] bg-transparent border border-ink/20 rounded-sm text-ink-muted outline-none cursor-pointer"
                        >
                          {STAGES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="text-xs text-ink-muted mb-3">{candidate.headline}</div>
                      
                      {candidate.notes && <div className="text-xs text-signal-verified mb-3">{candidate.notes}</div>}
                      {candidate.tripStatus && <div className="text-[10px] font-mono text-ink-muted mb-2">{candidate.tripStatus}</div>}
                      
                      {stage !== 'Client Eval' && (
                        <div className="flex gap-2">
                          {stage === 'Prospect' && (
                            <button onClick={() => moveCandidate(candidate.id, 'Interested')} className="text-[10px] bg-ink/5 hover:bg-ink/10 px-2 py-1 rounded-sm transition-colors">Reach Out</button>
                          )}
                          {stage === 'Interested' && (
                            <button onClick={() => moveCandidate(candidate.id, 'Ready to Submit')} className="text-[10px] bg-ink/5 hover:bg-ink/10 px-2 py-1 rounded-sm transition-colors">Screen</button>
                          )}
                          {stage === 'Ready to Submit' && (
                            <button onClick={() => moveCandidate(candidate.id, 'Client Eval')} className="text-[10px] bg-ink text-base hover:bg-ink/90 px-3 py-1 rounded-sm transition-colors w-full">Submit to Client</button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}

          </div>
        </div>
      </main>

      {/* Vendor Right Rail (Agent) */}
      <aside className="w-[280px] shrink-0 border-l border-ink/10 bg-base/50 h-full overflow-y-auto p-5 flex flex-col gap-8 custom-scrollbar">
        <section>
          <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-3 border-b border-ink/10 pb-1">Agent Actions</h3>
          <div className="flex flex-col gap-2 text-xs">
            <button className="text-left p-2 hover:bg-ink/5 rounded-sm transition-colors border border-transparent hover:border-ink/10">
              <div className="font-medium mb-1">Draft Outreach</div>
              <div className="text-ink-muted">Generate personalized messages for {candidates.filter(c => c.stage === 'Prospect').length} prospects</div>
            </button>
            <button className="text-left p-2 hover:bg-ink/5 rounded-sm transition-colors border border-transparent hover:border-ink/10">
              <div className="font-medium mb-1">Follow-up</div>
              <div className="text-ink-muted">Send reminders to {candidates.filter(c => c.stage === 'Interested').length} candidate(s)</div>
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}
