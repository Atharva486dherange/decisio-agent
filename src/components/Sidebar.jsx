import React from 'react';
import { Home, Inbox, Calendar, BookOpen, CheckCircle2, Database, HelpCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function Sidebar({ 
  activeNav, 
  setActiveNav, 
  inboxCount = 3, 
  onOpenWisprModal 
}) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: inboxCount },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'decision_log', label: 'Decision log', icon: BookOpen },
    { id: 'execution', label: 'Execution', icon: CheckCircle2 },
    { id: 'planning', label: 'Planning & tracker', icon: Calendar },
    { id: 'memory', label: 'Memory', icon: Database },
  ];

  return (
    <aside aria-label="Workspace navigation" className="workspace-sidebar w-64 bg-cream-150 border-r border-cream-200 flex flex-col justify-between h-screen sticky top-0 px-4 py-5 select-none shrink-0">
      
      {/* Top Section */}
      <div className="space-y-6">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-2.5 px-2">
          <div className="relative flex items-center">
            {/* Two overlapping colored circles from the image */}
            <div className="w-5 h-5 rounded-full bg-[#E99D34]" />
            <div className="w-5 h-5 rounded-full bg-[#2B4C3F] -ml-2 mix-blend-multiply opacity-90" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-charcoal-900">
            Decisio
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-forest-900 text-white shadow-sm'
                    : 'text-charcoal-100 hover:text-charcoal-900 hover:bg-cream-200/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-charcoal-50'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#22C55E]/30 text-emerald-300' : 'bg-cream-200 text-charcoal-100'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Current Workspace Selector */}
        <div className="pt-2 px-1">
          <label className="text-[11px] font-medium text-charcoal-50 uppercase tracking-wider block mb-1.5">
            Current Workspace
          </label>
          <div className="flex items-center justify-between p-2 rounded-xl bg-cream-50 border border-cream-200/80 hover:border-cream-300 transition-colors">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-charcoal-900">Product Space</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="space-y-3 pt-4 border-t border-cream-200/80">
        
        {/* Dictate with Wispr Flow Card */}
        <div role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onOpenWisprModal(); }}
          onClick={onOpenWisprModal}
          className="p-3 rounded-2xl bg-cream-50 border border-cream-200/90 shadow-sm cursor-pointer hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-charcoal-900">
                  Dictate with Wispr Flow
                </h5>
                <span className="text-[11px] text-charcoal-50 group-hover:text-purple-600 transition-colors flex items-center underline decoration-dotted">
                  Voice. Anywhere.
                </span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-charcoal-50 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all mt-1" />
          </div>
        </div>

        <button className="sidebar-help" onClick={onOpenWisprModal}><HelpCircle size={17} /> Voice setup & help</button>

      </div>

    </aside>
  );
}
