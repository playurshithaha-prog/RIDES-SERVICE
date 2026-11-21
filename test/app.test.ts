import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApp } from '../src/app.ts';

test('health reports that the service is up', async (context) => {
  const app = buildApp();
  context.after(() => app.close());
  const response = await app.inject('/health');
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: 'ok' });
});

test('invalid query parameters return a structured 400', async (context) => {
  const app = buildApp();
  context.after(() => app.close());
  const response = await app.inject('/health?unknown=yes');
  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), {
    error: { code: 'VALIDATION_ERROR', message: 'Invalid request.' },
  });
});

test('unknown routes return a structured 404', async (context) => {
  const app = buildApp();
  context.after(() => app.close());
  const response = await app.inject('/missing');
  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.json(), {
    error: { code: 'NOT_FOUND', message: 'Route not found.' },
  });
});

test('unexpected errors return a generic 500', async (context) => {
  const app = buildApp();
  context.after(() => app.close());
  app.get('/failure', async () => { throw new Error('internal detail'); });
  const response = await app.inject('/failure');
  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.json(), {
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
  });
});
