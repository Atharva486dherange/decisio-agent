import test from 'node:test';
import assert from 'node:assert/strict';
import status from '../api/tracker/status.js';
import post from '../api/tracker/post.js';

function response() {
  return {
    headers: {}, code: null, body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('Vercel tracker handlers reject unsupported methods with JSON', async () => {
  for (const [handler, method] of [[status, 'POST'], [post, 'GET']]) {
    const res = response();
    await handler({ method }, res);
    assert.equal(res.code, 405);
    assert.equal(typeof res.body.error, 'string');
    assert.equal(res.headers['Cache-Control'], 'no-store');
  }
});

test('Vercel tracker posting requires same-origin request and explicit confirmation', async () => {
  for (const origin of [undefined, 'https://another-site.example']) {
    const res = response();
    await post({ method: 'POST', headers: { host: 'decisio.example', origin }, body: { confirmed: true } }, res);
    assert.equal(res.code, 403);
  }
  const res = response();
  await post({ method: 'POST', headers: { host: 'decisio.example', origin: 'https://decisio.example' }, body: {} }, res);
  assert.equal(res.code, 400);
  assert.match(res.body.error, /Confirm/);
});

test('Vercel tracker status returns configuration error instead of an HTML fallback', async () => {
  const previous = process.env.TRELLO_API_KEY;
  delete process.env.TRELLO_API_KEY;
  try {
    const res = response();
    await status({ method: 'GET' }, res);
    assert.equal(res.code, 503);
    assert.equal(res.body.configured, false);
  } finally {
    if (previous !== undefined) process.env.TRELLO_API_KEY = previous;
  }
});
