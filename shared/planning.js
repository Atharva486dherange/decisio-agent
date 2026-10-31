export function dueReminders(tasks, now = new Date()) {
  return tasks.filter(t => t.reviewStatus === 'approved' && t.status !== 'done' && t.dueAt && Number.isFinite(Date.parse(t.dueAt)))
    .map(t => ({ ...t, minutesLeft: Math.ceil((Date.parse(t.dueAt) - now.getTime()) / 60000) }))
    .filter(t => t.minutesLeft <= (Number(t.reminderHours) || 24) * 60)
    .sort((a, b) => a.minutesLeft - b.minutesLeft);
}
export function weeklyDigests(tasks, now = new Date()) {
  const since = now.getTime() - 7 * 86400000;
  const approved = tasks.filter(t => t.reviewStatus === 'approved');
  return [...new Set(approved.map(t => t.owner || 'Unassigned'))].map(owner => {
    const owned = approved.filter(t => (t.owner || 'Unassigned') === owner);
    const completed = owned.filter(t => t.status === 'done' && Date.parse(t.updatedAt) >= since && Date.parse(t.updatedAt) <= now.getTime());
    const open = owned.filter(t => t.status !== 'done');
    return { owner, text: [`Weekly digest for ${owner}`, `Generated: ${now.toLocaleDateString()}`, '', 'Completed in the last 7 days:', ...completed.map(t => `• ${t.task}`), ...(!completed.length ? ['• None recorded'] : []), '', 'Current open commitments:', ...open.map(t => `• ${t.task} — ${t.dueAt ? new Date(t.dueAt).toLocaleString() : t.deadline || 'No confirmed deadline'}${t.tracker?.url ? ` — ${t.tracker.url}` : ''}`), ...(!open.length ? ['• None'] : [])].join('\n') };
  });
}
export function impactForConflict(conflict, tasks) {
  return tasks.filter(t => t.status !== 'done' && t.decisionIds?.includes(conflict.pastDecisionId));
}
