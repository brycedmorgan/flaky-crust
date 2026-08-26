/**
 * The connector contract.
 *
 * Every manufacturer is one implementation of this shape. The messy reality —
 * some JSON API, some EDI feed, some login-only portal, some phone-only — stays
 * behind this interface so the console never learns a brand's quirks.
 *
 * A connector implements:
 *
 *   name          string   brand key, e.g. "milwaukee"
 *   quote(items)  async    [{ sku, quantity }] -> [PriceLine]
 *
 * PriceLine is the normalized record. Two rules it must never break:
 *
 *   1. Every field carries its source and the moment it was read. A number with
 *      no "as of" is a liability — pricing and stock both move.
 *   2. Data we do not have is null, never zero and never a guess. `onHand: 0`
 *      is a claim that the shelf is empty. `onHand: null` is the truth when the
 *      manufacturer only told us "backorder".
 */

/**
 * @typedef {Object} PriceLine
 * @property {string}  brand           connector name
 * @property {string}  requestedSku    exactly what the user typed
 * @property {string}  sku             the manufacturer's canonical part number
 * @property {string=} description
 * @property {number}  quantity
 * @property {number|null} listPrice   published list, null if not returned
 * @property {number|null} netPrice    THIS distributor's net. The whole product.
 * @property {number|null} extended    netPrice x quantity
 * @property {string}  currency
 * @property {Availability} availability
 * @property {Supersession|null} supersession
 * @property {string}  scope           what the number covers — a branch, or the parent
 * @property {string}  source          which rail answered: "api" | "feed" | "portal"
 * @property {string}  asOf            ISO timestamp of the read
 * @property {string[]} warnings       anything the caller must show a human
 */

/**
 * @typedef {Object} Availability
 * @property {'in_stock'|'backorder'|'discontinued'|'unknown'} status
 * @property {number|null} onHand      units. null when the brand won't say.
 * @property {string|null} location    ship-from DC. null when the brand won't say.
 * @property {string|null} etaDate     ISO date, null when unknown
 * @property {string|null} etaNote     the brand's own words, verbatim
 */

/**
 * @typedef {Object} Supersession
 * @property {string} replacedBy       the part actually quoted
 * @property {'transition'|'replacement'} kind
 */

export const SOURCE = { API: 'api', FEED: 'feed', PORTAL: 'portal' };

export class ConnectorError extends Error {
  constructor(message, { brand, status, retryable = false } = {}) {
    super(message);
    this.name = 'ConnectorError';
    this.brand = brand;
    this.status = status;
    this.retryable = retryable;
  }
}

/** Thrown when credentials are missing or expired. Always actionable, never silent. */
export class AuthError extends ConnectorError {
  constructor(message, opts) {
    super(message, opts);
    this.name = 'AuthError';
  }
}
