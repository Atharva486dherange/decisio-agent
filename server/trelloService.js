// Server-only adapter. No cards are created without explicit confirmation.
export function trackerConfigured(env) {
  return Boolean(env.TRELLO_API_KEY && env.TRELLO_TOKEN && /^[a-f0-9]{24}$/i.test(env.TRELLO_LIST_ID || ''));
}
export function prepareCard(task) {
  if (!task || typeof task.id !== 'string' || !/^[\w-]{1,100}$/.test(task.id) || typeof task.task !== 'string' || !task.task.trim() || task.task.length > 500) throw new Error('A saved task with a valid title is required.');
  if (task.reviewStatus !== 'approved') throw new Error('Approve this task before posting.');
  if (task.dueAt && (!/^\d{4}-\d{2}-\d{2}T/.test(task.dueAt) || !Number.isFinite(Date.parse(task.dueAt)))) throw new Error('Choose an explicit due date and time before posting.');
  return { name: task.task.trim(), desc: [`Owner in meeting: ${String(task.owner || 'Unassigned').slice(0, 200)}`, `Deadline as spoken: ${String(task.deadline || 'Not specified').slice(0, 200)}`, `Priority: ${String(task.priority || 'Medium').slice(0, 20)}`, `Source meeting: ${String(task.meetingTitle || 'Manual task').slice(0, 200)}`, task.quote ? `Source quote: ${String(task.quote).slice(0, 4000)}` : '', `Decisio task: ${task.id}`].filter(Boolean).join('\n\n'), due: task.dueAt ? new Date(task.dueAt).toISOString() : null };
}
export function trelloClient(env, request = fetch) {
  if (!trackerConfigured(env)) throw new Error('Trello is not connected. Configure the server credentials and destination list.');
  async function call(path, options = {}) {
    try {
      const key = env.TRELLO_API_KEY.trim();
      const token = env.TRELLO_TOKEN.trim();
      if (!/^[a-zA-Z0-9_-]+$/.test(key) || !/^[a-zA-Z0-9_-]+$/.test(token)) throw new Error('Invalid credentials');
      const response = await request(`https://api.trello.com/1${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `OAuth oauth_consumer_key="${key}", oauth_token="${token}"` }, signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Provider rejected request');
      return await response.json();
    } catch {
      // Header/network errors can contain the Authorization value. Never relay them.
      throw new Error('Trello request failed. Check account access and connection settings.');
    }
  }
  return {
    async destination() { const list = await call(`/lists/${env.TRELLO_LIST_ID}?fields=name,idBoard,closed`); if (list.closed) throw new Error('The destination list is archived.'); return { listId: list.id, listName: list.name, boardId: list.idBoard }; },
    async postTask(task, confirmed) {
      if (confirmed !== true) throw new Error('Confirm the task and destination before posting.');
      const card = prepareCard(task);
      await this.destination();
      // Reconcile retries by the source marker before issuing a create request.
      const cards = await call(`/lists/${env.TRELLO_LIST_ID}/cards?fields=id,url,desc`);
      const existing = cards.find(c => c.desc?.split('\n').includes(`Decisio task: ${task.id}`));
      if (existing) return { id: existing.id, url: existing.url, alreadyPosted: true };
      const created = await call('/cards', { method: 'POST', body: JSON.stringify({ ...card, idList: env.TRELLO_LIST_ID }) });
      return { id: created.id, url: created.url, alreadyPosted: false };
    }
  };
}

export async function trackerRequest(path, body, env, request = fetch) {
  if (!trackerConfigured(env)) return { status: 503, body: { configured: false, error: 'Trello is not configured for this app. Add server credentials and a destination list; the ChatGPT plugin connection is separate.' } };
  try {
    const client = trelloClient(env, request);
    if (path === 'status') return { status: 200, body: { configured: true, ...await client.destination() } };
    if (path === 'post') {
      if (body.expectedListId !== env.TRELLO_LIST_ID) throw new Error('The destination changed. Review the post again.');
      const result = await client.postTask(body.task, body.confirmed);
      // Only return a known Trello URL to the browser.
      if (!/^https:\/\/trello\.com\/c\/[\w/-]+$/.test(result.url || '')) throw new Error('Invalid tracker response.');
      return { status: 200, body: result };
    }
    return { status: 404, body: { error: 'Unknown tracker action.' } };
  } catch (e) { return { status: 400, body: { error: e.message } }; }
}
