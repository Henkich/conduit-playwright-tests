// Scenario: a guest browses the public article list, GET /api/articles
// (read-only, no setup or cleanup). The load profile comes from profiles.js.
// Run: npm run load:browse                       (smoke)
//      npm run load:browse -- -e PROFILE=stress   (smoke | load | stress | spike | soak)
import http from 'k6/http';
import { check, sleep } from 'k6';
import { getOptions } from './profiles.js';

const API_URL = __ENV.API_URL || 'http://localhost:3001';

export const options = getOptions(__ENV.PROFILE);

export default function () {
  const res = http.get(`${API_URL}/api/articles?limit=10&offset=0`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'body has an articles array': (r) => Array.isArray(r.json('articles')),
  });

  sleep(1); // think time: a real user reads the page before the next request
}
