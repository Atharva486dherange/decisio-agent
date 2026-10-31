import express from 'express';
import dotenv from 'dotenv';
import { extractMeetingData } from './geminiService.js';
import { detectRuleConflicts, parseRuleCommand } from '../shared/engine.js';
import { trackerRequest } from './trelloService.js';
dotenv.config();
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', mode: process.env.GEMINI_API_KEY?.trim() ? 'live-ai' : 'offline-rules' }));
app.post('/api/extract', async (req, res, next) => { try { res.json(await extractMeetingData(req.body.transcript, { apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL })); } catch (e) { next(e); } });
app.post('/api/conflicts', (req, res, next) => { try { res.json(detectRuleConflicts(req.body.newDecisions, req.body.ledger)); } catch (e) { next(e); } });
app.post('/api/voice-command', (req, res, next) => { try { res.json(parseRuleCommand(req.body.command, req.body.actionItems)); } catch (e) { next(e); } });
app.get('/api/tracker/status', async (req, res) => { const result = await trackerRequest('status', {}, process.env); res.status(result.status).json(result.body); });
app.post('/api/tracker/post', async (req, res) => {
  if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return res.status(403).json({ error: 'Use the same-origin application to post tasks.' });
  const result = await trackerRequest('post', req.body, process.env); res.status(result.status).json(result.body);
});
// Workspace records are browser-local, rather than a second unsynchronized server ledger.
app.use((error, req, res, _next) => res.status(error.status || 400).json({ error: error.status === 413 ? 'Request too large.' : 'Invalid request. Check the transcript or task data.' }));
app.listen(process.env.PORT || 3001, '127.0.0.1', () => console.log('Decisio API ready.'));
