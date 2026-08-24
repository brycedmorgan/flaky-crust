# Connector Access Log

Live record of **what access we actually hold** to each manufacturer, brand by brand.
The [Connector Feasibility Matrix](connector-feasibility-matrix.template.csv) answers
*"what rail could exist?"* — this file answers *"what is switched on right now?"*

## Rules

- **No credentials in this repo.** No passwords, no API keys, no account numbers, no
  ship-to-site numbers. This repo is public. Account numbers and logins live in the
  shared vault ("Flaky Crust — Manufacturer Logins"), or Matt → Bryce direct.
- Every entry names **who owns the login** and **which rep can escalate**. A connector
  with no named human behind it dies the first time it breaks.
- Record the **scope** of the access, not just that access exists. One branch's data is
  not the distributor's data.

## Status key

| Status | Meaning |
|---|---|
| `none` | No access, no request in flight |
| `requested` | Application submitted, waiting on the manufacturer |
| `portal` | Human can log in and read the data by hand |
| `feed` | We receive EDI 846/832 or equivalent files |
| `api` | Authenticated programmatic access |

---

## Milwaukee Tool — "Milwaukee Connect"

| | |
|---|---|
| **Status** | `requested` (ship-to-site approval pending) |
| **As of** | 2026-08-23 |
| **Account holder** | Matt Flake, `mflake@indsupply.com` (his Industrial Supply work email — required; a personal address will not attach to the distribution account) |
| **Manufacturer reps** | Olivia M Crowley — Industrial Channel TM (UT), `OliviaM.Crowley@milwaukeetool.com`, (801) 718-1773 · Joseph Lisa — Territory Manager, Mining, (262) 606-0234 |
| **Origin** | Matt asked Joseph Lisa for a login on 2026-08-03 → routed to Olivia → she sent the Create Account link + the distribution account number (in the vault, not here). Braydn forwarded the chain to Bryce 2026-08-18. |

### Where it stands

Account created against Matt's work email. Milwaukee Connect then returned
**"Ship-To Site Number Required"** — the account exists but is not yet bound to a
site. Submitted the distribution account number Olivia supplied; the portal returned
*"Success! You can expect access within the next few days."* Its own copy says
**approval and activation take 2–3 business days**.

⚠️ **Nothing is verified until someone logs in and sees SKUs.** A success banner is a
receipt for a request, not proof of access. Re-check on/after **2026-08-26**.

### The scope problem — this is the real ask

The portal's own help text draws the distinction we care about:

> "If you need access to **all ship-to-site account numbers underneath a Parent
> Account**, reach out to your Milwaukee Rep, have them approve and issue a
> **Customer Master Buyer Contact Request** on your behalf."

What we submitted is **one** ship-to-site number. Industrial Supply is a multi-branch
distributor. A single-site login shows one branch's pricing and availability — that
demos fine and aggregates badly, because the product's promise is *the distributor's*
position, not *a counter's* position.

**Action:** ask Olivia for a **Customer Master Buyer Contact Request** at the parent
account level. Do it now, in the same thread, while the single-site request is still
processing — the two are not in conflict and the parent request is the slower one.

Also worth confirming with Olivia: Milwaukee's field email used the phrase
*"distribution account number"* while the portal form asks for a *"ship-to-site
account number."* If those are different objects in Milwaukee's system, the pending
request may bind to the wrong one and simply come back denied in a few days.

### What to look for once access lands

This is our first real portal, so it doubles as the template for every brand after it.
Log the answers in the feasibility matrix:

1. **Is our tier price visible?** Does the portal show Industrial Supply's actual
   Tier-3 net price, or list price only? (The whole product depends on the former.)
2. **Is live stock visible, and at what granularity?** Per-DC on-hand, or a
   yes/no in-stock flag?
3. **Is there an EDI/feed option in the account settings?** 846 inventory / 832 price
   catalog. Ask Olivia directly — do not conclude "no" from the UI.
4. **Is there any documented API or integration page?** Vendor portals frequently
   hide one behind a support request.
5. **What does the data actually look like on the wire?** Capture request/response
   shapes while browsing — that determines whether a connector is a day or a month.

### Escalation path

`CXhelp@milwaukeetool.com` / 1-800-729-3878 (US customer service) for ship-to-site
questions. Olivia for anything account-scope or commercial.

---

## Every other brand

`none` — nothing requested yet. 3M (VCOM) and DeWalt are the next two logins Matt has
mentioned holding; get those recorded here the same way before chasing brands 4–50.
