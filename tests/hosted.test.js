import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
const built = existsSync(new URL('../dist/server/index.js', import.meta.url));
test('built hosted app serves HTML and portable API', { skip: !built }, async () => {
  const { default: worker } = await import('../dist/server/index.js');
  const html = await worker.fetch(new Request('https://example.test/'));
  assert.equal(html.status, 200); assert.match(await html.text(), /Decisio/);
  const health = await worker.fetch(new Request('https://example.test/api/health'));
  assert.equal((await health.json()).mode, 'offline-rules');
  const extraction = await worker.fetch(new Request('https://example.test/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: 'Maya: No decisions today.' }) }));
  assert.equal(extraction.status, 200); assert.deepEqual((await extraction.json()).actionItems, []);
  const invalid = await worker.fetch(new Request('https://example.test/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: 123 }) }));
  assert.equal(invalid.status, 400);
  const command = await worker.fetch(new Request('https://example.test/api/voice-command', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command: 'Reject task 1', actionItems: [{ id: 'one', task: 'Draft docs' }] }) }));
  assert.equal((await command.json()).mutations[0].action, 'reject');
  const missing = await worker.fetch(new Request('https://example.test/missing.js')); assert.equal(missing.status, 404);
});
