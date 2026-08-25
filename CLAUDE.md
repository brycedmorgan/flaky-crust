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

### 2026-08-25 — Milwaukee access is LIVE, and it has a JSON API

- **Trigger:** Milwaukee emailed "account setup complete" for the ship-to site. Bryce logged in and asked whether it helps. It helps a lot.
- **Verified by logging in** (not by reading a banner): dashboard shows real Industrial Supply order history back to 2023, and Check Price returns live numbers.
- **Answer to question #1 — our tier net price IS visible.** The pricing response carries `unitPrice` (list) and `netPrice` (Industrial Supply's net) side by side on every line. That is the fact the entire product rests on, and Milwaukee just hands it over. Figures stay in the vault; this repo is public.
- **The big finding — Milwaukee is not a scrape.** The portal is a thin SPA over a clean JSON service at `/capi/v1/`, Auth0 bearer token, role `Connect_USCAN_Distributor`. `POST /capi/v1/quick-quote/{siteNumber}` takes a **batched SKU list** and returns 25 fields per line — price, net price, stock status, supersession. Connector #1 is days of work, not weeks. Full endpoint + payload shapes in [docs/CONNECTOR_ACCESS_LOG.md](docs/CONNECTOR_ACCESS_LOG.md).
- **The gap — availability is a flag, not inventory.** `stockStatus` is a coarse enum (`backorder`, `discontinuedoutofstock`) plus a mostly-null `recoveryDate`. **No on-hand quantity, no per-DC breakdown, no ship-from.** Milwaukee answers "can I get it," not "how many, from where, by when." Do not promise "live stock" in a demo on this brand's data.
- **Build against the API, never the page:** the UI leaves the price column blank on discontinued lines while the JSON returns `netPrice` for them anyway.
- **⚠️ Scope confirmed, and it is worse than assumed.** The ship-to picker returns **exactly one** account — **Spanish Fork, UT**, not the Salt Lake City head office (SLC is only the bill-to). Two searches (`industrial`, `2000`) both return that single site. The 8/23 warning was right and is now measured.
- **Pick up next:** (1) **Olivia — Customer Master Buyer Contact Request at parent level**, and ask in the same message whether a DC-level availability feed or EDI 846/832 exists; (2) write the Milwaukee connector as a thin client over `/capi/v1/quick-quote` and prove a 50-SKU batch; (3) 3M VCOM + DeWalt logins, same treatment; (4) still open since 7/21 — Matt's Connector Feasibility Matrix.

### 2026-08-23 — First real manufacturer access: Milwaukee Connect requested

- **Trigger:** Braydn forwarded (8/18) the Milwaukee chain — Matt asked his Milwaukee TM Joseph Lisa for a login 8/3, routed to Olivia Crowley (Industrial Channel TM, UT), who sent a Create Account link + a distribution account number. Bryce ran the signup today.
- **State:** account created on Matt's *work* email (`mflake@indsupply.com`). Milwaukee Connect returned **"Ship-To Site Number Required"**; submitted the account number → *"Success! You can expect access within the next few days."* Portal says approval/activation is **2–3 business days**. **Re-check on/after 2026-08-26** — a success banner is a receipt, not access.
- **Shipped:** [docs/CONNECTOR_ACCESS_LOG.md](docs/CONNECTOR_ACCESS_LOG.md) — per-brand record of access we actually hold (vs. the feasibility matrix, which records what rail *could* exist). Status key: none / requested / portal / feed / api. **No account numbers or credentials in this repo** — it's public; those stay in the vault.
- **⚠️ Scope finding (the thing to act on):** we requested **one** ship-to-site number. Milwaukee's own help text says access to **all** ship-to-sites under a **Parent Account** requires the rep to issue a **Customer Master Buyer Contact Request**. Industrial Supply is multi-branch — a single-site login shows one counter's price/stock, which demos fine and aggregates wrong. **Ask Olivia for the parent-level Customer Master Buyer Contact Request now**, in the same thread; it's the slower request and doesn't conflict with the pending one.
- **Also flag to Olivia:** her email said *"distribution account number"*; the portal form asks for a *"ship-to-site account number."* If those are different objects in Milwaukee's system, the pending request quietly comes back denied in a few days.
- **Why this brand matters beyond Milwaukee:** it's connector #1, so it's the template. When access lands, answer five questions in the feasibility matrix — is our **tier net price** visible (not list)? is **live stock** visible and at what granularity? is there an **EDI 846/832 option** (ask Olivia; don't infer "no" from the UI)? is there a **documented API**? what do the **request/response shapes** look like on the wire?
- **Pick up next:** (1) send the Olivia parent-account ask; (2) verify Milwaukee access 8/26; (3) same treatment for 3M VCOM + DeWalt, the other two logins Matt has; (4) still open since 7/21 — Matt's Connector Feasibility Matrix (top ~50 by spend) and the inside-sales click-path session.

### 2026-07-21 — AI outreach agent idea + Braydn/Matt update

- **Bryce's idea:** a dedicated AI-operated email + phone number that auto-calls/emails **phone-only manufacturers** for SKUs/stock/price/lead-time, plus a **services arm** to help distributors on bad/no systems upgrade *onto our platform.*
- **Assessment:** strong — it closes the last rung of the connector ladder (phone-only dead-end → real connector) and automates a job Industrial Supply already pays humans to do. Refinement: **email/text-first, voice as fallback** (cheaper, auditable, no IVR/hold). Hard guardrail: **verbatim capture + source/as-of/confidence**, never model-paraphrased numbers. Compliance: per-state AI-call disclosure + recording consent (Utah one-party, but callee may be two-party).
- **Cost (rough):** voice ~$0.05–0.15/min → ~$0.20–0.75/completed call; numbers ~$1–2/mo; email agent ~fractions of a cent/msg; build = weeks on Vapi/Bland/Retell + Twilio. Few-hundred lookups/day ≈ $50–200/day agent cost vs. a salaried caller.
- **Monetization:** raises base SaaS value; metered call/email add-on (where usage-pricing finally fits); "get you off the phones" managed tier; upgrade/migration services (highest margin + moat = become their system of record); build-once-monetize-across-tenants.
- **Shipped:** [docs/AI_OUTREACH_AGENT.md](docs/AI_OUTREACH_AGENT.md) + README link. Slots into Phase 2 (build after the clean-data core is proven), tagged in the Phase 0 matrix as "AI-agent candidates."
- **Also:** drafted the Braydn + Matt update message (in chat) covering the plan/roadmap/Q&A + this idea + the prototype link. Prototype Artifact URL: https://claude.ai/code/artifact/61a1e1fe-db7c-40fd-84ef-5b7815066413
- **Open:** confirm what "quo.com" refers to (specific tool?) to price against. Whether to send the update via iMessage/email (held — needs Bryce's go + their contacts).
- **Matt's reaction (positive):** "I like it! Let me see if I can get some numbers today and some logins as well." → he's pulling the feasibility data + real manufacturer portal logins. Curious about the "no system in place" services arm — **parked, talk later** (do NOT push it yet).
- **Shipped in response:** [docs/connector-feasibility-matrix.template.csv](docs/connector-feasibility-matrix.template.csv) (blank template, seeded w/ known manufacturers; **real spend stays in a PRIVATE copy, never in this public repo**) — also sent to Bryce as a file to drop into Google Sheets + share with Matt.
- **⚠️ Credential-handling guidance given:** Matt's logins must NOT go in group text / email / the public repo. Recommend a shared 1Password vault ("Flaky Crust — Manufacturer Logins") or Matt → Bryce direct → vault. At build time, secrets in a runtime secrets manager, never committed. (Echoes the CW public-repo token-leak lesson.)

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
