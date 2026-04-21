import React, { useState } from 'react';
import { MentalMode } from '../types';
import { MOCK_CANDIDATES, MOCK_EVENTS } from '../mockCommandData';

interface CenterCanvasProps {
  mode: MentalMode;
}

export function CenterCanvas({ mode }: CenterCanvasProps) {
  if (mode === 'DEFINE') {
    return (
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-serif text-2xl mb-2">Living Brief</h2>
              <p className="text-ink-muted text-sm">The crystallized role system. Everything a recruiter needs to work on this mandate.</p>
            </div>
            <button className="text-xs font-medium text-ink border border-ink/20 px-3 py-1.5 rounded-sm hover:bg-ink/5 transition-colors">
              Export Brief
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="border border-ink/10 rounded-sm p-6 bg-surface-card hover:border-ink/30 transition-colors group">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-sm uppercase tracking-widest text-ink-muted group-hover:text-ink transition-colors">Candidate Portrait</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-ink-muted">edited 2 days ago</span>
                  <button className="text-ink-muted hover:text-ink text-xs underline">Edit</button>
                </div>
              </div>
              <p className="text-sm text-ink/90 leading-relaxed">
                We need a backend engineer who has built and scaled payment systems. They must understand idempotency, failure modes, and state machines from first principles. Capable of owning the entire domain and partnering with the CTO.
              </p>
            </div>

            <div className="border border-ink/10 rounded-sm p-6 bg-surface-card hover:border-ink/30 transition-colors group">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-sm uppercase tracking-widest text-ink-muted group-hover:text-ink transition-colors">Evaluation Logic</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-ink-muted">edited 12 days ago</span>
                  <button className="text-ink-muted hover:text-ink text-xs underline">Edit</button>
                </div>
              </div>
              <p className="text-sm text-ink/90 leading-relaxed">
                Focus on system design depth and stakeholder conflict navigation. Do not over-index on specific cloud provider knowledge.
              </p>
              <div className="mt-4 pt-4 border-t border-ink/5 flex flex-col gap-2">
                <div className="text-xs flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-signal-verified"></span> <strong>Journey 1:</strong> Application Form (CV, GitHub, 1 Custom Audio Q)</div>
                <div className="text-xs flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-signal-verified"></span> <strong>Journey 2:</strong> Intent & Context (Async)</div>
                <div className="text-xs flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-signal-verified"></span> <strong>Journey 3:</strong> System Design Proof (Live)</div>
              </div>
            </div>

            <div className="border border-ink/10 rounded-sm p-6 bg-surface-card hover:border-ink/30 transition-colors group">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-sm uppercase tracking-widest text-ink-muted group-hover:text-ink transition-colors">Search Strategy & Channels</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-ink-muted">edited 12 days ago</span>
                  <button className="text-ink-muted hover:text-ink text-xs underline">Edit</button>
                </div>
              </div>
              <p className="text-sm text-ink/90 leading-relaxed mb-3">
                Direct sourcing mid-stage fintechs. Focusing on Razorpay, Pine Labs, and similar environments.
              </p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-ink/5 text-xs rounded-sm">LinkedIn Direct</span>
                <span className="px-2 py-1 bg-ink/5 text-xs rounded-sm">Internal Referrals</span>
                <span className="px-2 py-1 bg-ink/5 text-xs rounded-sm">TalentBridge (Vendor)</span>
                <span className="px-2 py-1 bg-ink/5 text-xs rounded-sm">HireWell (Vendor)</span>
              </div>
            </div>

            <div className="border border-ink/10 rounded-sm p-6 bg-surface-card hover:border-ink/30 transition-colors group">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-sm uppercase tracking-widest text-ink-muted group-hover:text-ink transition-colors">Outreach Messaging</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-ink-muted">edited 5 days ago</span>
                  <button className="text-ink-muted hover:text-ink text-xs underline">Edit</button>
                </div>
              </div>
              <div className="bg-base p-4 border border-ink/5 text-sm text-ink/80 font-serif italic">
                "We are looking for a systems thinker to own our payment infrastructure from the ground up, working directly with our CTO. This is not a feature-building role; it is an architectural ownership opportunity..."
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (mode === 'SOURCE') {
    return (
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          
          {/* Pipeline Snapshot */}
          <div className="mb-12">
            <div className="flex items-center justify-between border border-ink/10 rounded-sm overflow-hidden">
              <div className="flex-1 p-4 text-center border-r border-ink/10 bg-base hover:bg-surface-hover cursor-pointer transition-colors">
                <div className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-2">Sourced</div>
                <div className="text-3xl font-mono">23</div>
              </div>
              <div className="flex-1 p-4 text-center border-r border-ink/10 bg-base hover:bg-surface-hover cursor-pointer transition-colors">
                <div className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-2">Screened</div>
                <div className="text-3xl font-mono">11</div>
              </div>
              <div className="flex-1 p-4 text-center border-r border-ink/10 bg-base hover:bg-surface-hover cursor-pointer transition-colors">
                <div className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-2">Journey Done</div>
                <div className="text-3xl font-mono">5</div>
              </div>
              <div className="flex-1 p-4 text-center border-r border-ink/10 bg-base hover:bg-surface-hover cursor-pointer transition-colors">
                <div className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-2">Interview</div>
                <div className="text-3xl font-mono">2</div>
              </div>
              <div className="flex-1 p-4 text-center bg-base hover:bg-surface-hover cursor-pointer transition-colors">
                <div className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-2">Offered</div>
                <div className="text-3xl font-mono">0</div>
              </div>
            </div>
          </div>

          {/* Branch Comparison */}
          <div className="mb-12">
            <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-4">Branch Performance</h3>
            <div className="border-y border-ink/10 py-2">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-ink-muted font-normal border-b border-ink/5">
                    <th className="py-2 font-normal"></th>
                    <th className="py-2 font-normal">Internal</th>
                    <th className="py-2 font-normal">TalentBridge</th>
                    <th className="py-2 font-normal">HireWell</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  <tr className="border-b border-ink/5 hover:bg-surface-hover cursor-pointer transition-colors">
                    <td className="py-3 font-sans text-ink/80">Profiles submitted</td>
                    <td className="py-3">4</td>
                    <td className="py-3">7</td>
                    <td className="py-3">2</td>
                  </tr>
                  <tr className="border-b border-ink/5 hover:bg-surface-hover cursor-pointer transition-colors">
                    <td className="py-3 font-sans text-ink/80">Screen pass rate</td>
                    <td className="py-3">75%</td>
                    <td className="py-3">57%</td>
                    <td className="py-3">50%</td>
                  </tr>
                  <tr className="border-b border-ink/5 hover:bg-surface-hover cursor-pointer transition-colors">
                    <td className="py-3 font-sans text-ink/80">Avg. days to submit</td>
                    <td className="py-3">5</td>
                    <td className="py-3">8</td>
                    <td className="py-3">12</td>
                  </tr>
                  <tr className="border-b border-ink/5 hover:bg-surface-hover cursor-pointer transition-colors">
                    <td className="py-3 font-sans text-ink/80">Journey completion</td>
                    <td className="py-3">2/3</td>
                    <td className="py-3">1/4</td>
                    <td className="py-3">0/1</td>
                  </tr>
                  <tr className="hover:bg-surface-hover cursor-pointer transition-colors">
                    <td className="py-3 font-sans text-ink/80">Quality signal</td>
                    <td className="py-3">
                      <div className="flex gap-0.5">
                        <div className="w-1.5 h-1.5 bg-ink/60"></div>
                        <div className="w-1.5 h-1.5 bg-ink/60"></div>
                        <div className="w-1.5 h-1.5 bg-ink/60"></div>
                        <div className="w-1.5 h-1.5 border border-ink/30"></div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-0.5">
                        <div className="w-1.5 h-1.5 bg-ink/60"></div>
                        <div className="w-1.5 h-1.5 bg-ink/60"></div>
                        <div className="w-1.5 h-1.5 border border-ink/30"></div>
                        <div className="w-1.5 h-1.5 border border-ink/30"></div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-0.5">
                        <div className="w-1.5 h-1.5 bg-ink/60"></div>
                        <div className="w-1.5 h-1.5 border border-ink/30"></div>
                        <div className="w-1.5 h-1.5 border border-ink/30"></div>
                        <div className="w-1.5 h-1.5 border border-ink/30"></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Branch Activity Feed */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">Activity Feed</h3>
              <button className="text-xs text-ink-muted hover:text-ink transition-colors">View Merged Graph</button>
            </div>
            
            <div className="flex flex-col gap-8">
              <div>
                <div className="text-[10px] font-mono text-ink-muted mb-4">TODAY</div>
                <div className="flex flex-col gap-4">
                  {MOCK_EVENTS.filter(e => e.time.includes('hrs')).map(event => (
                    <div key={event.id} className="border border-ink/10 rounded-sm p-4 bg-base hover:border-ink/20 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-medium text-sm">{event.title}</span>
                        <span className="text-[10px] font-mono text-ink-muted">{event.time}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 pl-3 border-l border-ink/10">
                        {event.details.map((detail, i) => (
                          <div key={i} className="text-xs text-ink/80 flex items-start gap-2">
                            <span className="text-ink-muted mt-0.5">├</span>
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-[10px] font-mono text-ink-muted mb-4">YESTERDAY</div>
                <div className="flex flex-col gap-4">
                  {MOCK_EVENTS.filter(e => e.time.includes('day')).map(event => (
                    <div key={event.id} className={`border border-ink/10 rounded-sm p-4 bg-base hover:border-ink/20 transition-colors ${event.type === 'system' ? 'border-l-2 border-l-signal-weak' : ''}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-medium text-sm">{event.title}</span>
                        <span className="text-[10px] font-mono text-ink-muted">{event.time}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 pl-3 border-l border-ink/10 mb-3">
                        {event.details.map((detail, i) => (
                          <div key={i} className="text-xs text-ink/80 flex items-start gap-2">
                            <span className="text-ink-muted mt-0.5">└</span>
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                      {event.actionable && (
                        <div className="pl-3 flex gap-3">
                          <button className="text-xs font-medium text-ink hover:underline">[{event.actionLabel}]</button>
                          {event.type === 'system' && <button className="text-xs text-ink-muted hover:text-ink">Review</button>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    );
  }

  if (mode === 'EVALUATE') {
    return (
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest">Ready for Review</h3>
            <button className="text-xs text-ink-muted hover:text-ink transition-colors">Merged Graph</button>
          </div>

          <div className="flex flex-col gap-6 mb-12">
            {MOCK_CANDIDATES.filter(c => c.stage === 'Ready for interview').map(candidate => (
              <div key={candidate.id} className="border border-ink/20 rounded-sm p-6 bg-base">
                <div className="mb-6">
                  <h2 className="font-sans font-semibold text-lg">{candidate.name}</h2>
                  <div className="text-xs font-mono text-ink-muted mt-1">
                    {candidate.headline} · via {candidate.source}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-3">Signal Ledger</h4>
                  <div className="flex flex-col gap-2">
                    {candidate.signals.map((signal, i) => (
                      <div key={i} className="flex items-center text-xs">
                        <div className="w-48 text-ink/80 truncate pr-4">{signal.dimension}</div>
                        <div className="flex gap-0.5 mr-4">
                          {[1, 2, 3, 4, 5].map(n => (
                            <div 
                              key={n} 
                              className={`w-3 h-2 ${n <= signal.score ? (
                                signal.confidence === 'task-demonstrated' ? 'bg-signal-verified' :
                                signal.confidence === 'inferred' ? 'bg-signal-inferred' :
                                signal.confidence === 'self-claimed' ? 'bg-ink/20' :
                                signal.confidence === 'recruiter-observed' ? 'bg-ink/40' : 'bg-ink/20'
                              ) : 'bg-ink/5'}`}
                            ></div>
                          ))}
                        </div>
                        <div className={`font-mono text-[10px] ${
                          signal.confidence === 'task-demonstrated' ? 'text-signal-verified' :
                          signal.confidence === 'inferred' ? 'text-signal-inferred' :
                          signal.confidence === 'self-claimed' ? 'text-ink-muted' :
                          signal.confidence === 'recruiter-observed' ? 'text-ink/60' : 'text-ink-muted'
                        }`}>
                          {signal.confidence}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6 border-l-2 border-ink/10 pl-4">
                  {candidate.trips.map((trip, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs mb-1">
                      <span className="font-medium text-ink/90">{trip.name}</span>
                      <span className="text-ink-muted">✓ {trip.status}</span>
                      {trip.evidenceReady && <span className="text-ink-muted">· Evidence ready</span>}
                    </div>
                  ))}
                </div>

                {candidate.recommendations && (
                  <div className="mb-6">
                    <h4 className="text-xs text-ink-muted mb-2">Recommended interview focus:</h4>
                    <div className="flex flex-col gap-1.5">
                      {candidate.recommendations.map((rec, i) => (
                        <div key={i} className="text-sm text-ink/90 flex items-start gap-2">
                          <span className="text-ink-muted">→</span>
                          <span className="font-serif">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-6 text-sm font-medium pt-4 border-t border-ink/10">
                  <button className="text-ink hover:underline">Open Evidence Pack</button>
                  <button className="text-ink hover:underline">Schedule Interview</button>
                  <button className="text-ink-muted hover:text-ink">Pass</button>
                  <button className="text-ink-muted hover:text-ink">Hold</button>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-4">In Progress</h3>
          <div className="flex flex-col gap-2 text-sm text-ink/80">
            {MOCK_CANDIDATES.filter(c => c.stage !== 'Ready for interview' && !c.isOverlap).map(candidate => (
              <div key={candidate.id} className="flex items-center gap-2">
                <span className="font-medium text-ink">{candidate.name}</span>
                <span className="text-ink-muted">—</span>
                <span>{candidate.trips[0]?.name} in progress</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (mode === 'CLOSE') {
    return (
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-serif text-2xl mb-2">Offer & Close</h2>
              <p className="text-ink-muted text-sm">Manage offers, negotiations, and onboarding handoffs.</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="border border-ink/20 rounded-sm p-6 bg-base">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-sans font-semibold text-lg">Candidate A</h3>
                    <span className="px-2 py-0.5 bg-signal-verified/10 text-signal-verified text-[10px] font-mono uppercase tracking-widest rounded-sm">Offer Extended</span>
                  </div>
                  <div className="text-xs font-mono text-ink-muted">
                    8 yrs · Payments · ex-Razorpay
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">52 LPA</div>
                  <div className="text-xs text-ink-muted">Base + 10% Bonus</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-3">Offer Details</h4>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink/80">Base Salary</span>
                      <span className="font-medium">52,000,000 INR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink/80">Joining Bonus</span>
                      <span className="font-medium">5,000,000 INR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink/80">ESOPs</span>
                      <span className="font-medium">0.1% (4yr vest)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink/80">Target Start</span>
                      <span className="font-medium">June 1st</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mb-3">Negotiation Levers</h4>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-signal-verified"></div>
                      <span className="text-ink/80">Can increase base up to 55L</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-signal-weak"></div>
                      <span className="text-ink/80">Cannot increase ESOPs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-signal-verified"></div>
                      <span className="text-ink/80">Flexible on start date (+30 days)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-ink/10">
                <button className="px-4 py-2 bg-ink text-base text-sm font-medium rounded-sm hover:bg-ink/90 transition-colors">
                  Accept Offer
                </button>
                <button className="px-4 py-2 border border-ink/20 text-ink text-sm font-medium rounded-sm hover:bg-ink/5 transition-colors">
                  Revise Offer
                </button>
                <button className="px-4 py-2 text-ink-muted text-sm font-medium hover:text-ink transition-colors ml-auto">
                  Withdraw
                </button>
              </div>
            </div>

            <div className="border border-ink/10 rounded-sm p-6 bg-surface-card opacity-70">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-sans font-medium text-ink/80">Candidate F</h3>
                  <div className="text-xs font-mono text-ink-muted mt-1">
                    7 yrs · Backend + Payments · ex-Paytm
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-ink/5 text-ink-muted text-[10px] font-mono uppercase tracking-widest rounded-sm">Backup</span>
              </div>
              <p className="text-sm text-ink-muted">Keep warm. Currently in final interview stage. Do not proceed to offer unless Candidate A declines.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
