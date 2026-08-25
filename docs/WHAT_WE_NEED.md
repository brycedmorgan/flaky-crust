# What we need to build this — and where viability stands

**As of 2026-08-25**, written after the first real manufacturer connection (Milwaukee)
was opened and tested against live Industrial Supply data. Pairs with
[CONNECTOR_ACCESS_LOG.md](CONNECTOR_ACCESS_LOG.md) (what access we hold),
[ROADMAP.md](ROADMAP.md) (the phases) and [PRD.md](PRD.md) (the product).

---

## 1. Viability — where this actually stands

### What Milwaukee proved

The biggest risk in this project was never the app. It was one question:
**can a distributor's real, negotiated, tier-specific price be pulled out of a
manufacturer, programmatically, without a human on the phone?** PRD §5 called it "the
hard part and the thing to design around first."

At brand #1 the answer is **yes, cleanly.** Milwaukee returns list price and Industrial
Supply's net price side by side, in JSON, for a batch of SKUs in a single call — from a
portal with no published API. That risk is retired for this brand.

Second thing it proved, which matters almost as much: **the connector is small.**
Milwaukee is days of work, not weeks. No scraping, no headless browser, no stored
password. If even a third of the top brands look like this, Phase 1 is much cheaper
than the roadmap assumes.

### What it did not prove

**n = 1.** Milwaukee is one of ~1,500 regularly-used manufacturers, and it is one of the
most modern — they built Connect in the last two or three years. It is a best case, not
a representative sample. The Connector Feasibility Matrix is still the gate, and nothing
about today changes that.

### The bottleneck moved, and this is the real finding

We assumed the hard part was engineering. It is not. **The hard part is access
administration.** Every brand needs the same three things, and none of them are code:

1. an account on the **distributor's own email domain**,
2. scoped to the **parent account**, not one ship-to site,
3. blessed by a **named rep** who can escalate when it breaks.

Milwaukee gave us a login bound to a single branch — Spanish Fork, UT — not the Salt
Lake head office. Getting the whole company's position requires a rep to file a
"Customer Master Buyer Contact Request." That is one conversation with one rep, times
fifty brands.

That is slow, and it is unglamorous, and **it is also the moat.** Any competent team can
write the connector once they can see the payload. Almost nobody can get fifty
manufacturers to scope-up a distributor account — that takes a distributor who wants it
and an insider the reps already know. That is precisely the asset this team has.

### The new risk today surfaced

The PRD promises four fields per SKU: **price, live stock, lead time, ship-from.**

Brand #1's best-case rail delivers **price exactly**, **stock coarsely** (a status flag —
"backorder", "discontinued" — with no quantity, no warehouse, no ship-from), and
**lead time and ship-from not at all.**

So the promise is currently ahead of the data. Two honest ways forward, and they are not
exclusive:

- **Lead with price.** "Every brand, your real price, one search box, no phone call" is
  provably deliverable today and is on its own a serious product.
- **Get inventory from a second rail.** Warehouse-level stock and lead time most likely
  come from **EDI 846** or from Industrial Supply's own ERP — not from portal APIs. That
  makes the EDI question (open since July) more important, not less.

What we must not do is demo on-hand quantities we cannot source. A wrong number in front
of a buyer costs more than a missing one.

### The call

**Viability is up on Friday, and the risk profile is better.** We moved from *"can this
be built at all?"* to *"can we get access at scale, and will Industrial Supply commit?"*
Those are commercial and relationship questions, and this team is built for those.

The three things that could still kill it, in order:

| # | Risk | How we retire it |
|---|---|---|
| 1 | The top 50 look nothing like Milwaukee — mostly phone-only, no rail | **The matrix.** Open since 21 July. Nothing replaces it. |
| 2 | Industrial Supply likes it but never commits budget or a sponsor | Get a named internal owner and a paid-beta decision, not enthusiasm |
| 3 | Manufacturers object to programmatic access at scale | Get written permission per brand through the rep — the same conversation as the parent-account ask |

---

## 2. What we need — the full list

Grouped by who has to produce it. Nothing here is optional for a real v1.

### A. From Matt (Industrial Supply insider)

| # | What | Why it blocks us | Status |
|---|---|---|---|
| A1 | **Connector Feasibility Matrix** — top ~50 manufacturers by spend × API / EDI today / login-only / phone-only | Decides the architecture, the timeline and the cost. Every other estimate is a guess without it. | **Open since 21 Jul** |
| A2 | **The EDI answer** — does Industrial Supply already receive 846 (inventory) / 832 (price catalog) today, from whom, and where do the files land? | If yes, v1 may be "aggregate files you already get" instead of "integrate 50 APIs." Also the likeliest source of the stock/lead-time data portals don't give. | Open |
| A3 | **Named rep contacts for the top 10 brands** — the Olivia Crowley equivalent at each | New ask, straight out of today. Every connector needs a human who can scope up the account. This is the long pole. | New |
| A4 | **Inside-sales working session, 30–60 min** — exact fields pulled daily and the real click-path | Confirms what we build. Call gave part #, description, qty, price, lead time — needs confirming and ranking. | Open |
| A5 | **Their ERP** — which system, does it expose an API, who administers it | It's the ~$4M system. It's also where write-back and true lead-time data would live. | Open |
| A6 | **Who owns the "yes"** — is there authority and appetite for a paid beta, and whose signature is it | We are building for a customer that has not been asked to buy anything. | Open |
| A7 | Free-freight thresholds, per manufacturer | Drives PO batching (Phase 2). Low urgency. | Open |

### B. From each manufacturer — the access checklist

This is now a repeatable, five-line checklist. Run it per brand, record it in the access
log:

1. A distributor account **on the distributor's work-email domain** — a personal address
   will not attach to the distribution account.
2. **Parent-account scope**, asked for *at signup*, not after. (Milwaukee's term:
   "Customer Master Buyer Contact Request." Every manufacturer will call it something
   different; the distinction is universal.)
3. A **named rep** and their direct contact, recorded.
4. **Written permission for programmatic access** — or better, a pointer to an official
   API/EDI rail. Ask the rep; do not infer it from the UI.
5. Answers to: documented API? EDI 846/832? warehouse-level availability? lead time?

### C. From Industrial Supply as a company (not from Matt personally)

- **Written consent** to use their credentials and pull their pricing. This protects
  Matt, protects us, and is the first thing any manufacturer's legal team will ask about.
- **A security contact.** They will want to know where credentials live before they hand
  over fifty of them. Having a straight answer (vault, encrypted, tokens not passwords,
  revocable per brand) turns a blocker into a checkbox.
- **A sponsor and a budget line.** See A6.

### D. On our side — the build

- **Credential vault** — the shared "Flaky Crust — Manufacturer Logins" vault now, a
  real secrets manager at build time. Never the repo, never group text, never email.
- **Connector framework** — one interface (`search`, `price`, `stock`, `leadTime`), many
  implementations. **Milwaukee is now the reference implementation**, so this stops being
  theoretical.
- **A normalization layer, and today showed why it is not trivial.** Per-brand quirks are
  real: SKUs normalize by stripping dashes; superseded parts come back with a different
  "actual" SKU and a transition flag. Miss that and the console quietly quotes the wrong
  generation of a tool.
- **A truthfulness layer.** Every number carries source and "as of." Availability we
  don't have renders as *unknown*, never as zero and never as a guess. Never blend tiers.
- **Auth handling** — bearer tokens, refresh, per-tenant isolation, per-brand revocation.
- **Stack decision** — still deferred until the matrix lands, but the shape is now
  clear: scheduled jobs + Postgres + a thin web console.

### E. Commercial and legal

- **Per-brand terms check.** Milwaukee's public terms carry **no** anti-bot, anti-scraping
  or automated-access clause — checked today. They *do* reserve commercial exploitation
  of the site to what is "expressly permitted by Milwaukee Tool in writing." So the
  durable move is written permission through the rep, which is the same email as the
  parent-account ask. Caveat: that is the public site's legal page; a separate
  distributor agreement may exist that Industrial Supply signed, and Matt's purchasing
  lead would know.
- **Business-model anchor.** Subscription-first (BRAYDN_QA §6). We need a number to put
  in front of Industrial Supply's decision-maker before we ask them to commit.
- **The three of us.** Three principals, one venture, no stated structure. Worth settling
  before there is anything to argue about.

---

## 3. Next steps, in order

**This week**

1. **Bryce → Olivia Crowley (Milwaukee).** One email, three asks: parent-account access
   (Customer Master Buyer Contact Request), whether a warehouse-level availability or EDI
   846/832 feed exists, and written blessing for programmatic access. *Slowest item;
   start it first.*
2. **Matt → the matrix (A1) and the EDI answer (A2).** Still the gate. Six weeks open.
3. **Matt → rep contacts for the top 10 brands (A3).** New, and it parallelizes
   everything downstream.

**Next**

4. **Bryce/Braydn → build the Milwaukee connector** against the documented endpoint and
   prove a 50-SKU batch end to end. Turns the finding into a running thing and makes the
   next brand faster.
5. **3M VCOM and DeWalt** — the other two logins Matt holds. Same five-line checklist,
   parent scope asked for up front this time. Three brands on the same interface is the
   proof that the framework generalizes.
6. **Inside-sales session (A4)** — the field list we build the console against.

**Then**

7. Lock the stack, size Phase 1 honestly against the matrix, and take a number to
   Industrial Supply's decision-maker.
