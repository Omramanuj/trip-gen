import React, { useState } from 'react';
import { motion } from 'motion/react';

interface StressTestProps {
  onNext: () => void;
}

export function StressTest({ onNext }: StressTestProps) {
  const [constraints, setConstraints] = useState([
    { id: 'c1', label: 'Bangalore-only', impact: 'Reduces pool by ~60%', active: true },
    { id: 'c2', label: 'Series B/C experience', impact: 'Reduces pool by ~45%', active: true },
    { id: 'c3', label: '45-55L Compensation', impact: 'Below median for profile', active: true },
  ]);

  const toggleConstraint = (id: string) => {
    setConstraints(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const activeCount = constraints.filter(c => c.active).length;
  const fillability = activeCount === 3 ? 'Challenging — consider adjustments' : 
                      activeCount === 2 ? 'Fillable with effort' : 'Highly fillable';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto flex flex-col gap-12"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-ink">Stress-test Constraints</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Fillability & Constraints */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="border border-ink/10 p-6 bg-surface-card">
            <div className="text-xs font-mono text-ink-muted uppercase tracking-wider mb-4">Fillability Assessment</div>
            <div className="font-serif text-2xl text-ink mb-2">{fillability}</div>
            <div className="w-full h-1 bg-ink/10 mt-4 flex">
              <div className={`h-full transition-all duration-500 ${
                activeCount === 3 ? 'w-1/3 bg-amber-500' : 
                activeCount === 2 ? 'w-2/3 bg-amber-400' : 'w-full bg-green-500'
              }`} />
            </div>
          </div>

          <div className="border border-ink/10 p-6 bg-surface-card">
            <div className="text-xs font-mono text-ink-muted uppercase tracking-wider mb-6">Constraint Impact Map</div>
            <div className="flex flex-col gap-4">
              {constraints.map(constraint => (
                <div key={constraint.id} className="flex items-center justify-between py-2 border-b border-ink/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleConstraint(constraint.id)}
                      className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                        constraint.active ? 'bg-ink border-ink' : 'border-ink/30'
                      }`}
                    >
                      {constraint.active && <div className="w-2 h-2 bg-base" />}
                    </button>
                    <span className={`font-sans text-sm ${constraint.active ? 'text-ink' : 'text-ink-muted line-through'}`}>
                      {constraint.label}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-ink-faint">
                    {constraint.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Market Reality */}
        <div className="flex flex-col gap-8">
          <div className="border border-ink/10 p-6 bg-surface-card">
            <div className="text-xs font-mono text-ink-muted uppercase tracking-wider mb-4">Market Reality</div>
            
            <div className="flex flex-col gap-6">
              <div>
                <div className="text-xs font-sans text-ink-muted mb-2">Target Talent Pools</div>
                <div className="flex flex-wrap gap-2">
                  {['Razorpay', 'Pine Labs', 'Cred', 'Stripe (Remote)'].map(company => (
                    <span key={company} className="px-2 py-1 bg-ink/5 text-xs font-mono text-ink-muted">{company}</span>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-xs font-sans text-ink-muted mb-2">Adjacent Backgrounds</div>
                <p className="text-sm font-serif text-ink leading-relaxed">
                  High-volume e-commerce infrastructure (Flipkart, Swiggy) converts well to payment systems.
                </p>
              </div>
              
              <div>
                <div className="text-xs font-sans text-ink-muted mb-2">Salary Benchmark</div>
                <div className="flex items-end gap-2">
                  <span className="font-mono text-lg text-ink">55-65L</span>
                  <span className="text-xs text-ink-faint mb-1">Median (Bangalore)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-ink/10 p-6 bg-surface-card">
            <div className="text-xs font-mono text-ink-muted uppercase tracking-wider mb-4">Recommended Adjustments</div>
            <div className="flex flex-col gap-3">
              <button className="text-left px-4 py-3 border border-ink/10 hover:border-ink/30 transition-colors group">
                <div className="text-sm font-sans text-ink mb-1 group-hover:text-accent transition-colors">Expand to Remote</div>
                <div className="text-xs font-mono text-ink-faint">+200% addressable pool</div>
              </button>
              <button className="text-left px-4 py-3 border border-ink/10 hover:border-ink/30 transition-colors group">
                <div className="text-sm font-sans text-ink mb-1 group-hover:text-accent transition-colors">Adjust Range to 55-65L</div>
                <div className="text-xs font-mono text-ink-faint">Aligns with market median</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button 
          onClick={onNext}
          className="px-6 py-2 bg-ink text-base font-sans text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          Design Candidate Journeys
        </button>
      </div>
    </motion.div>
  );
}
