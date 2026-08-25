# Manufacturer outreach — what to ask, who asks, and what to hold

**Written 2026-08-25**, after Milwaukee went live. Pairs with
[CONNECTOR_ACCESS_LOG.md](CONNECTOR_ACCESS_LOG.md) and
[WHAT_WE_NEED.md](WHAT_WE_NEED.md).

---

## The rule: every email comes from Matt, on his work address

Manufacturer accounts must sit on `mflake@indsupply.com`. Not because an outside address
is *blocked* — the Milwaukee signup ran on Bryce's address by mistake and attached to
Industrial Supply's site anyway, returning their live net pricing. **That is the reason,
not the counter-argument:** an outside email holding a distributor's confidential tier
pricing is what gets an account revoked and makes the rep conversation awkward.

Beyond that, the rep relationship is Matt's. A stranger asking a manufacturer for
parent-account access to a distributor's pricing is a red flag; the distributor's own rep
asking for it is routine.

**Open item:** migrate the existing Milwaukee account off Bryce's address.

**Bryce is cc, never sender.**

---

## ⚠️ Sequence the asks. Two are routine. One is not.

There are three things we want from every manufacturer. They do **not** all carry the
same risk to Matt, and they should not travel in the same email.

| Ask | Risk | When |
|---|---|---|
| **Parent-account scope** (all ship-to sites, not one branch) | None. Ordinary distributor housekeeping — any rep grants it. | **Now** |
| **Does an EDI 846/832 feed or documented API exist?** | None. A distributor asking what rails his vendor supports. | **Now** |
| **Written permission for a named third party to pull data programmatically** | **Real.** | **Hold** |

**Why the third one waits.** Matt is an outside sales rep, not Industrial Supply's IT
or purchasing authority. Asking a manufacturer to bless third-party access to Industrial
Supply's pricing escalates to that manufacturer's channel and legal side — and from
there it can get back to Industrial Supply's management. **If Industrial Supply's
leadership hears about this project from Milwaukee before they hear it from Matt, Matt
is the one holding it.**

So: get the scope and the feed answers now, which are defensible as an employee
accessing his own company's vendor portals. Hold the programmatic-access permission
until **A6 lands — a named internal owner at Industrial Supply who has said yes.** Then
that ask comes from the company, not from one rep, and it costs nothing.

---

## Template A — brand where a login already exists (scope-up)

*Use for Milwaukee now. Use for 3M VCOM and DeWalt if Matt's existing logins turn out to
be single-site.*

> **Subject:** Industrial Supply — parent account access on Connect
>
> Olivia,
>
> Thanks for getting the Connect account set up — I'm in and it's working.
>
> Two things I need to sort out:
>
> 1. The login is bound to a single ship-to site (Spanish Fork). I need visibility across
>    all of Industrial Supply's ship-to sites under the parent account. Your help text
>    says that takes a Customer Master Buyer Contact Request from you — can you get that
>    started?
> 2. When we set this up, your email referenced a "distribution account number" and the
>    portal form asked for a "ship-to-site account number." I want to make sure the right
>    one got bound — it landed on Spanish Fork, not our Salt Lake office.
>
> Separately, a question: does Milwaukee offer distributors an EDI feed — 846 inventory
> or 832 price catalog — or a documented API for pricing and availability? We're looking
> at how much time our inside sales desk spends pulling stock and pricing by hand, and
> I'd rather know what you already support before we build around the portal.
>
> Thanks,
> Matt

---

## Template B — new brand (login + scope in one shot)

*Use for every new manufacturer, including the smaller/older vendors. The whole lesson
from Milwaukee is that asking for scope **after** the login costs a second round trip
with the rep.*

> **Subject:** Distributor portal access — Industrial Supply
>
> [Name],
>
> I'm an account manager at Industrial Supply — we've been buying [brand] through you
> for [time].
>
> Can you get me set up with a distributor login for [portal]? Two things to get right up
> front, because we got tripped up on this with another vendor:
>
> 1. Set it up on my work email, mflake@indsupply.com.
> 2. Scope it to our **parent account**, so it covers all our ship-to sites rather than
>    one branch. If that takes a separate request on your end, let's start it now instead
>    of fixing it later.
>
> Two quick questions while we're at it:
>
> - Do you offer distributors an EDI feed — 846 inventory, 832 price catalog?
> - Is there a documented API for pricing and availability?
>
> We're working on cutting the time our inside sales desk spends pulling stock and
> pricing by hand, and I'd rather build around whatever you already support.
>
> Thanks,
> Matt

---

## On the small / older vendors — yes, and pick them well

Matt offered to pull logins from smaller companies "to see if it works with older
software." **This is the most useful test available to us**, and it should happen.
Milwaukee is a best case: a modern portal built in the last two or three years. Our
central risk is that the top fifty look nothing like it, and small vendors on old
software are the informative sample, not the easy one.

One steer: **pick three to five that Industrial Supply actually buys real volume from.**
A connector for a vendor they barely purchase from proves the technology but not the
product. Volume plus bad software is the combination that teaches us something.

---

## Known future problem: one mailbox holds everything

If every manufacturer account is keyed to Matt's individual mailbox, then every password
reset, verification code and MFA prompt for the entire system funnels through one person
— and the whole thing is tied to his continued employment. That is the correct call for
right now and it should not slow anything down. The standard fix, when Industrial Supply
formally sponsors this, is a shared distribution mailbox or group alias
(`ecommerce@indsupply.com` or similar) that several people can reach.

**Raise it once, when the internal sponsor conversation happens. Do not solve it now.**
