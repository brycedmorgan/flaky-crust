# Project Flaky Crust — Product Notes / PRD

> **Codename:** "Flaky Crust" (a play on Matt **Flake**'s name — the industry insider who brought the idea). Public product name TBD.
> **Status:** Concept / validation. First prototype built 2026-07-20.
> **Principals:** Bryce Morgan, Braydn Jones, Matt Flake (industry insider @ Industrial Supply).

---

## 1. The one-liner

A single sign-on dashboard where an industrial **distributor** can search every product they resell across **all** their manufacturers at once — and instantly see *their* negotiated price, live stock, lead time, and ship-from location — instead of logging into 50 different manufacturer portals or picking up the phone.

Think **"Kayak / Google Flights for industrial distribution procurement."**

---

## 2. Who this is for

Distributors are middlemen. They represent hundreds–thousands of brands (3M, DeWalt, Milwaukee, Ansell, etc.) and sell to end customers (coal mines, Tyson Foods, BYU culinary, CNC shops, turkey farms). Examples named on the call:

- **Industrial Supply** (Matt's employer, the beachhead / beta customer)
- Grainger
- Bonneville Industrial (Orem)
- Red Rhino
- Alpha Paints (an example in the paint vertical)

**Matt's role** = *outside sales rep.* His job is relationships — takes the customer's buyer to lunch, checks in, finds new projects. He is NOT operations. The tool has to make his **inside sales** team dramatically more efficient **without** killing the "good old boys / handshake" culture that makes the business run. That cultural point matters — see §7.

**Scale of the pain:** Industrial Supply works with ~**4,200 manufacturers**, ~**1,500 on a regular basis**. They cut ~**500–600 POs/day**. Companies like this do hundreds of millions/yr in these products. The industry is described repeatedly as **archaic**.

---

## 3. The problem (today's workflow)

1. Customer asks a sales rep for a product ("I need 10 gallons of X").
2. Rep has no live visibility into manufacturer stock/pricing.
3. Rep either:
   - logs into a manufacturer portal (3M "VCOM", DeWalt, Milwaukee now have logins — but most of the 1,500 do **not**), **or**
   - **physically calls the manufacturer, waits on hold**, asks "do you have it, what's my cost, what's the lead time, where does it ship from?"
4. Rep relays that to the inside sales team, who key it into their order system.
5. Pricing changes and back-orders happen **with no heads-up** — they find out when product doesn't show up or a quote is suddenly stale.

Industrial Supply spent ~**$4M** several years ago on an order/inventory system — it manages *their* internal inventory, but does **nothing** to unify the upstream manufacturer data. Some manufacturers have added logins over the last 2–3 years (better than pure phone tag), but there's still **no one-stop platform** that aggregates across all of them.

## 4. The solution (target state)

One login. A distributor logs into Flaky Crust once. They see a searchable catalog spanning all their manufacturers. For any SKU:

- **Their** price (tier-specific — see §5)
- Live stock / on-hand qty
- Lead time / ETA
- Ship-from location
- Back-order + price-change alerts (proactive, not "find out when it doesn't ship")

Data refreshes automatically (target: every ~15 min for API-connected sources).

### Layered capabilities (roadmap, not v1)
- **AI assistant** ("do we have 10 gallons of X?") backed by Claude/Grok — answers the questions inside-sales reps ask all day, automatically.
- **PO batching** — mirror the real workflow: hold POs until they hit the free-freight threshold (e.g. ~$8,500 / half-truckload), then release. Build this logic in.
- **Re-order nudges** — if a customer hasn't ordered in N months, ping the rep / auto-email.
- **Purchasing on-platform** → take a transaction %.

## 5. ⚠️ The core architectural challenge — tiered pricing

**This is the hard part and the thing to design around first.**

Every distributor gets **different pricing** from every manufacturer, based on annual volume + relationship. Pricing is **tiered** (Industrial Supply = "Tier 3" = best pricing on most items; the shop next door might be Tier 1 or 2). And the tier is **per manufacturer** — a distributor could be Tier 3 with Milwaukee, Tier 1 with DeWalt, Tier 7 with a plumbing-supply brand.

So a fully-dynamic, no-login public feed **cannot** show a distributor their real price. The price is identity-specific.

### Options considered on the call
| Approach | How it works | Reality |
|---|---|---|
| **A. Open manufacturer API** | Manufacturer exposes an endpoint; we fetch price/stock/lead-time on a schedule. No login needed. | **Ideal.** "Pretty common that most of them do" (Braydn's read) — needs verification. When available, this is the clean path. |
| **B. Per-manufacturer login (distributor's own creds)** | Distributor logs into each manufacturer once through us; we pull *their* tier-specific data behind the login. | Works, but **bots don't like logging in / storing passwords**, and the distributor may have to log in to ~50 brands once (and periodically refresh). Friction, but acceptable for v1. |
| **C. Manufacturer-side tiered endpoints (dream state)** | Manufacturer marks "Braydn = Tier 3" on their end; we hit tier-specific endpoints. | Most complex; long-term partnership play. Not v1. |

**Working conclusion from the call:** Start with a hybrid. Use **A (API)** where it exists; fall back to **B (one-time login per brand)** where it doesn't. Accept that v1 requires some login friction. Long-term, court manufacturers for A/C.

> Precedent: Braydn notes they did a similar 5-tier user-level pricing model on the "Olive" project — so tiered price points per user level is a solved pattern for them.

## 6. Business model

Not decided — options on the table:

- **Charge both sides.** Manufacturers *and* distributors, flat fee or per-seat/per-user.
- **SaaS subscription.** "People would pay $10k/month for this" (Bryce) — replaces salaried inside-sales headcount, so the ROI story writes itself.
- **Per-transaction %.** If purchasing happens on-platform, take a cut. Note: POs are large + bundled to free-freight thresholds, so per-PO economics are chunky.
- **New-business wedge:** distributors whose *own* inventory system has no API become a services opportunity — "we'll build/migrate you off Fishbowl et al." (opens a bigger can of worms; flagged, not v1).

## 7. Guardrails / cultural constraints

- **Don't disrupt the handshake culture.** The buyers (Matt-type outside reps) keep taking customers to lunch. The tool makes the *back office* efficient — it is not a replacement for the relationship layer, and shouldn't be pitched as headcount elimination to the customer's face.
- **Beta with Industrial Supply first.** Matt already floated it internally; the internal contact called it "a game changer." Fine-tune with them, *then* sell to the masses.
- Matt is a connector/closer, not a quota-carrying salesperson — likely deal structure is finder/equity/percentage, not a rep role.

## 8. Why now

The idea is ~5 years old (Matt pitched Braydn years ago; also floated to an Adobe contact). It was "too beefy / too expensive" pre-AI. **AI collapses the cost** of building the aggregation + the natural-language query layer. An old Adobe neighbor unprompted texted Matt two weeks ago: "remember that idea? we can do that with AI now."

## 9. Market expansion (after the beachhead)

The same archaic pattern repeats across ~15 distribution verticals. Each is a customizable clone:
- Electrical / plumbing supply (huge)
- Glass, sprinklers, stone, siding, flooring, roofing
- Paint / epoxy (Alpha Paints example)
- (Healthcare floated as another archaic, old-school industry)

Land industrial → template the platform → spread vertical by vertical.

## 10. Open questions for Matt (validation before build)

1. Of the ~1,500 regular manufacturers, roughly **what % have an open API vs. login-only vs. phone-only**? (Determines the A/B mix and the login-friction reality.)
2. Bring an **inside sales rep** to a working session: what exact fields do they pull daily? (Call gave: **part number, description, quantity, price, lead time** — confirm + prioritize.)
3. What order/inventory system is Industrial Supply on today, and does it expose an API we can write back to?
4. Is there appetite/authority internally to run a paid beta, and who owns that decision?
5. Free-freight thresholds + PO-batching rules — are they per-manufacturer? (Drives the PO-batching feature.)

## 11. First deliverable (this session)

- This PRD.
- [Call notes](CALL_NOTES_2026-07-20.md) — structured capture of the 2026-07-20 calls.
- A **clickable prototype dashboard** at [`/prototype/index.html`](../prototype/index.html) — single login (Industrial Supply), unified search across manufacturers, per-SKU price/stock/lead-time with tier badges, connection-status panel (live API vs. login-refresh), AI-assistant concept, and a free-freight PO-batching bar. Sample data only; nothing wired to real manufacturers.

The prototype exists to give Bryce / Braydn / Matt something concrete to react to and pick apart — "tell us the use cases," per Bryce.
