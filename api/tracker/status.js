import { trackerRequest } from '../../server/trelloService.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const result = await trackerRequest('status', {}, process.env);
  return res.status(result.status).json(result.body);
}
