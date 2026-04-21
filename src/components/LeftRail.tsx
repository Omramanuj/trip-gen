import React from 'react';
import { Edit2 } from 'lucide-react';

export function LeftRail() {
  return (
    <aside className="w-[220px] shrink-0 border-r border-ink/10 bg-base/50 h-full overflow-y-auto p-5 flex flex-col gap-8 custom-scrollbar">
      
      {/* Action Expected */}
      <section>
        <div className="flex justify-between items-center mb-3 border-b border-ink/10 pb-1">
          <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">Action Expected</h3>
        </div>
        <div className="flex flex-col gap-3 text-xs">
          <div className="border border-ink/20 rounded-sm p-2 bg-surface-card">
            <div className="font-medium text-ink mb-1">Candidate A</div>
            <div className="text-ink/80 mb-2">Review Evidence Pack</div>
            <button className="text-[10px] bg-ink text-base px-2 py-1 rounded-sm hover:bg-ink/90 transition-colors w-full">Review</button>
          </div>
          <div className="border border-signal-weak/30 rounded-sm p-2 bg-signal-weak/5">
            <div className="font-medium text-ink mb-1">Candidate F</div>
            <div className="text-ink/80 mb-2">Resolve Overlap</div>
            <button className="text-[10px] border border-ink/20 text-ink px-2 py-1 rounded-sm hover:bg-ink/5 transition-colors w-full">Resolve</button>
          </div>
        </div>
      </section>

      {/* Role Health */}
      <section>
        <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-3 border-b border-ink/10 pb-1">Role Health</h3>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-mono text-ink-muted">Fillability</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-signal-verified"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-signal-verified"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-signal-verified"></div>
              <div className="w-1.5 h-1.5 rounded-full border border-ink/20"></div>
              <div className="w-1.5 h-1.5 rounded-full border border-ink/20"></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-ink-muted">Urgency</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-signal-weak"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-signal-weak"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-signal-weak"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-signal-weak"></div>
              <div className="w-1.5 h-1.5 rounded-full border border-ink/20"></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-ink-muted">Market diff.</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-signal-inferred"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-signal-inferred"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-signal-inferred"></div>
              <div className="w-1.5 h-1.5 rounded-full border border-ink/20"></div>
              <div className="w-1.5 h-1.5 rounded-full border border-ink/20"></div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="font-mono text-ink-muted">Days active</span>
            <span className="font-mono">12</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-ink-muted">Days remaining</span>
            <span className="font-mono">30</span>
          </div>
        </div>
      </section>

      {/* Constraints */}
      <section>
        <div className="flex justify-between items-center mb-3 border-b border-ink/10 pb-1 group">
          <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">Constraints</h3>
          <button className="text-ink-muted hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="w-3 h-3" /></button>
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-start gap-2 cursor-pointer hover:text-ink text-ink/80 transition-colors">
            <div className="w-2 h-2 bg-ink mt-1 shrink-0"></div>
            <span>Bangalore only</span>
          </div>
          <div className="flex items-start gap-2 cursor-pointer hover:text-ink text-ink/80 transition-colors">
            <div className="w-2 h-2 bg-ink mt-1 shrink-0"></div>
            <span>Payment systems exp.</span>
          </div>
          <div className="flex items-start gap-2 cursor-pointer hover:text-ink text-ink/80 transition-colors">
            <div className="w-2 h-2 bg-ink mt-1 shrink-0"></div>
            <span>Series B/C background</span>
          </div>
          <div className="flex items-start gap-2 cursor-pointer hover:text-ink text-ink/80 transition-colors">
            <div className="w-2 h-2 border border-ink mt-1 shrink-0"></div>
            <span>Fintech preferred</span>
          </div>
          <div className="flex items-start gap-2 cursor-pointer hover:text-ink text-ink/80 transition-colors">
            <div className="w-2 h-2 border border-ink mt-1 shrink-0"></div>
            <span>45-55L range</span>
          </div>
        </div>
      </section>

      {/* Commercial */}
      <section>
        <div className="flex justify-between items-center mb-3 border-b border-ink/10 pb-1 group">
          <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">Commercial</h3>
          <button className="text-ink-muted hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="w-3 h-3" /></button>
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Fee structure</span>
            <span className="font-mono">% of CTC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Commission</span>
            <span className="font-mono">8.33%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Payment terms</span>
            <span className="font-mono">30 days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Guarantee</span>
            <span className="font-mono">90 days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-muted">Vendor slots</span>
            <span className="font-mono">3 of 5</span>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section>
        <div className="flex justify-between items-center mb-3 border-b border-ink/10 pb-1 group">
          <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">Branches</h3>
          <button className="text-ink-muted hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="w-3 h-3" /></button>
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between items-center cursor-pointer hover:text-ink text-ink/80">
            <span className="flex items-center gap-1"><span className="text-[8px]">▸</span> Internal Team</span>
            <span className="font-mono text-ink-muted">4</span>
          </div>
          <div className="flex justify-between items-center cursor-pointer hover:text-ink text-ink/80">
            <span className="flex items-center gap-1"><span className="text-[8px]">▸</span> TalentBridge</span>
            <span className="font-mono text-ink-muted">7</span>
          </div>
          <div className="flex justify-between items-center cursor-pointer hover:text-ink text-ink/80">
            <span className="flex items-center gap-1"><span className="text-[8px]">▸</span> HireWell</span>
            <span className="font-mono text-ink-muted">2</span>
          </div>
          
          <div className="mt-2 pt-2 border-t border-ink/5 flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Total unique</span>
              <span className="font-mono">11</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Overlaps</span>
              <span className="font-mono text-signal-weak">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Submitted</span>
              <span className="font-mono">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">In evaluation</span>
              <span className="font-mono">3</span>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section>
        <div className="flex justify-between items-center mb-3 border-b border-ink/10 pb-1 group">
          <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">Timeline</h3>
          <button className="text-ink-muted hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="w-3 h-3" /></button>
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between items-start">
            <span className="text-ink-muted">Launched</span>
            <span className="font-mono text-right">Mar 29</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-ink-muted">Target close</span>
            <span className="font-mono text-right">May 10</span>
          </div>
          <div className="flex justify-between items-start mt-1">
            <span className="text-ink-muted">Next milestone</span>
            <span className="text-right">Journey A results<br/><span className="font-mono text-ink-muted">Apr 14</span></span>
          </div>
        </div>
      </section>

    </aside>
  );
}
