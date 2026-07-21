# Flaky Crust ◆

**One login to search every manufacturer at once.** A unified procurement console for industrial distributors — see *your* tier-specific price, live stock, lead time, and ship-from location across all your brands (3M, DeWalt, Milwaukee, Ansell, …) instead of logging into 50 portals or working the phones.

> Codename "Flaky Crust." Concept stage. See [`docs/PRD.md`](docs/PRD.md) for the full write-up and [`docs/CALL_NOTES_2026-07-20.md`](docs/CALL_NOTES_2026-07-20.md) for the origin call.

## What's here

| Path | What it is |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Product notes: problem, solution, the tiered-pricing challenge, business model, open questions for Matt |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | **Plan & phased roadmap** — Phase 0 validation → single-tenant MVP → SaaS → vertical expansion, with stack, risks, and immediate next actions |
| [`docs/BRAYDN_QA.md`](docs/BRAYDN_QA.md) | **Braydn's concerns & questions, answered** — the login/bot problem, identity-specific pricing, the EDI shortcut, business model, cultural risk |
| [`docs/CALL_NOTES_2026-07-20.md`](docs/CALL_NOTES_2026-07-20.md) | Structured notes from the two kickoff calls |
| [`prototype/index.html`](prototype/index.html) | **Clickable prototype** — single-file, no build. Unified search, tier badges, live/login/phone connection status, "Ask the desk" AI concept, and the $8,500 free-freight PO-batching bar. Sample data only. |

## Run the prototype

It's a single self-contained HTML file — just open it:

```bash
open prototype/index.html
```

Or serve it (any static server):

```bash
cd prototype && python3 -m http.server 8000
# → http://localhost:8000
```

Try searching `gloves`, `epoxy`, `3M`; toggle the filter chips; click the AI questions; add in-stock items and watch the free-freight bar fill.

## The core challenge (read before building for real)

Every distributor gets **different, tiered pricing** from every manufacturer — and the tier is **per brand** (Tier 3 with Milwaukee, Tier 1 with DeWalt…). So no public dynamic feed can show a distributor their real price. v1 plan is a **hybrid**: live API where a manufacturer exposes one, one-time per-brand login where they don't. Details in the PRD §5.

## Status / next

- [x] Concept captured + prototype (2026-07-20)
- [ ] Validate API-vs-login-vs-phone mix with Matt (the ratio decides the architecture)
- [ ] Working session with an Industrial Supply inside-sales rep — confirm the exact daily fields
- [ ] Beta scope with Industrial Supply

**Principals:** Bryce Morgan · Braydn Jones · Matt Flake (Industrial Supply, industry insider)
