import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Command } from 'lucide-react';

export function CommandBar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.15 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
        >
          <div className="bg-surface-card border border-ink/10 shadow-2xl overflow-hidden flex items-center px-4 py-3">
            <Command className="w-4 h-4 text-ink-muted mr-3" />
            <input 
              autoFocus
              type="text" 
              placeholder="Type a command or ask a question..." 
              className="flex-1 bg-transparent border-none outline-none font-mono text-sm placeholder:text-ink-faint"
            />
            <div className="text-xs font-mono text-ink-faint border border-ink/10 px-1.5 py-0.5 rounded">ESC</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
