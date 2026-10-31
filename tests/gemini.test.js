import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMeetingData } from '../server/geminiService.js';

const transcript = 'Alex: I will prepare release notes by Friday.';
test('Gemini extraction keeps evidence and discards unsupported proposals', async () => {
  const result = await extractMeetingData(transcript, { apiKey: 'test-only', request: async () => Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ summary: 'Release work', decisions: [], actionItems: [
    { task: 'Prepare release notes', owner: 'Alex', deadline: 'Friday', quote: transcript },
    { task: 'Invented work', quote: 'Not in the meeting' },
  ] }) }] } }] }) });
  assert.equal(result.mode, 'live-ai');
  assert.equal(result.actionItems.length, 1);
  assert.equal(result.actionItems[0].quote, transcript);
});
test('provider failures use explicit offline results without exposing provider details', async () => {
  for (const [status, warning] of [[403, /credentials/], [404, /model/], [429, /quota/], [503, /temporarily unavailable/]]) {
    const result = await extractMeetingData(transcript, { apiKey: 'test-only', request: async () => new Response('private provider details', { status }) });
    assert.equal(result.mode, 'offline-rules');
    assert.match(result.warning, warning);
    assert.doesNotMatch(result.warning, /private provider details|test-only/);
  }
});
