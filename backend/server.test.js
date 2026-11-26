const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./server');

async function fixture(t, options = {}) {
  let time = 1000000;
  const sent = [], updates = [];
  const contact = { id: 'contact-1', Email: 'person@example.test', First_Name: 'Jane', Owner: 'private' };
  const http = {
    get: async () => ({ data: { data: [contact] } }),
    put: async (url, body) => { updates.push(body); return { data: { data: [{ status: 'success' }] } }; },
    ...options.http,
  };
  const mailer = { emails: { send: async message => { sent.push(message); return options.mailError ? { error: { message: 'failed' } } : { data: { id: 'mock' } }; } } };
  const app = createApp({ http, mailer, tokenProvider: async () => 'mock-token', now: () => time, env: options.env || {} });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  async function request(path, body, token, method = 'POST') {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
    });
    return { status: response.status, ...(await response.json()) };
  }
  const send = () => request('/send-otp', { email: ' Person@Example.test ' });
  const code = () => sent.at(-1).html.match(/<h2>(\d{6})<\/h2>/)[1];
  const verify = otp => request('/contact', { email: 'person@example.test', otp: otp || code() });
  const login = async () => { await send(); return verify(); };
  return { request, send, code, verify, login, updates, http, advance: ms => { time += ms; } };
}

test('requires authentication and restricts updates to verified identity and fields', async t => {
  const f = await fixture(t);
  assert.equal((await f.request('/contact', { id: 'contact-1', data: { Ins_skills: 'JS' } }, null, 'PUT')).status, 401);
  const login = await f.login();
  assert.equal(login.status, 200);
  assert.equal(login.data.Owner, undefined);
  assert.match(login.sessionToken, /^[a-f0-9]{64}$/);
  assert.equal((await f.request('/contact', { id: 'contact-2', data: { Ins_skills: 'JS' } }, login.sessionToken, 'PUT')).status, 403);
  for (const data of [{ id: 'contact-2' }, { Email: 'other@example.test' }, { Owner: 'someone' }, { Mobile: 'abc' }, { PAN_Number: 'invalid' }, { LinkedIn_URL: 'https://linkedin.com.evil.test/in/jane' }, { Ins_skills: 'x'.repeat(223) }, { US_Visa: 'true' }, { Languages_Known: [42] }, {}]) {
    assert.equal((await f.request('/contact', { id: 'contact-1', data }, login.sessionToken, 'PUT')).status, 400, JSON.stringify(data));
  }
  assert.equal(f.updates.length, 0);
  const data = { Ins_skills: 'JavaScript', Mobile: '9876543210', Country_Code: '+91', US_Visa: false, Languages_Known: [] };
  assert.equal((await f.request('/contact', { id: 'contact-1', data }, login.sessionToken, 'PUT')).success, true);
  assert.deepEqual(f.updates[0], { data: [{ ...data, id: 'contact-1' }] });
});

test('expires sessions and consumes OTP exactly once', async t => {
  const f = await fixture(t);
  const login = await f.login();
  assert.equal((await f.verify()).status, 401);
  f.advance(60 * 60 * 1000);
  assert.equal((await f.request('/contact', { id: 'contact-1', data: { Ins_skills: 'JS' } }, login.sessionToken, 'PUT')).status, 401);
});

test('expires codes and caps verification attempts', async t => {
  const f = await fixture(t);
  await f.send();
  f.advance(10 * 60 * 1000);
  assert.equal((await f.verify()).status, 401);
  await f.send();
  for (let i = 0; i < 5; i++) assert.equal((await f.verify('000000')).status, 401);
  assert.equal((await f.verify()).status, 401);
});

test('throttles resends and invalidates superseded codes', async t => {
  const f = await fixture(t);
  assert.equal((await f.send()).status, 200);
  assert.equal((await f.send()).status, 429);
  f.advance(60000);
  assert.equal((await f.send()).status, 200);
  for (let i = 0; i < 3; i++) { f.advance(60000); assert.equal((await f.send()).status, 200); }
  f.advance(60000);
  assert.equal((await f.send()).status, 429);
});

test('does not retain a code when email delivery fails', async t => {
  const f = await fixture(t, { mailError: true });
  assert.equal((await f.send()).status, 502);
  assert.equal((await f.verify()).status, 401);
});

test('allows retry after CRM outage and never reports unconfirmed updates as saved', async t => {
  const f = await fixture(t);
  await f.send();
  const get = f.http.get;
  f.http.get = async () => { throw new Error('mock outage'); };
  assert.equal((await f.verify()).status, 502);
  f.http.get = get;
  const login = await f.verify();
  assert.equal(login.status, 200);
  f.http.put = async () => ({ data: {} });
  assert.equal((await f.request('/contact', { id: 'contact-1', data: { Ins_skills: 'JS' } }, login.sessionToken, 'PUT')).success, false);
});

test('does not authenticate a different contact returned by CRM', async t => {
  const f = await fixture(t, { http: { get: async () => ({ data: { data: [{ id: 'wrong', Email: 'other@example.test' }] } }) } });
  assert.equal((await f.login()).status, 404);
});

test('rejects malformed request bodies with JSON errors', async t => {
  const f = await fixture(t);
  assert.equal((await f.request('/send-otp', null)).status, 400);
  assert.equal((await f.request('/send-otp', { email: ['person@example.test'] })).status, 400);
});


test('accepts a verified secondary email even when the primary email differs or is empty', async t => {
  for (const primary of ['primary@example.test', null]) {
    await t.test(String(primary), async t => {
      const f = await fixture(t, { http: { get: async () => ({ data: { data: [{
        id: 'contact-1', Email: primary, Secondary_Email: ' Person@Example.Test ',
      }] } }) } });
      const login = await f.login();
      assert.equal(login.status, 200);
      assert.equal(login.data.id, 'contact-1');
      assert.equal((await f.request('/contact', { id: 'contact-1', data: { Ins_skills: 'JS' } }, login.sessionToken, 'PUT')).success, true);
    });
  }
});

test('matches configured custom email fields without trusting unrelated fields', async t => {
  const record = { id: 'contact-1', Email: 'primary@example.test', Instructor_Email: 'person@example.test', Description: 'person@example.test' };
  const http = { get: async () => ({ data: { data: [record] } }) };
  const unconfigured = await fixture(t, { http });
  assert.equal((await unconfigured.login()).status, 404);
  const configured = await fixture(t, { http, env: { ZOHO_CONTACT_EMAIL_FIELDS: 'Instructor_Email' } });
  assert.equal((await configured.login()).status, 200);
});

test('retains exact email matching for similar-looking search results', async t => {
  const f = await fixture(t, { http: { get: async () => ({ data: { data: [{
    id: 'wrong', Email: 'person+other@example.test', Secondary_Email: 'person@example.test.evil',
  }] } }) } });
  assert.equal((await f.login()).status, 404);
});

test('allows retrying a verified code after the CRM email mapping is corrected', async t => {
  const f = await fixture(t, { http: { get: async () => ({ status: 204, data: '' }) } });
  await f.send();
  assert.equal((await f.verify()).status, 404);
  f.http.get = async () => ({ data: { data: [{ id: 'contact-1', Secondary_Email: 'person@example.test' }] } });
  assert.equal((await f.verify()).status, 200);
});
