import { trackerRequest } from '../../server/trelloService.js';
export const maxDuration = 60;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host || origin !== `https://${host}`) {
    return res.status(403).json({ error: 'Post from the app confirmation screen.' });
  }
  if (req.body?.confirmed !== true) return res.status(400).json({ error: 'Confirm the task and destination before posting.' });
  const result = await trackerRequest('post', req.body || {}, process.env);
  return res.status(result.status).json(result.body);
}
