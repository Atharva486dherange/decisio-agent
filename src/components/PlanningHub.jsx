import React, { useEffect, useState } from 'react';
import { dueReminders, weeklyDigests } from '../../shared/planning';

function localDate(iso) {
  if (!iso || !Number.isFinite(Date.parse(iso))) return '';
  const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
export default function PlanningHub({ tasks, ledger, onPatch, onPosted }) {
  const [connection, setConnection] = useState(null);
  const [message, setMessage] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [posting, setPosting] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer); }, []);
  async function refreshConnection() {
    try { const r = await fetch('/api/tracker/status', { signal: AbortSignal.timeout(20000) }); const data = await r.json(); setConnection(data); }
    catch { setConnection({ configured: false, error: 'Tracker service is unavailable. Start or restart the backend.' }); }
  }
  // This effect reads an external service; state changes occur after the request.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { refreshConnection(); }, []);
  const reminders = dueReminders(tasks, now);
  const digests = weeklyDigests(tasks, now);
  async function post() {
    if (!confirmation || posting) return;
    setPosting(true); setMessage('');
    try {
      const r = await fetch('/api/tracker/post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: confirmation.task, confirmed: true, expectedListId: confirmation.listId }), signal: AbortSignal.timeout(50000) });
      const result = await r.json(); if (!r.ok) throw new Error(result.error || 'Posting failed.');
      onPosted(confirmation.task.id, result); setConfirmation(null); setMessage(result.alreadyPosted ? 'Existing Trello card found and linked. No new card was created.' : 'Task posted to Trello and linked to this workspace.');
    } catch (e) { setMessage(`${e.message} Check Trello before retrying if a request timed out.`); }
    finally { setPosting(false); }
  }
  function downloadDigest(digest) {
    const url = URL.createObjectURL(new Blob([digest.text], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `weekly-digest-${digest.owner.replace(/[^\w-]/g, '_')}.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="space-y-6"><div><span className="eyebrow">Close the loop</span><h1 className="font-serif text-4xl my-3">Planning & tracker</h1><p className="text-sm text-charcoal-50">Confirm calendar deadlines, link tasks to decisions, and approve each external post.</p></div>
    <section className="paper-card p-5 space-y-3"><div className="flex justify-between items-center"><h2 className="font-serif text-2xl">Trello connection</h2><button className="text-link" onClick={refreshConnection}>Check connection</button></div><p className="text-sm">{!connection ? 'Checking connection…' : connection.configured ? `Destination list: ${connection.listName}` : connection.error || 'Not connected'}</p><p className="text-xs text-charcoal-50">The app uses server-side Trello credentials and a fixed destination list. Connecting Trello to ChatGPT does not automatically configure this app. No credentials belong in the browser.</p>{message && <p className="notice" role="status">{message}</p>}</section>
    <section className="paper-card"><header className="card-header"><h2>Commitment settings</h2><span className="text-xs text-charcoal-50">{tasks.length} tasks</span></header><div className="p-5 space-y-4">{tasks.map(t => <details className="meeting-group" key={t.id}><summary>{t.task} · {t.owner}{t.tracker ? ' · Linked to Trello' : ''}</summary><div className="mt-4 space-y-4"><p className="text-xs text-charcoal-50">As spoken: {t.deadline}. Choose a calendar date in your browser’s local time; ambiguous dates are never guessed.</p><label className="block text-xs">Confirmed deadline<input aria-label={`Calendar deadline for ${t.task}`} type="datetime-local" className="field mt-2" value={localDate(t.dueAt)} onChange={e => onPatch(t.id, { dueAt: e.target.value ? new Date(e.target.value).toISOString() : null })} /></label><label className="block text-xs">Remind before deadline<select className="field mt-2" value={t.reminderHours || 24} onChange={e => onPatch(t.id, { reminderHours: Number(e.target.value) })}><option value={1}>1 hour</option><option value={24}>24 hours</option><option value={48}>48 hours</option></select></label><label className="block text-xs">Related decision<select className="field mt-2" value={t.decisionIds?.[0] || ''} onChange={e => onPatch(t.id, { decisionIds: e.target.value ? [e.target.value] : [] })}><option value="">No explicit dependency</option>{ledger.map(d => <option key={d.id} value={d.id}>{d.decision}</option>)}</select></label>{t.tracker ? <a className="text-link" href={t.tracker.url} target="_blank" rel="noreferrer">Open Trello card ↗</a> : <button className="action-button" disabled={!connection?.configured || t.reviewStatus !== 'approved' || t.status === 'done'} onClick={() => setConfirmation({ task: structuredClone(t), listId: connection.listId, listName: connection.listName })}>Review Trello post</button>}<p className="text-xs text-charcoal-50">This integration creates a card. Later local edits do not automatically update it. The spoken owner is recorded in the card description; Trello member assignment is not configured.</p></div></details>)}{!tasks.length && <p className="text-sm text-charcoal-50">Commit a meeting or add a task to configure deadlines and tracker posting.</p>}</div></section>
    <section className="paper-card p-5 space-y-3"><h2 className="font-serif text-2xl">Deadline reminders</h2><p className="text-xs text-charcoal-50">In-app reminders refresh every minute while Decisio is open. No background email or closed-browser notification service is configured.</p>{reminders.map(t => <div className="notice" key={t.id}><strong>{t.task}</strong><p className="mt-1">{t.owner} · {t.minutesLeft <= 0 ? 'Overdue' : `Due in ${t.minutesLeft < 60 ? `${t.minutesLeft} minutes` : `${Math.ceil(t.minutesLeft / 60)} hours`}`} · {new Date(t.dueAt).toLocaleString()}</p></div>)}{!reminders.length && <p className="text-sm">No deadlines within their reminder window.</p>}</section>
    <section className="paper-card p-5 space-y-4"><h2 className="font-serif text-2xl">Weekly digest per person</h2><p className="text-xs text-charcoal-50">Rolling seven-day drafts, generated from current saved tasks. Review and download each draft. Scheduled external delivery is not configured.</p>{digests.map(d => <details className="meeting-group" key={d.owner}><summary>{d.owner}</summary><textarea aria-label={`Weekly digest for ${d.owner}`} className="transcript-field mt-3" rows={9} readOnly value={d.text} /><button className="action-button mt-3" onClick={() => downloadDigest(d)}>Download reviewed digest</button></details>)}{!digests.length && <p className="text-sm">Approved tasks will generate a digest for their owner.</p>}</section>
    {confirmation && <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="post-title"><section className="paper-card p-6 space-y-4 max-w-lg w-full"><h2 id="post-title" className="font-serif text-2xl">Confirm external task creation</h2><p className="text-sm">Create this card in Trello list <strong>{confirmation.listName}</strong>?</p><div className="notice"><strong>{confirmation.task.task}</strong><p className="mt-2">Owner in description: {confirmation.task.owner}</p><p>Due: {confirmation.task.dueAt ? new Date(confirmation.task.dueAt).toLocaleString() : 'No calendar deadline'}</p></div><p className="text-xs text-charcoal-50">The task title, spoken owner, deadline, priority, source meeting, and supporting quote will be sent to Trello. No post happens until you confirm.</p><div className="flex justify-end gap-2"><button className="action-button secondary" disabled={posting} onClick={() => setConfirmation(null)}>Cancel</button><button autoFocus className="action-button" disabled={posting} onClick={post}>{posting ? 'Posting…' : 'Confirm and post to Trello'}</button></div></section></div>}
  </section>;
}
