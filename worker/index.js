import { extractMeetingData } from '../server/geminiService.js';
import { detectRuleConflicts, parseRuleCommand } from '../shared/engine.js';
import { trackerRequest } from '../server/trelloService.js';
import assets from '../.artifacts/assets.generated.js';
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
export default {
  async fetch(request, env = {}) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname === '/api/health' && request.method === 'GET') return json({ status: 'ok', mode: env.GEMINI_API_KEY?.trim() ? 'live-ai' : 'offline-rules' });
      if (url.pathname === '/api/tracker/status' && request.method === 'GET') { const result = await trackerRequest('status', {}, env); return json(result.body, result.status); }
      if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
      if (!request.headers.get('Content-Type')?.includes('application/json')) return json({ error: 'Use a JSON request.' }, 415);
      if (Number(request.headers.get('Content-Length')) > 100000) return json({ error: 'Request too large.' }, 413);
      try {
        const raw = await request.text();
        if (raw.length > 100000) return json({ error: 'Request too large.' }, 413);
        const body = JSON.parse(raw);
        if (url.pathname === '/api/tracker/post') {
          if (request.headers.get('Origin') && request.headers.get('Origin') !== url.origin) return json({ error: 'Cross-origin posting is not allowed.' }, 403);
          const result = await trackerRequest('post', body, env); return json(result.body, result.status);
        }
        if (url.pathname === '/api/extract') return json(await extractMeetingData(body.transcript, { apiKey: env.GEMINI_API_KEY, model: env.GEMINI_MODEL }));
        if (url.pathname === '/api/conflicts') return json(detectRuleConflicts(body.newDecisions, body.ledger));
        if (url.pathname === '/api/voice-command') return json(parseRuleCommand(body.command, body.actionItems));
        return json({ error: 'Not found.' }, 404);
      } catch { return json({ error: 'Invalid request. Check the transcript or task data.' }, 400); }
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    const asset = assets[url.pathname] || (!url.pathname.split('/').at(-1).includes('.') ? assets['/index.html'] : null);
    if (!asset) return new Response('Not found', { status: 404 });
    return new Response(request.method === 'HEAD' ? null : Uint8Array.from(atob(asset.body), c => c.charCodeAt(0)), { headers: { 'Content-Type': asset.type, 'Cache-Control': url.pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' } });
  }
};
