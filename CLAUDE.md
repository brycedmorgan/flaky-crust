# Flaky Crust — Project Context

## About
"Flaky Crust" (codename; product name TBD) is a unified procurement console for **industrial distributors**. One login → search every manufacturer at once → see *your* tier-specific price, live stock, lead time, and ship-from location. Kills the log-into-50-portals / phone-tag workflow that runs this archaic industry.

- **Principals:** Bryce Morgan, Braydn Jones, Matt Flake (Industrial Supply — the industry insider who sourced the idea).
- **Beachhead customer:** Industrial Supply (Salt Lake City). Beta there, fine-tune, then sell to the ~15 other distribution verticals (electrical, plumbing, flooring, paint, etc.).
- **The hard problem:** tiered pricing is per-distributor-per-manufacturer → no public dynamic feed can show a distributor their real price. v1 = hybrid (live API where it exists, one-time per-brand login where it doesn't). See [docs/PRD.md](docs/PRD.md) §5.
- **Codename origin:** Matt's last name is Flake.

## Tech Stack
- Prototype: single-file static HTML/CSS/vanilla-JS ([prototype/index.html](prototype/index.html)). No build.
- Nothing else chosen yet. Stack decision deferred until the API-vs-login mix is validated with Matt.

## Repo layout
- `docs/` — PRD + call notes (source of truth for the concept)
- `prototype/` — clickable demo
- No app framework yet.

## Session Log

### 2026-07-20 (PM) — Plan, roadmap, and answers to Braydn's concerns

- **Trigger:** Bryce asked for "a plan and a roadmap and to address Braydn's concerns and questions" (+ yes to publishing the prototype as a shareable Artifact link).
- **Shipped (this repo):**
  - [docs/ROADMAP.md](docs/ROADMAP.md) — strategy + 5 phases (Phase 0 validation/no-code → Phase 1 single-tenant MVP for Industrial Supply → Phase 2 harden+AI → Phase 3 multi-tenant SaaS+billing → Phase 4 vertical expansion), guiding principles, tentative stack (Next.js/Vercel + Postgres + connector jobs + AI SDK), risk register, immediate next actions.
  - [docs/BRAYDN_QA.md](docs/BRAYDN_QA.md) — direct answers to Braydn's 7 call objections: (1) bot-login/password worry → priority ladder API→EDI→OAuth-token→headless→phone, tokens-not-passwords (Plaid precedent); (2) identity-specific pricing → always `price(distributor, mfr, sku)`, fetched behind their creds, never a public feed; (3) the **EDI 846/832 + cXML PunchOut shortcut** (industry may already receive these files → possible v1 on-ramp); (4) tier-aware manufacturer endpoints = Phase 3 partnership play; (5) one-time connect friction vs zero daily friction; (6) subscription-first (transaction-% is Phase 3, per-PO is lumpy w/ free-freight batching — Braydn's skepticism was right); (7) augment-don't-replace cultural framing.
  - **The single de-risking artifact = the "Connector Feasibility Matrix"** (top ~50 manufacturers by spend × API/EDI/login/phone). That's Matt's Phase 0 job; nearly every open question resolves from it.
- **Central technical insight to carry forward:** this industry already runs on EDI (846 inventory, 832 price catalog) + PunchOut — check whether Industrial Supply already *receives* those before building 50 API integrations.
- **Prototype published as an Artifact** (default-private to Bryce) for phone-viewing by Braydn/Matt — URL captured in chat.
- **Pick up next:** get Matt's Connector Feasibility Matrix + inside-sales field/click-path session on the calendar (after the Kinsey project, per sequencing). Then lock the stack and start Phase 1.

### 2026-07-20 — Project kickoff: notes + clickable prototype

- **Trigger:** Bryce dropped the recorded transcript of two 2026-07-20 calls (Bryce + Braydn Jones + Matt Flake) naming a new standalone venture "Project Flaky Crust." Chose (via prompt) **notes + prototype** as the first deliverable and **local dir + GitHub repo now**.
- **The idea:** a "Kayak for industrial procurement." Distributors (Industrial Supply, Grainger, …) resell thousands of manufacturers' products but have zero unified upstream visibility — they phone/portal-hop to get stock, price, and lead time. Flaky Crust aggregates it behind one login. Matt's an outside sales rep at Industrial Supply; his internal contact called the concept "a game changer." Idea is ~5 yrs old — AI now collapses the build cost.
- **Key architectural wrinkle captured:** tiered pricing is identity-specific per manufacturer (Tier 3 Milwaukee / Tier 1 DeWalt / Tier 7 plumbing). Working plan = hybrid API + per-brand login; accept login friction in v1. Precedent: they did a 5-tier pricing model on the "Olive" project.
- **What shipped (this repo, all new):**
  - [docs/PRD.md](docs/PRD.md) — full product notes (problem, solution, tiered-pricing options table, business model, guardrails, market expansion, open questions for Matt).
  - [docs/CALL_NOTES_2026-07-20.md](docs/CALL_NOTES_2026-07-20.md) — structured capture of both calls + a parking lot (Kinsey project is separate; pickleball/etc. ignored).
  - [prototype/index.html](prototype/index.html) — self-contained demo: unified search across 9 sample manufacturers × 15 SKUs, per-SKU tier-price/stock/lead-time, live/login/phone connection-status sidebar, "Ask the desk" AI concept (4 canned Q&A), $8,500 free-freight PO-batching bar. Industrial dark+amber aesthetic. Sample data only — nothing wired to real manufacturers.
  - README.md, .gitignore (excludes `.env*`), this CLAUDE.md.
- **Verification:** prototype JS `node --check` clean; all 9 referenced element IDs exist in the DOM. Could NOT render in the Browser pane — it blocks `localhost` by policy and stalls on `file://` (sandbox limitation, not a code issue). Open locally with `open prototype/index.html` to eyeball.
- **Sequencing note from the call:** Bryce said do the **Kinsey project first**, then this. Flaky Crust is captured + parked, ready to pick up.
- **Pick up next:** (1) Validate the API-vs-login-vs-phone ratio with Matt — it decides the architecture. (2) Working session with an Industrial Supply inside-sales rep to confirm the exact daily fields (call gave: part #, description, qty, price, lead time). (3) Business-model decision (SaaS per-seat vs. transaction % vs. both). (4) Add Braydn + Matt as GitHub collaborators once the repo's created.
