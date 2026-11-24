// Load profiles: HOW MUCH load. Scenarios (articles.js, ...) describe WHAT a user does.
// Pick one with -e PROFILE=<name>; the default is smoke.
// Numbers are sized for the app running locally in Docker, not for production.

// Normal operation: the same strict SLO for smoke, load and soak
const SLO = {
  http_req_failed: ['rate<0.01'], // under 1% of requests fail (non-2xx/3xx or network error)
  http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500 ms, 99% under 1 s
  checks: ['rate>0.99'], // checks alone never fail the run, this threshold does
};

// Overload: the system may slow down, but must degrade gracefully, not fall over
const DEGRADED = {
  http_req_failed: ['rate<0.05'],
  http_req_duration: ['p(95)<2000'],
  checks: ['rate>0.95'],
};

const PROFILES = {
  // Does the script work at all: 1 user
  smoke: {
    stages: [{ duration: '30s', target: 1 }],
    thresholds: SLO,
  },
  // Expected load: ramp up, hold, ramp down
  load: {
    stages: [
      { duration: '30s', target: 20 },
      { duration: '1m', target: 20 },
      { duration: '15s', target: 0 },
    ],
    thresholds: SLO,
  },
  // Above the expected load in steps: where do the thresholds start to break
  stress: {
    stages: [
      { duration: '30s', target: 20 },
      { duration: '30s', target: 50 },
      { duration: '30s', target: 100 },
      { duration: '30s', target: 100 },
      { duration: '15s', target: 0 },
    ],
    thresholds: DEGRADED,
  },
  // A sudden burst and back: does the system survive and recover
  spike: {
    stages: [
      { duration: '20s', target: 5 },
      { duration: '10s', target: 100 },
      { duration: '20s', target: 100 },
      { duration: '10s', target: 5 },
      { duration: '20s', target: 5 },
    ],
    thresholds: DEGRADED,
  },
  // Expected load for a long time: memory leaks, connection pool exhaustion
  soak: {
    stages: [
      { duration: '1m', target: 20 },
      { duration: '30m', target: 20 },
      { duration: '1m', target: 0 },
    ],
    thresholds: SLO,
  },
};

export function getOptions(name = 'smoke') {
  const profile = PROFILES[name];
  // Fail fast: without stages k6 would silently run 1 iteration and report green
  if (!profile) {
    throw new Error(`Unknown PROFILE "${name}". Use one of: ${Object.keys(PROFILES).join(', ')}`);
  }
  return profile;
}
