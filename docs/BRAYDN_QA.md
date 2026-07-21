# Braydn's concerns & questions — answered

> Braydn raised the real engineering objections on the 2026-07-20 call. He's right to — he built the 5-tier pricing model on the "Olive" project, so he knows where the bodies are buried. These are the direct answers, numbered to his points. Pairs with [ROADMAP.md](ROADMAP.md).

---

## 1. "Bots don't like logging in / storing passwords. If you can't log in, there's no way."

**Mostly solvable, and we avoid raw passwords wherever possible.** There's a priority ladder — we use the highest rung each manufacturer supports:

1. **Official API + API key / OAuth token** — no "login" at all, just an authenticated request. Most manufacturers that already built a distributor portal (3M VCOM, DeWalt, Milwaukee) have or can issue API/EDI access to their distributors. This is the clean path and it needs no password storage.
2. **EDI / PunchOut** — the industry *already* moves this data as files/feeds (see §3). No login, no bot.
3. **Delegated login (token, not password)** — where only a portal exists, the distributor connects once through us; we store a **refresh token**, not their password, in an encrypted vault.
4. **Authenticated headless session (last resort)** — only when a brand has *nothing* but a login form. The distributor's own credentials, their explicit consent, encrypted at rest. This is exactly how **Plaid connected to banks** before open-banking APIs existed — it's a known, fundable, legitimate pattern, not a hack.
5. **Phone-only fallback** — flagged in the UI as "no feed" (the red dot in the prototype). Graceful degradation, not a broken row.

**Bottom line:** we don't need bots typing passwords for the manufacturers that matter most. The heavy password-storage worry only applies to rung 4, which we minimize and isolate. The Phase 0 matrix tells us how big rung 4 actually is *before* we commit.

---

## 2. "How does the software know what price to give me if I'm not logging in? My prices differ from yours based on my history, and it's different per brand."

**This is the crux, and you're exactly right — price is identity-specific, so it can't be a public dynamic feed.** The answer is that price is **always scoped to a distributor + a manufacturer**, never global:

- Every price we show is the result of `price(distributorId, manufacturerId, sku)` — i.e., *your* Industrial-Supply-Tier-3-with-Milwaukee number, pulled through *your* authenticated connection to that brand. The prototype already shows this: the price column carries a **per-brand tier badge (T1/T2/T3)** because you're Tier 3 with Milwaukee, Tier 1 with DeWalt, Tier 2 with Ansell — all at once.
- We are **not** trying to compute your price from a public list. We're retrieving the price the manufacturer already has for *you*, behind *your* credentials/API key. So the tier logic lives where it belongs — on the manufacturer's side — and we just fetch and display it, timestamped and source-attributed ("as of 11:42, via Milwaukee API").
- For manufacturers with no per-identity feed at all, we fall back to your negotiated price list (uploaded once) and flag it as "list/contract price, not live."

So the honest v1 reality — which you called on the phone — is: **you connect once per brand (API key or login), and from then on it pulls your real, tier-correct price automatically.** The one-time connect is the price of never phoning again. Your "Olive" 5-tier model is the same shape; here the tier just lives per-manufacturer instead of per-app-user.

---

## 3. "The ideal is that these end users have an endpoint / API."  → and the shortcut you may not know exists

Agreed — API is the ideal. **But there's a rail that likely already exists and is worth checking before we build anything: EDI.** Industrial distribution has run on EDI for decades:

- **EDI 846** = Inventory Inquiry/Advice (on-hand quantities).
- **EDI 832** = Price/Sales Catalog (your catalog + *your* pricing).
- **cXML PunchOut** = the live catalog-punch standard used all over B2B procurement.

Many manufacturers already send 846/832 to their distributors. **If Industrial Supply already receives these from its top brands, v1 might be "aggregate and surface files they already get," not "integrate 50 APIs."** That would collapse the hardest part of the build. That's why the Phase 0 matrix explicitly asks: *does Industrial Supply already get EDI 846/832, and where do those files land?* If the answer is yes for the top 20, we've found our on-ramp.

---

## 4. Dream state: "Milwaukee marks 'Braydn = Tier 3' and we hit tier-specific endpoints. Maybe that's more complex."

**Correct — that's the Phase 3+ partnership play, not v1.** It requires manufacturers to build tier-aware endpoints *for us*, which means we need distributor demand first to have leverage. We get there by landing distributors (who bring their own credentials), proving volume, and *then* going to manufacturers with "your distributors are already pulling through us — let's make it a first-class integration (and here's an analytics product for you)." Don't block v1 on it.

---

## 5. "How do we keep it user-friendly and still save time if there's login friction?"

- **The friction is one-time.** A "connect your manufacturers" setup wizard: log in / paste an API key once per brand; tokens refresh silently after. Fifty brands sounds like a lot, but it's a one-afternoon onboarding, and we can seed it with the ~10 that cover most spend so value shows up on day one.
- **The daily experience has zero friction** — one search box, all brands, your prices. That's the whole point, and it's already what the prototype feels like.
- **We prioritize by spend, not by count.** Connecting the top 15 manufacturers probably covers the large majority of daily lookups. The long tail can stay phone-only (flagged) and get added over time.

---

## 6. Business model: "Charge both ends? Per-user? Per-purchase — but we buy in bulk with free-freight thresholds, so does per-transaction even work?"

**Your skepticism on per-transaction is right for v1. Lead with subscription.**

- **Primary: SaaS subscription** — per-seat and/or per-connected-manufacturer tiering. Why: the ROI is *labor + freight + fewer stale-quote losses*, not transaction volume. If we replace/augment the pricing-lookup work and catch back-orders early, "$10k/month" (Bryce's number) is easy math against inside-sales headcount. Subscription revenue is also predictable, which matters for the business we're building.
- **Secondary (Phase 3): transaction %** — only *if* purchasing runs on-platform. And you're right that bulk + free-freight batching makes a naive per-PO cut chunky and lumpy, so this is an add-on, not the foundation.
- **Charging manufacturers (the "both ends"):** real, but *later*. Manufacturers pay for analytics/placement once distributor demand exists. Gating v1 on manufacturer payment is the chicken-and-egg trap — distributors are the ones feeling the pain today, so distributors pay first.

---

## 7. The unspoken one: "Will this disrupt morale / cost people their jobs?"

You flagged the cultural risk on the call, and it matters for the *beta relationship* specifically. Position and build it as **augmentation**:

- The tool eats the tedious lookup/phone-tag work, not the relationships. Outside reps (Matt) still take buyers to lunch — they just walk in already knowing stock and price.
- In the pitch and the metrics, we measure **"reps freed for selling"**, never "reps eliminated." A distributor's own leadership can decide staffing; we don't lead with headcount cuts, especially at Industrial Supply where Matt has to keep working.

---

## The one number that settles most of this

Almost every open question above resolves once we know, for the top ~50 manufacturers by Industrial Supply's spend: **API? EDI today? login-only? phone-only?** That's the Connector Feasibility Matrix, and it's Matt's first job in Phase 0. Everything downstream — architecture, timeline, how much of §1's scary rung-4 we actually touch — falls out of it.
