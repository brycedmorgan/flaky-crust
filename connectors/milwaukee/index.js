/**
 * Milwaukee Tool — connector #1.
 *
 * Milwaukee Connect is a thin SPA over a JSON service at /capi/v1/. There is no
 * published API and no documentation; the shapes below were read off the wire on
 * 2026-08-25 and are recorded in docs/CONNECTOR_ACCESS_LOG.md.
 *
 * Auth is an Auth0 bearer token, supplied by the caller. This module never reads
 * a credential store, never logs a token, and never persists one.
 *
 * Two behaviours that exist because the portal earned them:
 *
 *   - We build against the service, not the page. The UI blanks the price column
 *     on discontinued lines; the JSON returns netPrice for them anyway.
 *   - Superseded parts come back under a DIFFERENT part number with a flag. A
 *     connector that ignores that quietly quotes the wrong generation of a tool.
 */

import { SOURCE, ConnectorError, AuthError } from '../interface.js';

const BASE = 'https://connect.milwaukeetool.com/capi/v1';
const ORG = 'MT';

/** Milwaukee's own cap is unknown. 50 keeps requests small enough to retry cheaply. */
const BATCH_SIZE = 50;

/**
 * Milwaukee stores part numbers without separators: 2767-20 -> 276720.
 * Send them what they store, or the lookup silently returns nothing.
 */
export function normalizeSku(sku) {
  return String(sku).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Their stockStatus vocabulary -> ours. Anything unrecognized stays `unknown`. */
function mapStatus(raw) {
  const s = String(raw || '').toLowerCase();
  if (!s) return 'unknown';
  if (s.includes('discontinued')) return 'discontinued';
  if (s.includes('backorder')) return 'backorder';
  if (s.includes('instock') || s.includes('in_stock')) return 'in_stock';
  return 'unknown';
}

function money(v) {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {Object} cfg
 * @param {string} cfg.token  Auth0 bearer token (no "Bearer " prefix needed)
 * @param {string} cfg.site   ship-to site number the quote is priced against
 * @param {string=} cfg.scopeLabel  human description of what that site covers
 * @param {typeof fetch=} cfg.fetch  injectable for tests
 */
export function createMilwaukeeConnector({ token, site, scopeLabel, fetch: f = fetch }) {
  if (!token) throw new AuthError('Milwaukee: no token supplied.', { brand: 'milwaukee' });
  if (!site) throw new ConnectorError('Milwaukee: no ship-to site number supplied.', { brand: 'milwaukee' });

  const scope = scopeLabel || `ship-to site ${site} only`;

  async function post(path, payload, attempt = 0) {
    let res;
    try {
      res = await f(`${BASE}${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-US',
          authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (cause) {
      if (attempt < 3) {
        await sleep(2 ** attempt * 500);
        return post(path, payload, attempt + 1);
      }
      throw new ConnectorError(`Milwaukee: network failure calling ${path} — ${cause.message}`, {
        brand: 'milwaukee', retryable: true,
      });
    }

    if (res.status === 401 || res.status === 403) {
      throw new AuthError(
        'Milwaukee: token rejected (401/403). Auth0 tokens are short-lived — get a fresh one and retry.',
        { brand: 'milwaukee', status: res.status },
      );
    }

    if (res.status === 429 || res.status >= 500) {
      if (attempt < 3) {
        const wait = Number(res.headers.get('retry-after')) * 1000 || 2 ** attempt * 1000;
        await sleep(wait);
        return post(path, payload, attempt + 1);
      }
      throw new ConnectorError(`Milwaukee: ${res.status} from ${path} after 4 attempts.`, {
        brand: 'milwaukee', status: res.status, retryable: true,
      });
    }

    if (!res.ok) {
      throw new ConnectorError(`Milwaukee: ${res.status} from ${path}.`, {
        brand: 'milwaukee', status: res.status,
      });
    }

    return res.json();
  }

  /**
   * @param {{sku: string, quantity?: number}[]} items
   * @returns {Promise<import('../interface.js').PriceLine[]>}
   */
  async function quote(items) {
    if (!Array.isArray(items) || items.length === 0) return [];

    const results = [];

    for (const group of chunk(items, BATCH_SIZE)) {
      const payload = {
        organizationCode: ORG,
        items: group.map((it, i) => ({
          lineNumber: i,
          sku: normalizeSku(it.sku),
          quantity: it.quantity ?? 1,
        })),
      };

      const body = await post(`/quick-quote/${site}`, payload);
      const asOf = new Date().toISOString();
      const lines = Array.isArray(body?.lines) ? body.lines : [];

      group.forEach((requested, i) => {
        const line = lines.find((l) => l.lineNumber === i);
        if (!line) {
          results.push(missingLine(requested, asOf, scope));
          return;
        }
        results.push(toPriceLine(requested, line, asOf, scope));
      });
    }

    return results;
  }

  return { name: 'milwaukee', scope, quote };
}

function missingLine(requested, asOf, scope) {
  return {
    brand: 'milwaukee',
    requestedSku: requested.sku,
    sku: normalizeSku(requested.sku),
    description: undefined,
    quantity: requested.quantity ?? 1,
    listPrice: null,
    netPrice: null,
    extended: null,
    currency: 'USD',
    availability: { status: 'unknown', onHand: null, location: null, etaDate: null, etaNote: null },
    supersession: null,
    scope,
    source: SOURCE.API,
    asOf,
    warnings: ['Milwaukee returned no line for this part. Treat as unknown, not unavailable.'],
  };
}

function toPriceLine(requested, line, asOf, scope) {
  const warnings = [];

  if (line.pricingErrorMessage) warnings.push(`Pricing: ${line.pricingErrorMessage}`);
  if (line.itemAvailabilityErrorMessage) warnings.push(`Availability: ${line.itemAvailabilityErrorMessage}`);
  if (line.isValid === false) warnings.push('Milwaukee flagged this line invalid.');
  if (Array.isArray(line.errorFlags) && line.errorFlags.length) {
    warnings.push(`Flags: ${line.errorFlags.join(', ')}`);
  }
  if (line.restrictedDescription) warnings.push(`Restricted: ${line.restrictedDescription}`);

  // Milwaukee answers "can I get it", never "how many, from where". Say so once,
  // here, rather than letting a null quietly read as zero downstream.
  warnings.push('Milwaukee reports a stock status only — no on-hand quantity, warehouse, or ship-from.');

  const supersession =
    line.isReplacement && line.replacementSku
      ? { replacedBy: String(line.replacementSku), kind: 'replacement' }
      : line.isTransition && line.actualSku && line.actualSku !== line.expectedSku
        ? { replacedBy: String(line.actualSku), kind: 'transition' }
        : null;

  if (supersession) {
    warnings.push(
      `Part superseded: asked for ${line.expectedSku}, quoted ${supersession.replacedBy}. Confirm before quoting a customer.`,
    );
  }

  const netPrice = money(line.netPrice);
  const quantity = line.quantity ?? requested.quantity ?? 1;

  return {
    brand: 'milwaukee',
    requestedSku: requested.sku,
    sku: String(line.actualSku || line.sku),
    description: typeof line.description === 'string' ? line.description.trim() : undefined,
    quantity,
    listPrice: money(line.unitPrice),
    netPrice,
    extended: money(line.totalPrice) ?? (netPrice === null ? null : netPrice * quantity),
    currency: 'USD',
    availability: {
      status: mapStatus(line.stockStatus),
      onHand: null,
      location: null,
      etaDate: line.recoveryDate ?? null,
      etaNote: line.recoveryDateMessage ?? null,
    },
    supersession,
    scope,
    source: SOURCE.API,
    asOf,
    warnings,
  };
}
