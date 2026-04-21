import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Edit2, Check } from 'lucide-react';

interface RoleSystemPreviewProps {
  onNext: () => void;
}

const INITIAL_SECTIONS = [
  {
    id: 'recruiter',
    title: 'Recruiter Brief',
    summary: 'The master context for internal or external recruiters.',
    content: 'We need someone who thinks in distributed systems terminology natively. They must understand idempotency, failure modes, and state machines from first principles. If they only know how to wire up Stripe APIs, they are not a fit. Target someone looking for a serious 0-to-1 ownership challenge.',
    tags: ['📍 Bangalore HQ', '📅 5 Days (Mon-Fri)', '💼 Permanent']
  },
  {
    id: 'portrait',
    title: 'Candidate Portrait',
    summary: 'Senior backend engineer, systems thinker, Series B/C fintech background.',
    content: 'A systems thinker from a Series B/C environment who has built, not just maintained, payment infrastructure. Capable of owning the entire domain and partnering with the CTO. Must be Bangalore-based or willing to relocate. Budget: 45-55 LPA.'
  },
  {
    id: 'search',
    title: 'Search Strategy',
    summary: 'Direct sourcing mid-stage fintechs, 3 channels active.',
    content: 'Focusing on Razorpay, Pine Labs, and similar mid-stage fintechs. Narrative focus on "Ownership of 0-to-1 infrastructure". Activating LinkedIn direct outreach, internal referrals, and 2 specialized vendor partners.'
  },
  {
    id: 'outreach',
    title: 'Outreach Messaging',
    summary: 'Infrastructure ownership narrative, CTO partnership angle.',
    content: 'Draft Pitch: "We are looking for a systems thinker to own our payment infrastructure from the ground up, working directly with our CTO. This is not a feature-building role; it is an architectural ownership opportunity..."'
  },
  {
    id: 'evaluation',
    title: 'Evaluation Pipeline',
    summary: 'Screen → Intent Journey → CTO Interview → System Design Journey → Offer',
    content: '1. Recruiter Screen (30m)\n2. Intent & Context Fit Journey (~20m async)\n3. CTO Interview (45m)\n4. System Design Proof Journey (~60m async)\n5. Final Stakeholder Fit (30m)'
  },
  {
    id: 'logistics',
    title: 'Interview Process & Location',
    summary: '3 Rounds | Virtual & Physical | Bangalore HQ',
    content: 'Number of Rounds: 3\n\nInterview Format:\n• Round 1 & 2: Virtual (Video Call)\n• Final Round: Physical (On-site)\n\nOffice Location (Post-onboarding): Bangalore HQ'
  }
];

export function RoleSystemPreview({ onNext }: RoleSystemPreviewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('recruiter');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [editContent, setEditContent] = useState('');

  const handleEditOpen = (id: string, content: string) => {
    setEditingSection(id);
    setEditContent(content);
    setExpandedSection(id);
  };

  const handleEditSave = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, content: editContent } : s));
    setEditingSection(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto flex flex-col gap-12"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl text-ink">Role System Preview</h2>
          <div className="flex items-center gap-2 text-sm font-sans">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-ink-muted">System health: Ready for launch</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col border border-ink/10 bg-surface-card">
        {sections.map((section) => {
          const isExpanded = expandedSection === section.id;
          const isEditing = editingSection === section.id;
          
          return (
            <div key={section.id} className="border-b border-ink/10 last:border-0 relative">
              <button 
                onClick={() => {
                  if(!isEditing) setExpandedSection(isExpanded ? null : section.id);
                }}
                className="w-full flex items-center justify-between p-6 hover:bg-ink/5 transition-colors text-left group"
              >
                <div className="flex flex-col gap-1 w-full pr-8">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-ink-muted group-hover:text-ink transition-colors flex justify-between">
                    {section.title}
                  </div>
                  <div className="font-sans text-sm text-ink truncate">
                    {section.summary}
                  </div>
                </div>
                {!isEditing && (
                  <div className="text-ink-faint group-hover:text-ink transition-colors shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                )}
              </button>
              
              {!isEditing && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditOpen(section.id, section.content);
                  }}
                  className="absolute top-6 right-16 p-1 text-ink-muted hover:text-ink bg-surface-card"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}

              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 font-serif text-[15px] leading-relaxed text-ink-muted border-t border-ink/5 mt-2 pt-4 whitespace-pre-line">
                      {isEditing ? (
                        <div className="flex flex-col gap-3">
                          <textarea 
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full min-h-[120px] bg-transparent border border-ink/20 p-3 font-serif text-[15px] outline-none focus:border-ink/50 text-ink"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingSection(null)}
                              className="px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleEditSave(section.id)}
                              className="px-3 py-1.5 text-xs font-medium bg-ink text-base hover:bg-ink/90 flex items-center gap-1.5"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div>{section.content}</div>
                          {section.tags && section.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 pt-4 border-t border-ink/5">
                              {section.tags.map((tag, i) => (
                                <span key={i} className="px-2.5 py-1 bg-ink/5 text-ink-muted font-sans text-xs rounded-sm border border-ink/10">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mt-8">
        <button 
          onClick={onNext}
          className="px-6 py-2.5 bg-ink text-base font-sans text-sm font-medium hover:bg-ink/90 transition-colors shadow-sm"
        >
          Proceed to Launch
        </button>
      </div>
    </motion.div>
  );
}
