import test from 'node:test';
import assert from 'node:assert/strict';
import { dueReminders, weeklyDigests, impactForConflict } from '../shared/planning.js';
const now = new Date('2026-10-31T12:00:00Z');
test('reminders include due and overdue approved open tasks only', () => {
  const base = { reviewStatus: 'approved', status: 'todo', reminderHours: 1 };
  const tasks = [{ ...base, id: 'due', dueAt: '2026-10-31T12:30:00Z' }, { ...base, id: 'old', dueAt: '2026-10-31T11:00:00Z' }, { ...base, id: 'later', dueAt: '2026-11-01T12:00:00Z' }, { ...base, status: 'done', dueAt: '2026-10-31T12:30:00Z' }, { ...base, reviewStatus: 'rejected', dueAt: '2026-10-31T12:30:00Z' }, { ...base, deadline: 'Friday' }];
  assert.deepEqual(dueReminders(tasks, now).map(t => t.id), ['old', 'due']);
});
test('weekly digests separate people and restrict completed work to the last seven days', () => {
  const tasks = [{ task: 'Recent', owner: 'Alex', reviewStatus: 'approved', status: 'done', updatedAt: '2026-10-30T12:00:00Z' }, { task: 'Old', owner: 'Alex', reviewStatus: 'approved', status: 'done', updatedAt: '2026-10-01T12:00:00Z' }, { task: 'Open', owner: 'Priya', reviewStatus: 'approved', status: 'todo', deadline: 'Friday' }, { task: 'Rejected', owner: 'Alex', reviewStatus: 'rejected' }];
  const digests = weeklyDigests(tasks, now);
  assert.ok(digests.find(d => d.owner === 'Alex').text.includes('Recent'));
  assert.ok(!digests.find(d => d.owner === 'Alex').text.includes('Old'));
  assert.ok(!digests.find(d => d.owner === 'Alex').text.includes('Open'));
  assert.ok(digests.find(d => d.owner === 'Priya').text.includes('Open'));
});
test('impact preview uses explicit links and excludes completed tasks', () => {
  const tasks = [{ id: 'linked', status: 'todo', decisionIds: ['old'] }, { id: 'unlinked', status: 'todo' }, { id: 'done', status: 'done', decisionIds: ['old'] }];
  assert.deepEqual(impactForConflict({ pastDecisionId: 'old' }, tasks).map(t => t.id), ['linked']);
});
