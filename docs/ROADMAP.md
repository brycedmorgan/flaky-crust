# Flaky Crust — Plan & Roadmap

> Companion to [PRD.md](PRD.md). This is the *how* and the *in what order*. Written 2026-07-20 for the Bryce / Braydn / Matt working session.
> Braydn's specific concerns + questions are answered in [BRAYDN_QA.md](BRAYDN_QA.md) — read that alongside this.

---

## The strategy in one paragraph

Don't try to boil the ocean (4,200 manufacturers) or solve the hardest data source first. **Beta single-tenant with Industrial Supply**, connect the ~15–20 manufacturers that carry the most spend *and* have the cleanest data path, prove we save their inside-sales team real hours, then generalize into a multi-tenant SaaS and expand manufacturer-by-manufacturer and vertical-by-vertical. The whole thing rides on one abstraction — a **manufacturer "connector"** — so the messy reality (some API, some login, some EDI, some phone-only) is hidden behind a single interface. The prototype already shows this: green = live API, amber = login-linked, red = phone-only.

---

## Guiding principles

1. **Validate before we build.** The single most important number — *what % of the top manufacturers give data by API vs. EDI vs. login vs. phone* — decides the architecture. We get that from Matt first (Phase 0). We do not write production code until we have it.
2. **One connector interface, many implementations.** Every manufacturer is a plugin implementing the same contract (`search`, `price(distributor, sku)`, `stock`, `leadTime`). Adding a manufacturer never touches the core app.
3. **Prefer the rails that already exist.** This industry already moves inventory + price data over **EDI (846 / 832)** and **cXML PunchOut**. Check those before building anything custom — Industrial Supply may already *receive* feeds we can just aggregate. (See BRAYDN_QA §3.)
4. **Credentials are sacred.** Where we must use a distributor's login, we store **tokens, not passwords**, in a real secrets vault, encrypted, with explicit consent. Same pattern Plaid used for banks pre-open-banking. Never plaintext, never committed.
5. **Augment, don't threaten.** The pitch is "make your inside-sales desk 10× faster and free your outside reps for relationships," not "cut headcount." Protects the beta relationship. (See BRAYDN_QA §7.)
6. **Land, then template.** Industrial (Matt's vertical) is the beachhead. Electrical / plumbing / paint / flooring are the same product re-skinned — but only after the first one works.

---

## Phase 0 — Validation & feasibility  ·  ~1–2 weeks  ·  no production code
**Goal: know exactly what we're building and whether the data is reachable.**

- [x] Concept captured + clickable prototype (done 2026-07-20) — the thing to react to.
- [x] **First real manufacturer access proven end to end (Milwaukee, 2026-08-25/26).** A distributor's actual tier net price is retrievable programmatically from a brand with no published API. This retired the single biggest risk in the project — see [CONNECTOR_ACCESS_LOG.md](CONNECTOR_ACCESS_LOG.md). **n=1**: it does not stand in for the matrix.
- [ ] ⚠️ **NEW — per-brand access administration.** Not in the original plan, and it turned out to be the long pole. Every brand needs an account on the distributor's own email domain, scoped to the **parent** account rather than one branch, blessed by a **named rep**. That is ~50 rep conversations and it is people-work, not code. It is also the moat. Checklist + email templates: [OUTREACH_TEMPLATES.md](OUTREACH_TEMPLATES.md).
- [ ] ⚠️ **NEW — a named internal owner at Industrial Supply.** Was a Phase 3 concern; it is now a Phase 0 blocker. Asking a manufacturer to bless third-party access to Industrial Supply's pricing is a company-level ask, and until someone internal has signed up for this, Matt personally carries it. Hold that ask until then.
- [ ] **Matt working session #1 — the connector matrix.** For the top ~50 manufacturers *by Industrial Supply's annual spend*, mark how their data is reachable: open API? EDI 846/832 today? login portal only (which ones — 3M VCOM, DeWalt, Milwaukee already have logins)? phone only? → produces the **Connector Feasibility Matrix** (a spreadsheet). This is the deliverable that de-risks everything.
- [ ] **Inside-sales rep session.** Sit a real inside-sales rep down: what exact fields do they pull every day, and what's the actual click-path today? Call gave us **part #, description, quantity, price, lead time** — confirm + rank, and catch anything missing (min order qty, pack size, substitutes, ship-from).
- [ ] **EDI check (potentially a shortcut).** Does Industrial Supply *already* receive EDI 846 (inventory) / 832 (price catalog) from its top manufacturers, and where do those files land? If yes, v1 ingestion may be "parse files they already get," not "integrate 50 APIs."
- [ ] **Business-model gut-check with Matt's internal contact.** Would they pay a monthly SaaS fee? Roughly what would replacing/augmenting the pricing-lookup labor be worth? (Anchors pricing — see BRAYDN_QA §6.)

**Exit gate:** we have the Connector Feasibility Matrix + confirmed field list. If ≥10 high-spend manufacturers are reachable by API/EDI, we proceed to Phase 1.

> **Scope correction from Milwaukee (2026-08-26).** The PRD promises four facts per part:
> price, stock, lead time, ship-from. Brand #1's *best-case* rail delivers price exactly,
> stock as a coarse flag, and **lead time and ship-from not at all**. So either v1 leads
> with price — "every brand, your real price, one search box", which is provably
> deliverable and a serious product on its own — or inventory comes from a second rail
> (EDI 846, or Industrial Supply's own system). Probably both. What we must not do is
> demo on-hand quantities we cannot source.

---

## Phase 1 — Single-tenant MVP for Industrial Supply  ·  ~6–10 weeks
**Goal: one real distributor's inside-sales team uses it daily and it saves measurable time.**

- [x] **Connector framework — built 2026-08-26.** [connectors/interface.js](../connectors/interface.js) plus connector #1 ([connectors/milwaukee/](../connectors/milwaukee/)), 10 passing tests, and a CLI ([bin/quote.js](../bin/quote.js)). Zero dependencies. Validated against a live Milwaukee response: 8/8 mapping checks. Two rules the interface *enforces*: every line carries source/scope/`asOf`, and what we do not have is `null`, never `0`.
- [ ] **Job runner** — scheduled refresh per connected manufacturer (~15 min for live sources). Not started; the connector layer runs on demand today.
- [ ] **Prove the framework generalizes** — 3M VCOM and DeWalt against the same interface. Three brands on one contract is the evidence; one brand is an anecdote.
- [ ] **Ingest + normalize** the 10–15 cleanest, highest-spend manufacturers into one unified catalog model (product, distributor-specific price, stock, lead time, ship-from).
- [ ] **The console** — the production version of the prototype: unified search, *your*-price with tier, live stock, lead time, ship-from. This is the daily driver.
- [ ] **Auth + credential vault + one-time "connect a manufacturer" wizard** — for login-only sources (BRAYDN_QA §1–2).
- [ ] **Proactive alerts v1** — back-order + price-change flags (the "find out before it doesn't ship" win).
- [ ] **Instrument it** — log every search + every lookup that *replaces* a phone call, so we can show "X hours / Y calls saved this week." That metric is the whole sales pitch for Phase 3.

**Exit gate:** Industrial Supply inside-sales runs it daily for 2–4 weeks; we can point to real time saved + stale-quote/back-order catches.

---

## Phase 2 — Harden, expand connectors, add the smart layer  ·  ongoing after MVP
- [ ] Add more manufacturers, including the login/headless-session ones and a clean **manual/phone-fallback** path (so "no feed" degrades gracefully instead of breaking).
- [ ] **Alerting engine v2** — reorder nudges ("customer X hasn't ordered in 90 days"), configurable thresholds.
- [ ] **"Ask the desk" AI assistant** — natural-language queries over the unified data (the prototype's canned Q&A, made real). This is the feature that *feels* like magic in a demo and directly replaces the "call and ask" workflow.
- [ ] **PO batching / free-freight** — hold POs until the free-freight threshold (~$8,500 / half-truck), then release. Mirror the real buying behavior.

---

## Phase 3 — Multi-tenant SaaS + monetization
- [ ] Re-architect single-tenant → multi-tenant (row-level tenant isolation; each distributor sees only their tiers/creds).
- [ ] Onboard distributor #2 and #3 (Grainger-scale or a Bonneville-scale regional).
- [ ] **Billing** — lead with SaaS: per-seat and/or per-connected-manufacturer tiering. (See BRAYDN_QA §6 for why subscription-first, transaction-% later.)
- [ ] Optional **on-platform purchasing** → take a transaction %.
- [ ] **Manufacturer-facing side** — analytics/placement as a *second* revenue side, once we have distributor demand (don't gate v1 on manufacturer buy-in — chicken-and-egg).

---

## Phase 4 — Vertical expansion
- [ ] Template the platform for the next vertical (electrical or plumbing — both "huge" per Matt; paint/epoxy has a warm intro via Alpha Paints).
- [ ] Per-vertical connector packs; same core.

---

## Recommended stack (tentative — lock after Phase 0)
Lean and AI-forward, since AI is the thing that makes this buildable now.

- **App:** Next.js on Vercel (Bryce's default; fast to ship, easy previews for Braydn/Matt to click).
- **Data:** Postgres (Supabase or Neon via Vercel Marketplace) for the normalized catalog + tenant/credential tables.
- **Connectors/pulls:** scheduled jobs (Vercel Cron) + a queue for the heavier login/headless pulls; each connector is an isolated module.
- **Secrets:** a real vault (not env-committed) for per-distributor per-manufacturer credentials/tokens.
- **AI layer:** Vercel AI SDK / AI Gateway for "Ask the desk" (natural language → structured query over the catalog).

*Don't over-commit here until the Connector Feasibility Matrix tells us whether we're mostly parsing EDI files, mostly calling APIs, or mostly running authenticated sessions — those imply different amounts of worker infrastructure.*

---

## Risk register
| Risk | Impact | Mitigation |
|---|---|---|
| Too few manufacturers expose API/EDI → heavy reliance on brittle logins | High | Phase 0 matrix quantifies it *before* we build. Prioritize API/EDI manufacturers for the MVP; treat login/scrape as fill-in. |
| Storing distributor credentials = security + liability | High | Tokens-not-passwords, vault-encrypted, explicit consent, SOC-2-minded from day one. Public repo carries **zero** secrets/sample-only data (already true). |
| Manufacturer ToS forbids automated access | Med | **Checked at Milwaukee 2026-08-26: no anti-bot, anti-scraping or automated-access clause.** They do reserve commercial use of the site to what is "expressly permitted ... in writing", so the durable move is written blessing from the rep — the same conversation as the parent-account ask. Caveat: that is the public site's legal page; a separate signed distributor agreement may exist. Confirm per brand before scaling. |
| **Access is scoped to one branch, so aggregates are wrong while looking right** | High | Measured at Milwaukee: the login covers one ship-to site, not the distributor. Ask for parent scope **at signup**, and print the scope on every quote. The connector does this — `scope` is a required field. |
| **The product promises data the best-case rail does not carry** | High | Lead with price, which is provable. Source stock/lead-time from EDI or the distributor's ERP. Never render an unknown as a number. |
| **One person's mailbox holds every manufacturer account** | Med | Correct for now (Matt's work address). At sponsor time, move to a shared distribution alias so resets and MFA do not funnel through one employee. |
| Tiered pricing wrong = distributor quotes a customer the wrong price | High | Price is always identity-scoped + timestamped + source-attributed; show "as of" + source; never blend tiers. |
| Cultural blowback (perceived headcount threat) at beta | Med | Augment-don't-replace framing; measure *reps freed for relationships*, not *reps eliminated*. |
| Building 50 connectors is a slog | Med | Connector framework + start with 10–15; EDI/PunchOut may cover many at once via one parser. |

---

## Immediate next actions

*Updated 2026-08-26. Ordered by what unblocks the most, not by chronology.*

1. **Matt — the Connector Feasibility Matrix.** Top ~50 manufacturers by spend × API / EDI today / login-only / phone-only. **Open since 21 July.** Still the only thing that sizes the build, and Milwaukee turning out easy is one data point, not a trend.
2. **Matt — the EDI answer.** Does Industrial Supply already receive 846/832, from whom, and where do the files land? Now doubly important: it is the likeliest source of the stock and lead-time data portals withhold.
3. **Matt — a named internal owner.** Who signs. Gates the programmatic-access ask at every brand.
4. **Matt → Olivia Crowley (Milwaukee).** Parent-account access via a Customer Master Buyer Contact Request, plus whether a warehouse-level or EDI feed exists. Draft sent to Matt 2026-08-26; comes from him, not us.
5. **Matt → Milwaukee CX.** Move the Connect account off the personal address it was created under and onto his work address. Draft sent.
6. **Matt — rep contacts for the top 10 brands,** and 3–5 small/old-software vendors he actually buys volume from. The scrappy vendors are the informative sample; Milwaukee is the best case.
7. **Bryce/Braydn — 3M VCOM and DeWalt** on the existing interface once those logins land.
8. **All — the business-model anchor.** We still have no number to put in front of a decision-maker.
