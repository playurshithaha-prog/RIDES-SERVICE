import assert from 'node:assert/strict';
import test from 'node:test';
import { nextStatus, quoteRide, steps } from '../lib/demo.ts';

test('demo quotes include duration and reconcile in MAD minor units', () => {
  const quote = quoteRide('port', 'maarif');
  assert.ok(quote);
  assert.equal(quote.pickup.id, 'port');
  assert.equal(quote.dropoff.id, 'maarif');
  assert.ok(quote.minutes > 0);
  assert.ok(Number.isInteger(quote.totalMinor));
  assert.equal(quote.totalMinor, quote.baseMinor + quote.distanceMinor);
});

test('demo quotes reject identical and unknown stops', () => {
  assert.equal(quoteRide('port', 'port'), null);
  assert.equal(quoteRide('unknown', 'port'), null);
});

test('demo tracking advances in sequence and completion is terminal', () => {
  assert.deepEqual(steps.map(nextStatus), ['approaching', 'onboard', 'completed', 'completed']);
});
