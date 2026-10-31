// App-owned rules shared by the browser, local API, and hosted API.
export const newId = (prefix = 'item') => `${prefix}-${globalThis.crypto.randomUUID()}`;
const priorities = ['High', 'Medium', 'Low'];
const allowedStatuses = ['todo', 'in_progress', 'done'];
export function validateTranscript(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 50000) throw new Error('Enter a transcript between 1 and 50,000 characters.');
  return value.trim();
}
const quoteExists = (quote, transcript) => typeof quote === 'string' && quote.trim() && transcript.toLowerCase().includes(quote.trim().toLowerCase());
export function normalizeExtraction(value, transcript) {
  if (!value || !Array.isArray(value.decisions) || !Array.isArray(value.actionItems)) throw new Error('Invalid extraction response.');
  const decisions = value.decisions.filter(d => typeof d.decision === 'string' && d.decision.trim() && quoteExists(d.quote, transcript)).map(d => ({
    id: newId('dec'), topic: String(d.topic || 'General'), decision: d.decision, speaker: String(d.speaker || 'Not specified'), quote: d.quote
  }));
  const actionItems = value.actionItems.filter(t => typeof t.task === 'string' && t.task.trim() && quoteExists(t.quote, transcript)).map(t => ({
    id: newId('act'), task: t.task, owner: String(t.owner || 'Unassigned'), deadline: String(t.deadline || 'Not specified'),
    commitment: ['Firm', 'Tentative', 'Vague'].includes(t.commitment) ? t.commitment : 'Vague', quote: t.quote,
    priority: priorities.includes(t.priority) ? t.priority : 'Medium', missingInfo: Array.isArray(t.missingInfo) ? t.missingInfo.map(String) : [],
    status: 'todo', reviewStatus: 'approved'
  }));
  for (const item of actionItems) {
    if (item.owner === 'Unassigned' && !item.missingInfo.includes('Missing owner')) item.missingInfo.push('Missing owner');
    if (item.deadline === 'Not specified' && !item.missingInfo.includes('Missing deadline')) item.missingInfo.push('Missing deadline');
  }
  return { summary: String(value.summary || 'Review the proposals against the original transcript.'), decisions, actionItems };
}

// Conservative offline support: explicit commitments only; no invented tasks or dates.
export function extractWithRules(transcript) {
  validateTranscript(transcript);
  const decisions = [], actionItems = [];
  for (const raw of transcript.split(/\n+/).filter(Boolean)) {
    const match = raw.match(/^\s*([A-Za-z][\w -]{0,35}):\s*(.+)$/);
    const speaker = match ? match[1].trim() : 'Not specified';
    const text = match ? match[2] : raw.trim();
    const sentences = text.match(/[^.!?]+[.!?]?/g) || [text];
    for (const [sentenceIndex, sentence] of sentences.entries()) {
      const quote = sentence.trim();
      if (!quote || /\?\s*$/.test(quote)) continue;
      if (/\b(let'?s (?:launch|push|move|use|switch|introduce|defer|keep|lock|require|remove|add|adopt)|agreed|we (?:decided|agree)|decision is|we (?:have to|will) (?:push|move|launch|use|switch))\b/i.test(quote)) {
        decisions.push({ topic: /launch|beta|release date/i.test(quote) ? 'Release Milestone' : /pricing|plan|tier/i.test(quote) ? 'Pricing' : 'General', decision: quote, speaker, quote });
      }
      const commitment = quote.match(/\b(?:I will|I'll|I can|I should|someone (?:needs to|should))\s+(.+)/i);
      if (commitment) {
        const datePattern = '(?:(?:this|next)\\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(?:\\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s+20\\d{2})?)?|(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s+20\\d{2})?|tomorrow(?: morning)?|today';
        const deadline = quote.match(new RegExp('\\b(?:by|before)\\s+(' + datePattern + ')', 'i'));
        // A correction after the original date wins within the same utterance.
        const following = sentences[sentenceIndex + 1] || '';
        const nextDeadline = following.match(new RegExp("^\\s*(?:let'?s say|make it)\\s+by\\s+(" + datePattern + ')', 'i'));
        const correctedQuote = /actually|wait|instead/i.test(following) ? `${quote}${following}` : quote;
        const correction = correctedQuote.match(/(?:actually|wait|instead)[\s\S]*?\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i);
        actionItems.push({ task: commitment[1].trim(), owner: /someone/i.test(commitment[0]) || speaker === 'Not specified' ? 'Unassigned' : speaker,
          deadline: correction?.[1] || deadline?.[1]?.trim() || nextDeadline?.[1] || 'Not specified',
          commitment: /I will|I'll/i.test(commitment[0]) ? 'Firm' : 'Tentative', quote: correction ? correctedQuote : nextDeadline ? `${quote}${following}` : quote, priority: 'Medium', missingInfo: [] });
      }
    }
  }
  return { ...normalizeExtraction({ summary: `Offline rules found ${decisions.length} explicit decision(s) and ${actionItems.length} commitment(s). Check all proposals; nuanced speech requires live AI or manual editing.`, decisions, actionItems }, transcript), mode: 'offline-rules' };
}

function dateToken(text) {
  const matches = [...text.matchAll(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(20\d{2}))?/gi)];
  const m = matches.at(-1);
  return m ? `${m[1].slice(0, 3).toLowerCase()}-${Number(m[2])}${m[3] ? `-${m[3]}` : ''}` : null;
}
export function detectRuleConflicts(newDecisions, ledger) {
  if (!Array.isArray(newDecisions) || !Array.isArray(ledger)) throw new Error('Decisions and ledger must be arrays.');
  const conflicts = [];
  for (const n of newDecisions) for (const p of ledger.filter(d => d.status === 'active')) {
    if (p.id === n.id) continue;
    const a = String(n.decision || ''), b = String(p.decision || '');
    const launch = /launch|release|beta/i;
    const sameTopic = (n.topic && n.topic === p.topic && n.topic !== 'General') || (launch.test(a) && launch.test(b));
    const da = dateToken(a), db = dateToken(b);
    // Dates with unspecified year compare on month/day; do not infer a year.
    const different = da && db && (da.split('-').slice(0, 2).join('-') !== db.split('-').slice(0, 2).join('-') || (da.split('-').length === 3 && db.split('-').length === 3 && da !== db));
    if (sameTopic && different) conflicts.push({ id: `${n.id}:${p.id}`, type: 'Date Change', severity: 'High',
      pastDecisionId: p.id, pastMeetingTitle: p.meetingTitle, pastQuote: p.quote, pastAgreed: p.decision,
      newDecisionId: n.id, newQuote: n.quote, newAgreed: n.decision,
      explanation: 'The proposed commitment names a different date from the active agreement. Review both source quotes before resolving.' });
  }
  return { conflicts, mode: 'rules' };
}

export function parseRuleCommand(command, items) {
  if (typeof command !== 'string' || !command.trim() || command.length > 2000 || !Array.isArray(items)) throw new Error('Provide a command and task list.');
  const cmd = command.trim();
  const all = /\b(all|everything)\b/i.test(cmd);
  const number = cmd.match(/\b(?:task|item)\s*#?\s*(\d+)\b/i);
  const ordinal = cmd.match(/\b(first|second|third|fourth|fifth)\b/i);
  const index = number ? Number(number[1]) - 1 : ordinal ? ['first', 'second', 'third', 'fourth', 'fifth'].indexOf(ordinal[1].toLowerCase()) : -1;
  const named = items.filter(t => cmd.toLowerCase().includes(t.task.toLowerCase()));
  const target = index >= 0 ? items[index] : named.length === 1 ? named[0] : null;
  const approve = /\bapprove\b/i.test(cmd), reject = /\breject\b/i.test(cmd);
  const owner = cmd.match(/\b(?:assign|reassign)\b.+?\bto\s+([A-Za-z][A-Za-z -]*?)(?=\s+(?:and|with|by|but|except|set|make)\b|[,.;]|$)/i);
  const deadline = cmd.match(/\b(?:deadline|due date)\s+(?:to\s+)?(.+?)(?=\s+and\b|[,.;]|$)/i);
  const priority = cmd.match(/\b(high|medium|low)\s+priority\b|\bpriority\s+(?:to\s+)?(high|medium|low)\b/i);
  const done = /\b(?:mark|move)\b.+\b(?:done|complete|completed)\b/i.test(cmd);
  const unsupported = () => ({ mutations: [], confirmationMessage: 'No changes made. Try “reject task 1”, “reassign task 2 to Rahul”, or “approve all tasks”.' });
  if ((!all && !target) || ((number || ordinal) && !target) || (approve && reject) || /\b(?:do not|don't|never|cancel|undo)\b/i.test(cmd)) return unsupported();
  const changes = {};
  if (owner) changes.owner = owner[1].trim();
  if (deadline) changes.deadline = deadline[1].trim();
  if (priority) { const p = priority[1] || priority[2]; changes.priority = p[0].toUpperCase() + p.slice(1).toLowerCase(); }
  if (done) changes.status = 'done';
  if (!approve && !reject && !Object.keys(changes).length) return unsupported();
  const except = /\bexcept\b/i.test(cmd);
  if (except && !target) return unsupported();
  const mutations = [];
  for (const item of items) {
    const selected = target?.id === item.id;
    if (all || selected) {
      if (approve && except && selected) mutations.push({ targetId: item.id, action: 'reject', changes: {} });
      if ((approve || reject) && !(except && selected)) mutations.push({ targetId: item.id, action: reject ? 'reject' : 'approve', changes: {} });
      if (Object.keys(changes).length && (target ? selected : all)) mutations.push({ targetId: item.id, action: 'update', changes });
    }
  }
  return { mutations, confirmationMessage: mutations.length ? `Applied ${mutations.length} reviewed task change(s).` : 'No changes made.' };
}

export function applyMutations(items, mutations) {
  if (!Array.isArray(mutations)) throw new Error('Invalid task changes.');
  return items.map(item => {
    let next = { ...item };
    for (const m of mutations.filter(m => m.targetId === item.id)) {
      if (m.action === 'approve' || m.action === 'reject') next.reviewStatus = m.action === 'approve' ? 'approved' : 'rejected';
      if (m.action === 'update') {
        for (const key of ['owner', 'deadline', 'priority', 'status']) {
          const v = m.changes?.[key];
          if (typeof v !== 'string' || !v.trim() || v.length > 200) continue;
          if (key === 'priority' && !priorities.includes(v)) continue;
          if (key === 'status' && !allowedStatuses.includes(v)) continue;
          next[key] = v;
        }
        next.missingInfo = (next.missingInfo || []).filter(s => !(m.changes?.owner && /owner|assignee/i.test(s)) && !(m.changes?.deadline && /deadline/i.test(s)));
      }
    }
    return next;
  });
}

export function commitReview(workspace, extraction, resolutions, title) {
  if (extraction.actionItems.some(t => t.reviewStatus === 'approved' && !t.task.trim())) throw new Error('Approved tasks must have a title.');
  const unresolved = detectRuleConflicts(extraction.decisions, workspace.ledger).conflicts.filter(c => !resolutions[c.id]);
  if (unresolved.length) throw new Error('Resolve every conflict before committing.');
  const now = new Date().toISOString();
  let ledger = [...workspace.ledger];
  const actions = [];
  for (const [id, r] of Object.entries(resolutions)) {
    if (!['supersede', 'keep_both', 'flag_team'].includes(r.strategy)) throw new Error('Invalid conflict resolution.');
    if (r.strategy === 'supersede') ledger = ledger.map(d => d.id === r.pastDecisionId ? { ...d, status: 'superseded', supersededBy: r.newDecisionId, supersededReason: r.newAgreed } : d);
    actions.push({ id: newId('event'), at: now, kind: 'resolution', text: `${r.strategy.replaceAll('_', ' ')}: ${r.newAgreed}`, conflictId: id });
  }
  for (const d of extraction.decisions) if (!ledger.some(p => p.id === d.id)) {
    const selected = Object.values(resolutions).filter(r => r.newDecisionId === d.id);
    ledger.push({ ...d, meetingId: extraction.meetingId, status: 'active', meetingTitle: title, date: now.slice(0, 10), supersededBy: null, needsTeamReview: selected.some(r => r.strategy === 'flag_team'), dualTrack: selected.some(r => r.strategy === 'keep_both') });
  }
  const accepted = extraction.actionItems.filter(t => t.reviewStatus === 'approved' && !workspace.tasks.some(p => p.id === t.id));
  const linkedTasks = accepted.map(t => ({ ...t, meetingId: extraction.meetingId, meetingTitle: title, createdAt: now, updatedAt: now }));
  return { ...workspace, ledger, tasks: [...workspace.tasks, ...linkedTasks], audit: [...(workspace.audit || []), ...actions, { id: newId('event'), at: now, kind: 'commit', text: `${title}: saved ${extraction.decisions.length} decision(s) and ${accepted.length} approved task(s).` }] };
}
