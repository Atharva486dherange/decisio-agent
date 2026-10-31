import { parseRuleCommand } from '../shared/engine.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { command, actionItems } = req.body || {};
    const result = parseRuleCommand(command, actionItems);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
