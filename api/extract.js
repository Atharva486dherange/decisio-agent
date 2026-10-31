import { extractMeetingData } from '../server/geminiService.js';
export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript } = req.body || {};
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript string is required' });
    }
    const result = await extractMeetingData(transcript, {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
