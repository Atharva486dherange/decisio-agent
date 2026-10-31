import { detectRuleConflicts } from '../shared/engine.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { newDecisions, ledger } = req.body || {};
    const result = detectRuleConflicts(newDecisions, ledger);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
