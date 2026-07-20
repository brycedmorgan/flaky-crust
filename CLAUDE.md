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
