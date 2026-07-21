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
- [ ] **Matt working session #1 — the connector matrix.** For the top ~50 manufacturers *by Industrial Supply's annual spend*, mark how their data is reachable: open API? EDI 846/832 today? login portal only (which ones — 3M VCOM, DeWalt, Milwaukee already have logins)? phone only? → produces the **Connector Feasibility Matrix** (a spreadsheet). This is the deliverable that de-risks everything.
- [ ] **Inside-sales rep session.** Sit a real inside-sales rep down: what exact fields do they pull every day, and what's the actual click-path today? Call gave us **part #, description, quantity, price, lead time** — confirm + rank, and catch anything missing (min order qty, pack size, substitutes, ship-from).
- [ ] **EDI check (potentially a shortcut).** Does Industrial Supply *already* receive EDI 846 (inventory) / 832 (price catalog) from its top manufacturers, and where do those files land? If yes, v1 ingestion may be "parse files they already get," not "integrate 50 APIs."
- [ ] **Business-model gut-check with Matt's internal contact.** Would they pay a monthly SaaS fee? Roughly what would replacing/augmenting the pricing-lookup labor be worth? (Anchors pricing — see BRAYDN_QA §6.)

**Exit gate:** we have the Connector Feasibility Matrix + confirmed field list. If ≥10 high-spend manufacturers are reachable by API/EDI, we proceed to Phase 1.

---

## Phase 1 — Single-tenant MVP for Industrial Supply  ·  ~6–10 weeks
**Goal: one real distributor's inside-sales team uses it daily and it saves measurable time.**

- [ ] **Connector framework** — the pluggable interface + a job runner that refreshes each connected manufacturer on a schedule (~15 min for live sources).
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
| Manufacturer ToS forbids automated access | Med | Prefer official API/EDI/OAuth. For login-only, it's the distributor's *own* credentials + consent (Plaid precedent), but confirm per-brand ToS before scaling. |
| Tiered pricing wrong = distributor quotes a customer the wrong price | High | Price is always identity-scoped + timestamped + source-attributed; show "as of" + source; never blend tiers. |
| Cultural blowback (perceived headcount threat) at beta | Med | Augment-don't-replace framing; measure *reps freed for relationships*, not *reps eliminated*. |
| Building 50 connectors is a slog | Med | Connector framework + start with 10–15; EDI/PunchOut may cover many at once via one parser. |

---

## Immediate next actions (this week)
1. **Bryce:** share the prototype link + this plan with Braydn & Matt; keep the Kinsey project first per the call, but get Matt's working session on the calendar.
2. **Matt:** start the **Connector Feasibility Matrix** (top ~50 manufacturers by spend × data-reachability) and confirm whether Industrial Supply already receives EDI 846/832.
3. **Matt:** line up 30–60 min with an inside-sales rep to confirm the daily field list + click-path.
4. **All:** decide the business-model anchor (subscription-first — see BRAYDN_QA §6) so we can put a number in front of the internal contact.
