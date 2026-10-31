import test from 'node:test';
import assert from 'node:assert/strict';
import { extractWithRules, parseRuleCommand, applyMutations, detectRuleConflicts, commitReview, normalizeExtraction } from '../shared/engine.js';
import { demoScenarios, initialLedger } from '../src/data/seedData.js';

const items = [{ id: 'one', task: 'Draft docs', owner: 'Alex', reviewStatus: 'approved', priority: 'Medium', status: 'todo' }, { id: 'two', task: 'Load testing', owner: 'Priya', reviewStatus: 'approved', priority: 'Medium', status: 'todo' }];
test('no commitments means no fabricated tasks or decisions', () => {
  const r = extractWithRules('Maya: No decisions today. We only reviewed last month.');
  assert.deepEqual(r.decisions, []); assert.deepEqual(r.actionItems, []);
});
test('greetings are not decisions and sequencing language is not a deadline', () => {
  const r = extractWithRules("Alex: Let's jump into the sync. I'll write docs before tackling anything else.");
  assert.equal(r.decisions.length, 0); assert.equal(r.actionItems[0].deadline, 'Not specified');
});
test('a follow-up sentence can provide an explicit deadline', () => {
  const r = extractWithRules("Priya: I can run the load tests. Let's say by November 12th.");
  assert.equal(r.actionItems[0].deadline, 'November 12th'); assert.equal(r.decisions.length, 0);
});
test('offline commitments retain source quotes and unknown deadlines', () => {
  const r = extractWithRules("Alex: I'll write the API documentation.");
  assert.equal(r.actionItems.length, 1); assert.equal(r.actionItems[0].owner, 'Alex');
  assert.equal(r.actionItems[0].deadline, 'Not specified');
  assert.ok(r.actionItems[0].missingInfo.includes('Missing deadline'));
});
test('short spoken correction uses the corrected weekday', () => {
  const r = extractWithRules("Alex: I'll design the card by Thursday. Um, wait, actually Friday would be safer.");
  assert.equal(r.actionItems[0].deadline, 'Friday');
});
test('reject is rejection and does not mutate original records', () => {
  const r = applyMutations(items, parseRuleCommand('Reject task 1', items).mutations);
  assert.equal(r[0].reviewStatus, 'rejected'); assert.equal(r[1].reviewStatus, 'approved'); assert.equal(items[0].reviewStatus, 'approved');
});
test('reassign, priority, deadline, and completion apply only to target', () => {
  let r = applyMutations(items, parseRuleCommand('Reassign task 2 to Rahul and set priority to High', items).mutations);
  assert.equal(r[1].owner, 'Rahul'); assert.equal(r[1].priority, 'High'); assert.equal(r[0].owner, 'Alex');
  r = applyMutations(r, parseRuleCommand('Set task 2 deadline to Friday', r).mutations); assert.equal(r[1].deadline, 'Friday');
  r = applyMutations(r, parseRuleCommand('Mark task 2 done', r).mutations); assert.equal(r[1].status, 'done');
});
test('exceptions are excluded from approval', () => {
  const r = applyMutations(items, parseRuleCommand('Approve all except task 2, assign task 2 to Rahul', items).mutations);
  assert.equal(r[0].reviewStatus, 'approved'); assert.equal(r[1].reviewStatus, 'rejected'); assert.equal(r[1].owner, 'Rahul');
});
test('unsupported, negated, ambiguous and out of range commands make no changes', () => {
  for (const command of ['Delete task 1', 'Do not approve all', 'Reassign task 99 to Rahul', 'Set priority to High', 'Approve and reject all']) assert.deepEqual(parseRuleCommand(command, items).mutations, []);
});
test('AI proposals without exact supporting quotes are removed', () => {
  const r = normalizeExtraction({ decisions: [{ decision: 'Launch Friday', quote: 'invented' }], actionItems: [{ task: 'Notify customers', quote: 'invented' }] }, 'No decisions.');
  assert.equal(r.decisions.length, 0); assert.equal(r.actionItems.length, 0);
});
test('real demo finds a date conflict and ignores superseded records', () => {
  const r = extractWithRules(demoScenarios[0].transcript);
  assert.ok(r.actionItems.length >= 3);
  const c = detectRuleConflicts(r.decisions, initialLedger).conflicts;
  assert.equal(c.length, 1); assert.equal(c[0].pastDecisionId, 'hist-001');
  assert.equal(detectRuleConflicts(r.decisions, initialLedger.map(d => ({ ...d, status: 'superseded' }))).conflicts.length, 0);
});
test('commit blocks unresolved conflicts and saves linked history without duplicates', () => {
  const draft = { ...extractWithRules(demoScenarios[0].transcript), meetingId: 'meeting-one' };
  draft.actionItems[0].reviewStatus = 'rejected';
  const base = { ledger: structuredClone(initialLedger), tasks: [], audit: [] };
  assert.throws(() => commitReview(base, draft, {}, 'Sync'), /Resolve/);
  const c = detectRuleConflicts(draft.decisions, base.ledger).conflicts[0];
  const r = commitReview(base, draft, { [c.id]: { ...c, strategy: 'supersede' } }, 'Sync');
  assert.equal(r.ledger.find(d => d.id === c.pastDecisionId).supersededBy, c.newDecisionId);
  assert.equal(r.tasks.length, draft.actionItems.length - 1); assert.ok(r.tasks.every(t => t.meetingId === 'meeting-one'));
  const again = commitReview(r, draft, {}, 'Sync'); assert.equal(again.tasks.length, r.tasks.length); assert.equal(again.ledger.length, r.ledger.length);
  assert.equal(r.audit[0].kind, 'resolution');
});
