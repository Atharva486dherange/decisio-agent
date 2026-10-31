import React from 'react';

import { Search, Briefcase } from 'lucide-react';

export default function TopBar({ searchQuery, setSearchQuery }) {

  return <header className="top-bar"><div className="search-field"><Search size={18} /><input aria-label="Search workspace" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search decisions, meetings, or tasks…" /></div><span className="workspace-label"><Briefcase size={17} /> Product Space</span><span className="avatar-initial small" aria-label="Local workspace">D</span></header>;

}

