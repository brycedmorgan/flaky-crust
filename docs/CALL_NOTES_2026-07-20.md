# Call Notes — 2026-07-20

Two back-to-back calls that kicked off Project Flaky Crust. Participants: **Bryce Morgan**, **Braydn Jones**, and **Matt Flake** (joined mid-first-call). Captured from the recorded transcript.

---

## Call 1 — the pitch + Matt's walkthrough

**How it started:** Braydn brought the idea (originally Matt's, ~5 years old). He wanted Matt on the line because Matt has a lead at Job Nimbus and, more importantly, *is* the industry insider — an outside sales rep at Industrial Supply covering Point of the Mountain down to Cedar City, UT.

**What Matt sells:** industrial consumables + tooling as a distributor/middleman — grinding blades to coal mines, latex gloves to Tyson, tape, blades, gloves, pallets of water, CNC blades. Represents ~a thousand brands' worth of products; Industrial Supply works with ~4,200 manufacturers (~1,500 regularly).

**The pain (Matt's words):**
- Not primarily *their* inventory (they spent ~$4M on an internal system for that). It's **upstream visibility** — stock, pricing, lead time, ship-from across all the manufacturers.
- Manufacturers back-order with no heads-up; pricing changes with no notice → stale quotes, missed deliveries.
- Getting better *slightly*: 3M has "VCOM" login, DeWalt + Milwaukee now have logins. But most of the 1,500 don't → still phone-call-after-phone-call; they've had to hire people just to call for pricing/ETAs.

**Matt's vision (verbatim gist):** "Why don't we have a website you log into one time, that has all the manufacturers, you click on them, it's pulling info all day — updated pricing, back-order status, in-stock qty — for all the little manufacturers too."

**Key expansion point:** it's the same for ~15 other distribution industries — electrical, plumbing, glass, sprinklers, stone, siding, flooring, roofing, paint/epoxy.

**Bryce's instincts on the call:**
- Add a **payment layer** → take a % of transactions.
- Two revenue shapes: recurring monthly fee (forever) **or** build-cost + transaction %.
- Add an **AI assistant** (Claude/Grok-backed) so reps ask it the questions they currently ask inside-sales.
- "People would pay $10k/month for this."

**Agreed next step:** Bryce to write up notes + get everyone in one GitHub repo; build something to look at tonight; Matt to pick it apart with real use cases. Lunch (Matt + Braydn) targeted for Thursday.

---

## Call 2 — the tiered-pricing wrinkle (the important one)

Braydn re-raised the hard question: **how do you show the right price if pricing is identity-specific?**

- Pull via **open API** → clean, dynamic, no login. Ideal where it exists.
- No API → must **log in** to pull it. But bots don't reliably log in / store passwords — friction.
- **Tiered pricing is per-manufacturer-per-distributor.** Industrial Supply might be Tier 3 (best) with Milwaukee, Tier 1 with DeWalt, Tier 7 with a plumbing brand. A public dynamic feed can't know your price.

**Working conclusion:** hybrid — API where available, one-time per-brand login where not; accept some login friction in v1. Long-term dream = manufacturers expose tier-specific endpoints ("Braydn = Tier 3"). Precedent: they built a 5-tier user-level pricing model on the **"Olive"** project, so the pattern isn't new to them.

**Go-to-market:** beta with Industrial Supply, fine-tune to their needs, *then* sell to the masses. Matt already floated it internally — the contact said it'd be "a game changer." Cultural guardrail: don't threaten the handshake/relationship layer; make the back office efficient. Bryce framed himself as able to "be a hero and save them half a million in employee costs."

**Deal/vibe notes:**
- Matt is hungry, a connector/closer, "no shame, will get after it" — but hates quotas/being managed. Likely finder/percentage/equity, not a rep seat. Braydn floated letting Matt cold-call/sell it.
- Braydn is willing to fund prototypes and wants "skin in the game" so he can help close.
- Sequencing agreed at the very end: **start with the Kinsey project first**, then this. Bryce to review Kinsey's notes and put Flaky Crust into a repo with notes.

---

## Parking lot (non-project asides from the transcript)
- **Kinsey project** — separate venture; Bryce reviewing her notes. Lead-gen model debate: sell per-lead (easier to track/scale, take money up front) vs. per-close (more $ long-term but out of our control / hard to track). Leaning per-lead up front, revisit per-close if close rates run high. *Not part of Flaky Crust — tracked elsewhere.*
- Misc: pickleball roster chatter (Black Diamonds / MLP), St. George trip, mahjong. Ignore.
