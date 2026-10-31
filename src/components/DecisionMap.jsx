import React from 'react';
export default function DecisionMap({ ledger, tasks }) {
  const replacements = ledger.filter(d => d.supersededBy);
  const meetings = [...new Map([...ledger, ...tasks].filter(i => i.meetingId).map(i => [i.meetingId, i.meetingTitle])).entries()];
  return <section className="paper-card p-5 space-y-4"><div><span className="eyebrow">Source-linked memory</span><h2 className="font-serif text-2xl mt-1">How commitments connect</h2><p className="text-sm text-charcoal-50 mt-1">Solid arrows show explicit supersession. Meeting groups show shared origin, without inferring task dependencies.</p></div>
    {replacements.map(old => { const next = ledger.find(d => d.id === old.supersededBy); return <div key={old.id} className="decision-connection"><article><small>Previous agreement</small><p>{old.decision}</p></article><svg role="img" aria-label="Superseded by" width="50" height="30" viewBox="0 0 50 30"><path d="M0 15H42M32 5L43 15L32 25" fill="none" stroke="#b85d3d" strokeWidth="2" /></svg><article><small>Replacement agreement</small><p>{next?.decision || old.supersededReason}</p></article></div>; })}
    {meetings.map(([id, title]) => <details className="meeting-group" key={id}><summary>{title} · {ledger.filter(d => d.meetingId === id).length} decisions · {tasks.filter(t => t.meetingId === id).length} tasks</summary><div className="mt-3 space-y-2">{ledger.filter(d => d.meetingId === id).map(d => <p key={d.id} className="text-sm">Decision: {d.decision}</p>)}{tasks.filter(t => t.meetingId === id).map(t => <p key={t.id} className="text-sm">Task: {t.task} → {t.owner}</p>)}</div></details>)}
    {!replacements.length && !meetings.length && <p className="text-sm text-charcoal-50">Commit a meeting to start building the map. The initial ledger contains sample historical agreements.</p>}
  </section>;
}
