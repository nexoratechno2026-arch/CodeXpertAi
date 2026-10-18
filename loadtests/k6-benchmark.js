import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrics
const errorRate = new Rate('error_rate');
const submissionDuration = new Trend('submission_duration');
const problemListingDuration = new Trend('problem_listing_duration');
const successfulRequests = new Counter('successful_requests');

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Warm up to 50 VUs
    { duration: '1m', target: 250 },   // Ramp up to 250 VUs
    { duration: '3m', target: 250 },   // Sustain 250 VUs peak load
    { duration: '30s', target: 0 },    // Graceful ramp-down
  ],
  thresholds: {
    // 95% of requests must complete below 350ms
    http_req_duration: ['p(95)<350'],
    // Error rate must stay strictly below 0.1% (99.9% success)
    error_rate: ['rate<0.001'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:5000';

export default function () {
  const userType = Math.random();

  // 1. Browsing Problems (60% traffic share)
  if (userType < 0.6) {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/codelab/problems`);
    problemListingDuration.add(Date.now() - start);

    const success = check(res, {
      'status is 200': (r) => r.status === 200,
      'response received': (r) => r.body && r.body.length > 0,
    });

    if (success) {
      successfulRequests.add(1);
    } else {
      errorRate.add(1);
    }
  } 
  // 2. Dashboard & Student Profile (25% traffic share)
  else if (userType < 0.85) {
    const res = http.get(`${BASE_URL}/dashboard`);
    const success = check(res, {
      'status is 200': (r) => r.status === 200,
    });

    if (success) {
      successfulRequests.add(1);
    } else {
      errorRate.add(1);
    }
  } 
  // 3. Interview AI Preparation / Workspace (15% traffic share)
  else {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/interview`);
    submissionDuration.add(Date.now() - start);

    const success = check(res, {
      'status is 200': (r) => r.status === 200,
    });

    if (success) {
      successfulRequests.add(1);
    } else {
      errorRate.add(1);
    }
  }

  // Realistic human think time between actions (1s - 3s)
  sleep(1 + Math.random() * 2);
}
