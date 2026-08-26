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
| **Status** | `portal` + **undocumented JSON API** (see below) |
| **As of** | 2026-08-25 — verified by logging in and pulling live prices |
| **Scope** | **ONE ship-to site: Spanish Fork, UT.** Not the Salt Lake City HQ. Bill-to is INDUSTRIAL SUPPLY CO INC (SLC). |
| **Account holder** | ⚠️ **Bryce, not Matt.** The signup was run on Bryce's address by mistake (confirmed in the group thread 2026-08-25). It attached to Industrial Supply's site anyway and returns their live net pricing. **Migrate to Matt's work address `mflake@indsupply.com`.** |
| **Manufacturer reps** | Olivia M Crowley — Industrial Channel TM (UT), `OliviaM.Crowley@milwaukeetool.com`, (801) 718-1773 · Joseph Lisa — Territory Manager, Mining, (262) 606-0234 |
| **Portal** | `https://connect.milwaukeetool.com` · auth is **Auth0**, role `Connect_USCAN_Distributor` |
| **Origin** | Matt asked Joseph Lisa for a login 2026-08-03 → routed to Olivia → Create Account link + distribution account number. Bryce ran the signup 2026-08-23. Milwaukee confirmed setup complete 2026-08-25. |

### Verified 2026-08-25 — the five questions, answered

**1. Is our tier net price visible? — YES, and it is unambiguous.**
The pricing response returns **both** `unitPrice` (list) and `netPrice` (Industrial
Supply's actual net) on the same line. This is the single fact the whole product
depends on, and Milwaukee hands it over in one call. *Figures stay in the vault —
this repo is public.*

**2. Is live stock visible, and at what granularity? — PARTIALLY. This is the gap.**
Availability is a **coarse status enum on one line item**, not inventory. Observed
values: `backorder`, `discontinuedoutofstock`. There is a `recoveryDate` /
`recoveryDateMessage` pair for ETA (null on everything tested). There is **no
quantity on hand, no per-DC breakdown, and no ship-from location.** So Milwaukee
answers *"can I get it?"* but not *"how many, from where, by when."* Ask Olivia
whether a DC-level availability feed exists — do not conclude "no" from this UI.

**3. Is there an EDI/feed option? — NOT YET ANSWERED. Still an Olivia question.**
Nothing in the portal UI offers 846/832 self-service. "Pricing & Publications" in the
footer is a JS-driven link worth opening next session. Bulk intake clearly exists in
some form — "Create a New Order" advertises **Excel order import**.

**4. Is there a documented API? — No documented one. There is an undocumented one, and it is good.**
The portal is a thin SPA over a clean JSON service at **`/capi/v1/`**. Endpoints seen:

| Endpoint | Method | Purpose |
|---|---|---|
| `/capi/v1/sites/{siteNumber}/billToSite` | GET | resolve ship-to → bill-to |
| `/capi/v1/products/search/suggest` | POST | SKU / product-name typeahead against the live catalog |
| `/capi/v1/quick-quote/{siteNumber}` | POST | **price + availability, batched, many SKUs per call** |

**5. What does the data look like on the wire?**

Request to `quick-quote` — batched, trivially generated:

```json
{ "organizationCode": "MT",
  "items": [ { "lineNumber": 0, "sku": "276720", "quantity": 1 },
             { "lineNumber": 1, "sku": "285320", "quantity": 1 } ] }
```

Response — one object per line, 25 fields, no HTML to scrape:

```
lineNumber · sku · description · quantity
expectedSku · actualSku · isTransition · isReplacement · replacementSku
stockStatus · unitPrice · netPrice · totalPrice
pricingErrorCode · pricingErrorMessage
itemAvailabilityErrorCode · itemAvailabilityErrorMessage
restrictedDescription · isValid · errorFlags
minimumQuantityAllowed · maximumQuantityAllowed · quantityMultipleAllowed
recoveryDate · recoveryDateMessage
```

Auth is a `Bearer` JWT from Auth0 in the `authorization` header. `Content-Type:
application/json`. Nothing exotic.

### What this actually means for the build

- **Milwaukee is a one-day connector, not a one-month one.** No scraping, no headless
  browser. Authenticate, POST a SKU list, read `netPrice` + `stockStatus`.
- **The API returns more than the screen shows.** The UI leaves the price column blank
  on discontinued lines; the JSON carries `netPrice` for them anyway. Build against the
  service, never against the rendered page.
- **SKUs normalize by stripping dashes** — `2767-20` → `276720`, `48-11-1862` →
  `48111862`. Also note `expectedSku` can differ from `actualSku` with `isTransition:
  true` (superseded part). A connector must carry the transition/replacement fields or
  it will silently quote the wrong generation of a tool.
- **Availability is the weak half.** Price is exact; stock is a flag. If the demo
  promises "live stock," this brand cannot back that word yet.

### ⚠️ The account is on the wrong email, and it worked anyway

Earlier notes recorded this account as sitting on Matt's work address. It does not — the
signup used Bryce's address. **The correction matters in both directions:**

- Our stated rule was "a non-distributor address will not attach to the distribution
  account." **Observed reality contradicts that**, at least at Milwaukee: an outside
  address bound cleanly to Industrial Supply's ship-to site and returns their
  confidential net pricing. Treat the rule as a strong preference, not a mechanism.
- That is the *worse* outcome, not the better one. An outside email holding a
  distributor's tier pricing is exactly what gets an account revoked and makes the rep
  conversation awkward. Matt flagged the risk himself before we did.

**Action (in flight, 2026-08-26):** Matt requests the move to `mflake@indsupply.com` from
Milwaukee customer service (`CXhelp@milwaukeetool.com` / 1-800-729-3878). The request comes
from **Matt, not Bryce** — a distributor asking their vendor to move an account to the right
internal address is routine; an outside party disclosing they created an account on a
distributor's portal routes to the rep and the channel team. The address currently on the
account is Bryce's personal Gmail; it is in the vault notes, not here, because this repo is
public. Every new brand goes on Matt's work address from the start.

### ⚠️ The scope problem is now confirmed, not predicted

Searching the ship-to picker for both `industrial` and `2000` returns **exactly one
account: Spanish Fork, UT**. Everything above is one branch's position.

**Action, unchanged and now urgent:** ask Olivia for a **Customer Master Buyer Contact
Request** at the **parent** account level. Also confirm whether Milwaukee's
"distribution account number" and the portal's "ship-to-site account number" are the
same object — the site we got bound to is Spanish Fork, not the SLC head office, which
suggests they are not.

### Escalation path

`CXhelp@milwaukeetool.com` / 1-800-729-3878 (US customer service) for ship-to-site
questions. Olivia for anything account-scope or commercial.

---

## Every other brand

`none` — nothing requested yet. 3M (VCOM) and DeWalt are the next two logins Matt has
mentioned holding; get those recorded here the same way before chasing brands 4–50.
