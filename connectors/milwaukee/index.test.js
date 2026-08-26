/**
 * Fixtures are verbatim from a live Milwaukee Connect response captured
 * 2026-08-25 against Industrial Supply's Spanish Fork site. Prices are replaced
 * with round stand-ins — this repo is public and the real numbers are theirs.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMilwaukeeConnector, normalizeSku } from './index.js';

const LIVE_SHAPE = {
  lines: [
    {
      lineNumber: 0, sku: '276720',
      description: 'M18 FUEL™ 1/2" High Torque Impact Wrench with Friction Ring (Tool Only)',
      quantity: 1, expectedSku: '276720', actualSku: '276720',
      isTransition: false, isReplacement: false, replacementSku: null,
      stockStatus: 'discontinuedoutofstock',
      unitPrice: 400.0, netPrice: 200.0, totalPrice: 200.0,
      pricingErrorCode: null, pricingErrorMessage: null,
      itemAvailabilityErrorCode: null, itemAvailabilityErrorMessage: null,
      restrictedDescription: null, isValid: true, errorFlags: [],
      minimumQuantityAllowed: 0, maximumQuantityAllowed: 0, quantityMultipleAllowed: 0,
      recoveryDate: null, recoveryDateMessage: null,
    },
    {
      lineNumber: 2, sku: '290420',
      description: 'M18 FUEL™ 1/2" Hammer Drill/Driver - Cordless Power Tool',
      quantity: 1, expectedSku: '290420', actualSku: '290420',
      isTransition: false, isReplacement: false, replacementSku: null,
      stockStatus: 'instock',
      unitPrice: 300.0, netPrice: 150.0, totalPrice: 150.0,
      pricingErrorCode: null, pricingErrorMessage: null,
      itemAvailabilityErrorCode: null, itemAvailabilityErrorMessage: null,
      restrictedDescription: null, isValid: true, errorFlags: [],
      minimumQuantityAllowed: 0, maximumQuantityAllowed: 0, quantityMultipleAllowed: 0,
      recoveryDate: null, recoveryDateMessage: null,
    },
    {
      lineNumber: 1, sku: '48111862',
      description: 'M18™ REDLITHIUM™ HIGH OUTPUT™ XC6.0 Battery Pack (2 Pk)',
      quantity: 2, expectedSku: '48111862ZY', actualSku: '48111862',
      isTransition: true, isReplacement: false, replacementSku: null,
      stockStatus: 'backorder',
      unitPrice: 500.0, netPrice: 250.0, totalPrice: 500.0,
      pricingErrorCode: null, pricingErrorMessage: null,
      itemAvailabilityErrorCode: null, itemAvailabilityErrorMessage: null,
      restrictedDescription: null, isValid: true, errorFlags: [],
      minimumQuantityAllowed: 0, maximumQuantityAllowed: 0, quantityMultipleAllowed: 0,
      recoveryDate: null, recoveryDateMessage: null,
    },
  ],
};

function stubFetch(body, { status = 200 } = {}) {
  const calls = [];
  const f = async (url, init) => {
    calls.push({ url, init, payload: JSON.parse(init.body) });
    return {
      ok: status >= 200 && status < 300,
      status,
      headers: new Map(),
      json: async () => body,
    };
  };
  f.calls = calls;
  return f;
}

const connector = (f) =>
  createMilwaukeeConnector({ token: 'test-token', site: '200000000', fetch: f });

test('sends the exact payload shape Milwaukee expects', async () => {
  const f = stubFetch(LIVE_SHAPE);
  await connector(f).quote([{ sku: '2767-20' }, { sku: '48-11-1862', quantity: 2 }]);

  assert.equal(f.calls.length, 1, 'one batched call, not one call per SKU');
  assert.match(f.calls[0].url, /\/quick-quote\/200000000$/);
  assert.deepEqual(f.calls[0].payload, {
    organizationCode: 'MT',
    items: [
      { lineNumber: 0, sku: '276720', quantity: 1 },
      { lineNumber: 1, sku: '48111862', quantity: 2 },
    ],
  });
  assert.match(f.calls[0].init.headers.authorization, /^Bearer test-token$/);
});

test('strips separators from part numbers', () => {
  assert.equal(normalizeSku('2767-20'), '276720');
  assert.equal(normalizeSku('48-11-1862'), '48111862');
  assert.equal(normalizeSku(' 2853-20 '), '285320');
});

test('surfaces net price even when the portal UI would blank it', async () => {
  const [discontinued] = await connector(stubFetch(LIVE_SHAPE)).quote([{ sku: '2767-20' }]);
  assert.equal(discontinued.availability.status, 'discontinued');
  assert.equal(discontinued.netPrice, 200.0, 'net price must survive a discontinued line');
  assert.equal(discontinued.listPrice, 400.0);
});

test('never reports unknown stock as zero', async () => {
  const lines = await connector(stubFetch(LIVE_SHAPE)).quote([{ sku: '2767-20' }, { sku: '48-11-1862', quantity: 2 }]);
  for (const l of lines) {
    assert.equal(l.availability.onHand, null, 'onHand must be null, never 0');
    assert.equal(l.availability.location, null);
    assert.ok(
      l.warnings.some((w) => w.includes('no on-hand quantity')),
      'every line must carry the availability caveat',
    );
  }
});

test('flags a superseded part instead of quoting it silently', async () => {
  const lines = await connector(stubFetch(LIVE_SHAPE)).quote([{ sku: '2767-20' }, { sku: '48-11-1862', quantity: 2 }]);
  const battery = lines[1];
  assert.deepEqual(battery.supersession, { replacedBy: '48111862', kind: 'transition' });
  assert.ok(battery.warnings.some((w) => w.includes('superseded')));
  assert.equal(battery.extended, 500.0, 'extended price honours quantity');
});

test('stamps every line with source, scope and read time', async () => {
  const [line] = await connector(stubFetch(LIVE_SHAPE)).quote([{ sku: '2767-20' }]);
  assert.equal(line.source, 'api');
  assert.equal(line.scope, 'ship-to site 200000000 only');
  assert.ok(!Number.isNaN(Date.parse(line.asOf)), 'asOf must be a real timestamp');
});

test('a missing line reads as unknown, not unavailable', async () => {
  const [line] = await connector(stubFetch({ lines: [] })).quote([{ sku: '9999-99' }]);
  assert.equal(line.availability.status, 'unknown');
  assert.equal(line.netPrice, null);
  assert.ok(line.warnings.some((w) => w.includes('not unavailable')));
});

test('maps every stockStatus value seen on the wire', async () => {
  // "instock" confirmed live 2026-08-26; the other two 2026-08-25.
  const lines = await connector(stubFetch(LIVE_SHAPE)).quote([
    { sku: '2767-20' }, { sku: '48-11-1862', quantity: 2 }, { sku: '2904-20' },
  ]);
  assert.equal(lines[0].availability.status, 'discontinued');
  assert.equal(lines[1].availability.status, 'backorder');
  assert.equal(lines[2].availability.status, 'in_stock');
  assert.equal(lines[2].netPrice, 150.0);
});

test('an expired token fails loudly and says what to do', async () => {
  await assert.rejects(
    () => connector(stubFetch({}, { status: 401 })).quote([{ sku: '2767-20' }]),
    (err) => err.name === 'AuthError' && /fresh one/.test(err.message),
  );
});

test('batches a 120-SKU list into three calls', async () => {
  const f = stubFetch({ lines: [] });
  const many = Array.from({ length: 120 }, (_, i) => ({ sku: `48-11-${1000 + i}` }));
  const lines = await connector(f).quote(many);
  assert.equal(f.calls.length, 3, '50 per request');
  assert.equal(lines.length, 120, 'every requested part comes back, even unmatched');
});
