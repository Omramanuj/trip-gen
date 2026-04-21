import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TripProposalData } from '../types';

interface JourneyAndOutreachProps {
  onNext: () => void;
}

export function JourneyAndOutreach({ onNext }: JourneyAndOutreachProps) {
  const [platform, setPlatform] = useState('LinkedIn');
  const [tone, setTone] = useState('Formal');
  const [sender, setSender] = useState('Self');
  const [emailText, setEmailText] = useState('');

  const generateMessage = () => {
    let msg = `Hi [Name],\n\n`;
    if (tone === 'Formal') {
      msg += `I am reaching out regarding a critical senior backend engineering opportunity here at [Company]. We are looking for someone to own our 0-to-1 payment infrastructure.\n\n`;
    } else if (tone === 'Casual') {
      msg += `Came across your profile and was super impressed. We're building out our core payments infra from scratch at [Company] and need a systems thinker to lead it.\n\n`;
    } else {
      msg += `Building payments is hard. Doing it at scale is harder. If you're bored of maintaining legacy code and want to build from 0-to-1, we should talk.\n\n`;
    }

    if (sender === 'Head') {
      msg += `As Head of Engineering, I'm personally looking for a strong partner for this.\n\n`;
    } else if (sender === 'CXO') {
      msg += `I'm the CTO and I need someone who can go toe-to-toe with me on architecture.\n\n`;
    }

    msg += `If you're open to exploring, please share your details via this quick form: [Link to Journey 1]\n\nBest,\n[Your Name]`;
    return msg;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-12">
      {/* Journey 1 - Application Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col border border-ink/20 p-8 bg-base shadow-sm"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <div className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">
              JOURNEY 1
            </div>
            <div className="font-sans text-xl font-medium text-ink">
              Application Form & Initial Context
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1">
              Dropout Risk
            </div>
            <div className="font-mono flex items-center justify-end gap-1.5 text-signal-verified text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-verified"></span>
              Low
            </div>
          </div>
        </div>

        <p className="font-serif text-[15px] leading-relaxed text-ink/80 mb-8 border-b border-ink/10 pb-6">
          The default starting point. The LLM decides which candidate fields to include from the approved role signals, balancing recruiter signal with candidate friction.
        </p>

        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-sm font-medium text-ink mb-3">Candidate Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ['Full name', 'Required'],
                ['Email address', 'Required'],
                ['Phone number', 'Required'],
                ['Current location', 'Knockout'],
                ['Resume / CV', 'Required'],
                ['LinkedIn URL', 'Required'],
                ['GitHub / portfolio', 'Optional'],
                ['Notice period', 'Knockout'],
                ['Expected compensation', 'Optional'],
                ['Payment systems ownership', 'Knockout'],
              ].map(([label, badge]) => (
                <div key={label} className="flex items-center justify-between gap-3 rounded-md border border-ink/10 bg-surface-card px-3 py-2">
                  <span className="text-sm text-ink/90">{label}</span>
                  <span className={`rounded-sm px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${
                    badge === 'Knockout' ? 'bg-amber-50 text-amber-700' : badge === 'Required' ? 'bg-ink/5 text-ink-muted' : 'bg-base text-ink-faint'
                  }`}>
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-ink/10">
            <h4 className="text-sm font-medium text-ink mb-3">Why these fields</h4>
            <div className="bg-surface-card border border-ink/10 p-4 grid gap-3 md:grid-cols-3">
              <p className="text-sm text-ink-muted">Identity and contact fields keep recruiter follow-up reliable.</p>
              <p className="text-sm text-ink-muted">Location, notice period, and compensation prevent late-stage mismatch.</p>
              <p className="text-sm text-ink-muted">Role-specific proof fields validate must-haves without turning Journey 1 into an assessment.</p>
            </div>
          </div>
          
          <div className="pt-4 mt-2 border-t border-ink/10 flex items-center justify-end gap-3">
             <button className="px-5 py-2 border border-ink/20 text-ink text-sm font-medium hover:bg-ink/5 transition-colors">Preview</button>
             <button className="px-5 py-2 bg-ink text-base text-sm font-medium hover:bg-ink/90 transition-colors shadow-sm">Finalise</button>
          </div>
        </div>
      </motion.div>

      {/* Outreach Builder */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-serif text-2xl text-ink mb-6">Outreach Builder</h2>
        
        <div className="flex gap-6 mb-6">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-ink-muted">Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full border border-ink/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-ink/50">
              <option>LinkedIn</option>
              <option>Gmail</option>
              <option>X (Twitter)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-ink-muted">Tone</label>
            <select value={tone} onChange={e => setTone(e.target.value)} className="w-full border border-ink/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-ink/50">
              <option>Formal</option>
              <option>Casual</option>
              <option>Attracting GenZs</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-ink-muted">Sender</label>
            <select value={sender} onChange={e => setSender(e.target.value)} className="w-full border border-ink/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-ink/50">
              <option>Self</option>
              <option>Head</option>
              <option>CXO</option>
            </select>
          </div>
        </div>

        <div className="bg-surface-card border border-ink/10 p-6 flex flex-col gap-4">
          <textarea 
            value={generateMessage()}
            readOnly
            className="w-full min-h-[160px] bg-transparent border-none font-serif text-[15px] leading-relaxed resize-none outline-none text-ink/90"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-ink/10">
            <button className="text-xs font-medium text-ink hover:underline">Edit</button>
            <button className="text-xs font-medium text-ink hover:underline">Copy to clipboard</button>
            <button className="px-4 py-1.5 bg-ink text-base text-xs font-medium hover:bg-ink/90 transition-colors">Post to {platform}</button>
          </div>
        </div>
      </motion.div>

      {/* Action Footer */}
      <div className="flex flex-col gap-6 mt-8 pt-8 border-t border-ink/10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 w-full">
          <div className="flex items-center">
            <input 
              type="email" 
              placeholder="hr@company.com" 
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              className="flex-1 bg-transparent border border-ink/20 border-r-0 px-4 py-3 text-sm outline-none focus:border-ink/50 placeholder:text-ink-faint rounded-l-sm"
            />
            <button 
              disabled={!emailText}
              className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap rounded-r-sm ${emailText ? 'bg-ink text-base hover:bg-ink/90 shadow-sm' : 'bg-ink/10 text-ink-muted cursor-not-allowed'}`}
            >
              Hand off to recruitment team
            </button>
          </div>
          
          <div className="flex items-center justify-center">
            <span className="text-ink-muted font-mono text-xs uppercase tracking-widest">OR</span>
          </div>

          <button onClick={onNext} className="px-6 py-3 flex-1 font-medium text-sm bg-ink text-base hover:bg-ink/90 transition-colors shadow-sm rounded-sm">
            Continue to complete job posting
          </button>
        </div>
        
        <div className="flex justify-center mt-2">
          <button className="text-sm font-medium text-ink-muted hover:text-ink">Will come back later</button>
        </div>
      </div>
    </div>
  );
}
