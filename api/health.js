export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'ok',
    mode: process.env.GEMINI_API_KEY ? 'live-ai' : 'offline-rules',
    platform: 'vercel-serverless',
    timestamp: new Date().toISOString()
  });
}
