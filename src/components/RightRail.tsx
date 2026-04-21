import React from 'react';

export function RightRail() {
  return (
    <aside className="w-[280px] shrink-0 border-l border-ink/10 bg-base/50 h-full overflow-y-auto p-5 flex flex-col gap-8 custom-scrollbar">
      
      {/* Recent Changes */}
      <section>
        <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-3 border-b border-ink/10 pb-1">Recent Changes</h3>
        
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-[10px] font-mono text-ink-muted mb-2">TODAY</div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-start gap-2 cursor-pointer hover:text-ink text-ink/80">
                <span>TalentBridge submitted 3</span>
                <span className="font-mono text-[10px] text-ink-muted shrink-0 mt-0.5">2h ago</span>
              </div>
              <div className="flex justify-between items-start gap-2 cursor-pointer hover:text-ink text-ink/80">
                <span>Candidate A journey complete</span>
                <span className="font-mono text-[10px] text-ink-muted shrink-0 mt-0.5">4h ago</span>
              </div>
              <div className="flex justify-between items-start gap-2 cursor-pointer border-l-2 border-signal-weak pl-2 -ml-[2px] text-ink font-medium">
                <span>Overlap detected (Cand F)</span>
                <span className="font-mono text-[10px] text-ink-muted shrink-0 mt-0.5">4h ago</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-[10px] font-mono text-ink-muted mb-2">YESTERDAY</div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-start gap-2 cursor-pointer hover:text-ink text-ink/80">
                <span>HireWell asked clarification</span>
                <span className="font-mono text-[10px] text-ink-muted shrink-0 mt-0.5">1d ago</span>
              </div>
              <div className="flex justify-between items-start gap-2 cursor-pointer hover:text-ink text-ink/80">
                <span>Internal Team screened 2</span>
                <span className="font-mono text-[10px] text-ink-muted shrink-0 mt-0.5">1d ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Activity */}
      <section>
        <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-3 border-b border-ink/10 pb-1">Agent Activity</h3>
        <div className="flex flex-col gap-4 text-xs">
          <div className="flex gap-2 cursor-pointer group">
            <span className="text-[10px] mt-0.5 text-ink-muted group-hover:text-ink transition-colors">▸</span>
            <div className="flex flex-col gap-1">
              <span className="text-ink/90">Generated outreach v2 for LinkedIn campaign</span>
              <span className="text-ink-muted text-[10px]">based on: attraction narrative update</span>
              <span className="font-mono text-[10px] text-signal-verified">ready</span>
            </div>
          </div>
          
          <div className="flex gap-2 cursor-pointer group">
            <span className="text-[10px] mt-0.5 text-ink-muted group-hover:text-ink transition-colors">▸</span>
            <div className="flex flex-col gap-1">
              <span className="text-ink/90">Synthesized Journey A evidence for Candidate A</span>
              <span className="text-ink-muted text-[10px]">confidence: high</span>
              <span className="font-mono text-[10px] text-signal-verified">ready</span>
            </div>
          </div>
          
          <div className="flex gap-2 cursor-pointer group border-l-2 border-signal-weak pl-2 -ml-[2px]">
            <span className="text-[10px] mt-0.5 text-ink-muted group-hover:text-ink transition-colors">▸</span>
            <div className="flex flex-col gap-1">
              <span className="text-ink font-medium">Detected compensation misalignment with market for 2 new candidates</span>
              <span className="font-mono text-[10px] text-signal-weak">review</span>
            </div>
          </div>
        </div>
      </section>

      {/* Suggestions */}
      <section>
        <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-3 border-b border-ink/10 pb-1">Suggestions</h3>
        <div className="flex flex-col gap-4 text-xs">
          <div className="flex gap-2 cursor-pointer hover:text-ink text-ink/80 transition-colors">
            <span className="text-ink-muted mt-0.5">→</span>
            <p className="leading-relaxed">3 candidates have completed Journey A. Review evidence packs to keep pipeline moving.</p>
          </div>
          <div className="flex gap-2 cursor-pointer hover:text-ink text-ink/80 transition-colors">
            <span className="text-ink-muted mt-0.5">→</span>
            <p className="leading-relaxed">HireWell's submission rate is low (2 in 12 days). Consider checking in or adjusting their brief.</p>
          </div>
          <div className="flex gap-2 cursor-pointer hover:text-ink text-ink/80 transition-colors">
            <span className="text-ink-muted mt-0.5">→</span>
            <p className="leading-relaxed">Candidate overlap between Internal and TalentBridge needs provenance resolution.</p>
          </div>
        </div>
      </section>

      {/* Confidence Shifts */}
      <section>
        <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-3 border-b border-ink/10 pb-1">Confidence Changes</h3>
        <div className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1">
            <span className="font-medium">Candidate A</span>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-ink-muted">Systems thinking</span>
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 bg-ink/30"></div>
                <div className="w-1.5 h-1.5 bg-ink/30"></div>
                <div className="w-1.5 h-1.5 border border-ink/20"></div>
                <div className="w-1.5 h-1.5 border border-ink/20"></div>
                <div className="w-1.5 h-1.5 border border-ink/20"></div>
              </div>
              <span className="text-ink-muted">→</span>
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 bg-signal-verified"></div>
                <div className="w-1.5 h-1.5 bg-signal-verified"></div>
                <div className="w-1.5 h-1.5 bg-signal-verified"></div>
                <div className="w-1.5 h-1.5 bg-signal-verified"></div>
                <div className="w-1.5 h-1.5 border border-ink/20"></div>
              </div>
            </div>
            <p className="text-ink-muted mt-1 leading-relaxed">moved from inferred to task-demonstrated after Journey B completion</p>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="font-medium">Role fillability</span>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 bg-ink/30"></div>
                <div className="w-1.5 h-1.5 bg-ink/30"></div>
                <div className="w-1.5 h-1.5 border border-ink/20"></div>
                <div className="w-1.5 h-1.5 border border-ink/20"></div>
                <div className="w-1.5 h-1.5 border border-ink/20"></div>
              </div>
              <span className="text-ink-muted">→</span>
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 bg-signal-verified"></div>
                <div className="w-1.5 h-1.5 bg-signal-verified"></div>
                <div className="w-1.5 h-1.5 bg-signal-verified"></div>
                <div className="w-1.5 h-1.5 border border-ink/20"></div>
                <div className="w-1.5 h-1.5 border border-ink/20"></div>
              </div>
            </div>
            <p className="text-ink-muted mt-1 leading-relaxed">improved after location constraint relaxed to include hybrid</p>
          </div>
        </div>
      </section>

    </aside>
  );
}
