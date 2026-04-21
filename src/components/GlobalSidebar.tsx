import React, { useState } from 'react';
import { Building, Briefcase, FileText, Users, Handshake, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface GlobalSidebarProps {
  isAdmin?: boolean;
}

export function GlobalSidebar({ isAdmin = false }: GlobalSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'company', label: 'Company details', icon: Building, adminOnly: true },
    { id: 'jobs', label: 'Listed Jobs', icon: Briefcase, adminOnly: false, active: true },
    { id: 'invoicing', label: 'Invoicing', icon: FileText, adminOnly: true },
    { id: 'teams', label: 'Manage teams', icon: Users, adminOnly: true },
    { id: 'partners', label: 'Manage partners', icon: Handshake, adminOnly: true },
    { id: 'connectors', label: 'Connectors', icon: LinkIcon, adminOnly: true },
  ];

  return (
    <div className={`flex flex-col bg-base border-r border-ink/10 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} shrink-0 h-screen sticky top-0 z-50`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-ink/10 shrink-0">
        {!isCollapsed && <span className="font-serif font-semibold text-lg text-ink truncate">Recruitment OS</span>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className={`p-1 hover:bg-ink/5 rounded text-ink-muted hover:text-ink ${isCollapsed ? 'mx-auto' : ''}`}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <div className="flex-1 py-4 flex flex-col gap-2 px-2 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const disabled = item.adminOnly && !isAdmin;
          return (
            <button
              key={item.id}
              disabled={disabled}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-left
                ${item.active ? 'bg-ink/5 text-ink font-medium' : 'text-ink/70 hover:bg-ink/5 hover:text-ink'}
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                ${isCollapsed ? 'justify-center px-0' : ''}
              `}
              title={disabled ? `${item.label} (Available for HR lead and finance teams only)` : item.label}
            >
              <item.icon size={18} className="shrink-0" />
              {!isCollapsed && <span className="text-sm truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
