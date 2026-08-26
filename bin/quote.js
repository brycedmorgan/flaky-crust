#!/usr/bin/env node
/**
 * Price a list of parts against a live manufacturer connector.
 *
 *   MILWAUKEE_SITE=... MILWAUKEE_TOKEN=... node bin/quote.js 2767-20 48-11-1862x2
 *
 * The token is an Auth0 bearer read from the browser session. It is short-lived
 * by design. Pass it in the environment — never as an argument (arguments land
 * in shell history), and never committed.
 */

import { createMilwaukeeConnector } from '../connectors/milwaukee/index.js';
import { AuthError } from '../connectors/interface.js';

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const asJson = process.argv.includes('--json');

if (args.length === 0) {
  console.error('Usage: node bin/quote.js <sku>[x<qty>] ...    e.g. 2767-20 48-11-1862x2');
  process.exit(2);
}

const { MILWAUKEE_TOKEN, MILWAUKEE_SITE, MILWAUKEE_SCOPE } = process.env;

if (!MILWAUKEE_TOKEN || !MILWAUKEE_SITE) {
  console.error(
    'Missing MILWAUKEE_TOKEN and/or MILWAUKEE_SITE.\n' +
      'Copy .env.example, fill it in, and source it. See docs/CONNECTOR_ACCESS_LOG.md.',
  );
  process.exit(2);
}

const items = args.map((a) => {
  const [sku, qty] = a.split(/x(?=\d+$)/i);
  return { sku, quantity: qty ? Number(qty) : 1 };
});

const connector = createMilwaukeeConnector({
  token: MILWAUKEE_TOKEN,
  site: MILWAUKEE_SITE,
  scopeLabel: MILWAUKEE_SCOPE,
});

const usd = (v) => (v === null ? '—' : `$${v.toFixed(2)}`);

try {
  const lines = await connector.quote(items);

  if (asJson) {
    console.log(JSON.stringify(lines, null, 2));
    process.exit(0);
  }

  const rows = lines.map((l) => ({
    Part: l.sku,
    Description: (l.description || '').slice(0, 44),
    Qty: l.quantity,
    List: usd(l.listPrice),
    Net: usd(l.netPrice),
    Extended: usd(l.extended),
    Availability: l.availability.status,
  }));

  console.table(rows);

  const total = lines.reduce((sum, l) => sum + (l.extended ?? 0), 0);
  const priced = lines.filter((l) => l.extended !== null).length;
  console.log(`\nTotal (${priced} of ${lines.length} lines priced): ${usd(total)}`);
  console.log(`Scope: ${connector.scope}`);
  console.log(`Read:  ${lines[0]?.asOf ?? new Date().toISOString()}`);

  const notes = [...new Set(lines.flatMap((l) => l.warnings))];
  if (notes.length) {
    console.log('\nNotes:');
    for (const n of notes) console.log(`  · ${n}`);
  }
} catch (err) {
  if (err instanceof AuthError) {
    console.error(`\n${err.message}`);
    process.exit(1);
  }
  console.error(`\n${err.name}: ${err.message}`);
  process.exit(1);
}
