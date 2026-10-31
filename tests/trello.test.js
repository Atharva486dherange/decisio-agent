import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareCard, trackerConfigured, trelloClient, trackerRequest } from '../server/trelloService.js';
const env = { TRELLO_API_KEY: 'test-key', TRELLO_TOKEN: 'test-token', TRELLO_LIST_ID: 'a'.repeat(24) };
const task = { id: 'task-one', task: 'Prepare release notes', owner: 'Alex', deadline: 'Friday', reviewStatus: 'approved', quote: 'I will prepare release notes.' };
test('provider exceptions cannot expose credentials through tracker errors', async () => {
  const result = await trackerRequest('status', {}, env, async () => { throw new Error(`Authorization: ${env.TRELLO_TOKEN}`); });
  assert.equal(result.status, 400);
  assert.doesNotMatch(result.body.error, /test-token|Authorization/);
});
test('surrounding credential whitespace is removed before building headers', async () => {
  let authorization;
  const client = trelloClient({ ...env, TRELLO_TOKEN: `${env.TRELLO_TOKEN}\n` }, async (_url, options) => {
    authorization = options.headers.Authorization;
    return Response.json({ id: env.TRELLO_LIST_ID, name: 'To Do', closed: false });
  });
  await client.destination();
  assert.ok(!authorization.includes('\n'));
});
test('tracker credentials remain server-side and are required', () => { assert.equal(trackerConfigured({}), false); assert.throws(() => trelloClient({}), /not connected/); });
test('card preserves evidence and does not guess a calendar deadline', () => { const card = prepareCard(task); assert.equal(card.due, null); assert.ok(card.desc.includes(task.quote)); assert.throws(() => prepareCard({ ...task, reviewStatus: 'rejected' }), /Approve/); });
test('confirmation is required before any Trello request', async () => { let calls = 0; const client = trelloClient(env, async () => { calls++; }); await assert.rejects(client.postTask(task, false), /Confirm/); assert.equal(calls, 0); });
test('confirmed posting reconciles existing cards and avoids another create', async () => { let posted = false; const client = trelloClient(env, async (url, options) => { if (options.method === 'POST') posted = true; return Response.json(url.includes('/cards?') ? [{ id: 'existing', url: 'https://trello.com/c/example', desc: 'Decisio task: task-one' }] : { id: env.TRELLO_LIST_ID, name: 'To do', idBoard: 'board', closed: false }); }); const result = await client.postTask(task, true); assert.equal(result.alreadyPosted, true); assert.equal(posted, false); });
test('posting refuses a destination different from the reviewed one', async () => { const result = await trackerRequest('post', { task, confirmed: true, expectedListId: 'wrong' }, env, async () => { throw new Error('Must not call Trello'); }); assert.equal(result.status, 400); assert.match(result.body.error, /destination changed/); });
test('successful card creation includes source marker and explicit calendar date', async () => {
  let sent;
  const client = trelloClient(env, async (url, options) => {
    if (options.method === 'POST') { sent = JSON.parse(options.body); return Response.json({ id: 'created', url: 'https://trello.com/c/example' }); }
    return Response.json(url.includes('/cards?') ? [] : { id: env.TRELLO_LIST_ID, name: 'To do', closed: false });
  });
  const result = await client.postTask({ ...task, dueAt: '2026-11-06T12:00:00Z' }, true);
  assert.equal(result.alreadyPosted, false); assert.equal(sent.idList, env.TRELLO_LIST_ID); assert.equal(sent.due, '2026-11-06T12:00:00.000Z'); assert.ok(sent.desc.includes('Decisio task: task-one'));
});
