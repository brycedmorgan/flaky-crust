# Connectors

One interface, many implementations. Adding a manufacturer never touches the console.

| Brand | Status | Rail | Scope |
|---|---|---|---|
| [Milwaukee](milwaukee/) | built | undocumented JSON API (`/capi/v1/`) | one ship-to site — parent access requested |
| 3M (VCOM) | not started | unknown | — |
| DeWalt | not started | unknown | — |

## The contract

See [interface.js](interface.js). A connector exposes `name`, `scope`, and
`quote(items) -> PriceLine[]`.

Two rules a connector may not break:

1. **Every number carries its source and the moment it was read.** Price and stock
   both move. A figure with no "as of" is a liability the moment a rep quotes it.
2. **What we do not have is `null`, never `0`.** `onHand: 0` tells a rep the shelf
   is empty. `onHand: null` tells the truth when the manufacturer only said
   "backorder". The Milwaukee connector's test suite enforces this.

## Running a real quote

```bash
cp .env.example .env      # fill in, never commit
set -a && source .env && set +a
node bin/quote.js 2767-20 48-11-1862x2
node bin/quote.js 2767-20 --json
```

The token is an Auth0 bearer from a signed-in Connect session and is short-lived.
A 401 surfaces as an `AuthError` telling you exactly that — it is not a silent
empty result.

## Tests

```bash
node --test connectors/milwaukee/index.test.js
```

Fixtures are the real response shape captured 2026-08-25, with the prices replaced
by round stand-ins — the real figures are Industrial Supply's and this repo is public.

⚠️ Run the **file**, not the directory. `node --test connectors/milwaukee/` collapses
to a single passing case and hides every assertion in it.
