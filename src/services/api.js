import { extractWithRules, detectRuleConflicts, parseRuleCommand, validateTranscript } from '../../shared/engine.js';
export async function checkServerHealth() {
  try { const res = await fetch('/api/health', { signal: AbortSignal.timeout(2500) }); if (res.ok) return await res.json(); } catch { /* Local rules remain available. */ }
  return { mode: 'offline-rules' };
}
export async function extractMeetingData(transcript) {
  validateTranscript(transcript);
  try {
    const res = await fetch('/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript }), signal: AbortSignal.timeout(25000) });
    if (res.ok) { const data = await res.json(); if (Array.isArray(data.decisions) && Array.isArray(data.actionItems)) return data; }
  } catch { /* The fallback result explicitly identifies its limits. */ }
  return { ...extractWithRules(transcript), warning: 'Live AI is unavailable. These are limited offline proposals; review against the transcript.' };
}
export async function detectConflicts(decisions, ledger) { return detectRuleConflicts(decisions, ledger); }
export async function executeVoiceCommand(command, items) { return parseRuleCommand(command, items); }
