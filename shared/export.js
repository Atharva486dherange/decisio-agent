const cell = value => String(value ?? '').replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
export function exportWorkspace(format, { tasks = [], decisions = [], summary = '' }) {
  const accepted = tasks.filter(t => t.reviewStatus !== 'rejected');
  const active = decisions.filter(d => d.status === 'active');
  if (format === 'json') return JSON.stringify({ exportedAt: new Date().toISOString(), summary, decisions: active, tasks: accepted }, null, 2);
  if (format === 'linear') return ['# Workspace action items', '', '| Priority | Task | Assignee | Deadline | Status |', '| --- | --- | --- | --- | --- |', ...accepted.map(t => `| ${[t.priority, t.task, t.owner, t.deadline, t.status].map(cell).join(' | ')} |`)].join('\n');
  if (format === 'personal') return [...new Set(accepted.map(t => t.owner))].map(owner => [`Deliverables for ${owner}`, ...accepted.filter(t => t.owner === owner).map(t => `• ${t.task} — ${t.deadline}`)].join('\n')).join('\n\n') || 'No approved tasks yet.';
  return ['*Decisio · Workspace digest*', summary ? `\nLatest meeting summary: ${summary}` : '', '\n*Active decision ledger*', ...active.map(d => `• ${d.topic}: ${d.decision}`), '\n*Approved action items*', ...accepted.map(t => `• [${t.priority}] ${t.task} → ${t.owner} · Due: ${t.deadline} · ${t.status}`)].filter(Boolean).join('\n');
}
