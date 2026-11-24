// Scenario: an author logs in, browses the feed, publishes an article, opens it and deletes it.
// Users are registered once in setup() (one per VU); each iteration logs in again,
// because login (password hashing) is a real and expensive part of the journey.
// The article is deleted at the end, so the DB does not grow between runs.
// Run: npm run load:publish                       (smoke)
//      npm run load:publish -- -e PROFILE=load    (smoke | load | stress | spike | soak)
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { getOptions } from './profiles.js';

const API_URL = __ENV.API_URL || 'http://localhost:3001';
const PASSWORD = 'Passw0rd!';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Group names: used both in group() and in the per-step thresholds, so they cannot drift apart
const STEP = {
  login: 'log in',
  browse: 'browse articles',
  publish: 'publish article',
  open: 'open article',
  delete: 'delete article',
};

const profile = getOptions(__ENV.PROFILE);

export const options = {
  ...profile,
  thresholds: {
    ...profile.thresholds,
    // The same checks rate per step: an overall rate hides one broken step among many
    // healthy requests (e.g. 1% of failed list requests inside 5 steps is only 0.2% overall)
    ...Object.fromEntries(
      Object.values(STEP).map((step) => [`checks{group:::${step}}`, profile.thresholds.checks]),
    ),
  },
};

// Read in the init code: inside setup() k6 has already converted `options` to its own types,
// and `stage.target` is no longer a JS number there (Math.max would give NaN and 0 users)
const USER_COUNT = Math.max(...profile.stages.map((stage) => stage.target));

// Runs once before the load: one user per VU, so VUs never share an author
export function setup() {
  // Fail loudly: with 0 users every iteration would crash and the run would still report green
  if (!(USER_COUNT > 0)) {
    throw new Error(`setup: invalid user count ${USER_COUNT}`);
  }
  const runId = Date.now();
  const users = [];

  for (let i = 1; i <= USER_COUNT; i++) {
    const user = {
      username: `load${runId}u${i}`,
      email: `load${runId}u${i}@example.com`,
      password: PASSWORD,
    };
    const res = http.post(`${API_URL}/api/users`, JSON.stringify({ user }), {
      headers: JSON_HEADERS,
    });
    // Without users the whole run is meaningless: stop here instead of reporting failed checks
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`setup: user registration failed with ${res.status}: ${res.body}`);
    }
    users.push(user);
  }
  return { users };
}

export default function (data) {
  const user = data.users[(__VU - 1) % data.users.length];
  let token;
  let slug;

  group(STEP.login, () => {
    const res = http.post(
      `${API_URL}/api/users/login`,
      JSON.stringify({ user: { email: user.email, password: user.password } }),
      { headers: JSON_HEADERS },
    );
    check(res, { 'login: status is 200': (r) => r.status === 200 });
    token = res.json('user.token');
  });
  // Every next step needs the token: skip the rest of this iteration instead of piling up 401s
  if (!token) return;
  const authHeaders = { ...JSON_HEADERS, Authorization: `Token ${token}` };
  sleep(1);

  group(STEP.browse, () => {
    const res = http.get(`${API_URL}/api/articles?limit=10&offset=0`, { headers: authHeaders });
    check(res, { 'list: status is 200': (r) => r.status === 200 });
  });
  sleep(2);

  group(STEP.publish, () => {
    // __VU + __ITER + time: unique title, so slugs never collide between VUs
    const title = `Load ${__VU}-${__ITER}-${Date.now()}`;
    const article = {
      title,
      description: 'Load test article',
      body: 'Created by the k6 publish-article scenario.',
      tagList: ['load'],
    };
    const res = http.post(`${API_URL}/api/articles`, JSON.stringify({ article }), {
      headers: authHeaders,
    });
    check(res, { 'create: status is 201': (r) => r.status === 201 });
    slug = res.json('article.slug');
  });
  if (!slug) return;
  sleep(1);

  // One metric name for all slugs: without the tag every URL would be a separate metric series
  const articleTags = { tags: { name: `${API_URL}/api/articles/:slug` } };

  group(STEP.open, () => {
    const res = http.get(`${API_URL}/api/articles/${slug}`, {
      headers: authHeaders,
      ...articleTags,
    });
    check(res, {
      'open: status is 200': (r) => r.status === 200,
      'open: author is the current user': (r) =>
        r.json('article.author.username') === user.username,
    });
  });
  sleep(1);

  group(STEP.delete, () => {
    const res = http.del(`${API_URL}/api/articles/${slug}`, null, {
      headers: authHeaders,
      ...articleTags,
    });
    // The spec says 204; the app returns 200 (known bug, see README), so both mean "deleted"
    check(res, { 'delete: article deleted': (r) => r.status === 204 || r.status === 200 });
  });
}
