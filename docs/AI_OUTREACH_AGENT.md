# AI Outreach Agent — closing the "phone-only" gap

> Bryce's idea (2026-07-21): stand up a dedicated **email address + phone number operated by an AI agent** that automatically contacts manufacturers with no API to get SKUs, pricing, stock, and lead times — plus a services arm that helps distributors on bad/no systems upgrade *onto our platform.* Companion to [ROADMAP.md](ROADMAP.md) and [BRAYDN_QA.md](BRAYDN_QA.md) §1.

## Why it matters
It closes the **last rung** of the connector ladder. We had: API → EDI → login → headless session → *phone-only dead-end*. This turns the dead-end into a real connector, so every "no feed" (red) manufacturer in the prototype becomes reachable. And it automates a job Industrial Supply **already pays humans to do** — Matt on the call: they "hired dedicated people just to call and get updated pricing." We're replacing a salaried cost line, not inventing work. Cleanest ROI story in the project.

## Design decisions
- **Lead with email/text; voice is the fallback.** Email is cheaper, auditable (written record of the quoted price/qty), and doesn't fight IVR trees or hold music. Reserve voice for truly phone-only suppliers who won't answer email.
- **Verbatim capture, never paraphrase.** Voice → recording + transcript; email → raw reply. The model extracts, it does not invent. Every value is shown with **source + "as of" timestamp + confidence.** A hallucinated price/qty burns a customer — that's the one unacceptable failure mode.
- **Existing supplier relationships only** — not cold outreach.
- **Human-in-the-loop for relationship accounts** — the agent can tee up the call/draft the email; a human closes where the relationship matters (cultural guardrail from the call).

## Compliance notes (validate before scaling)
- **AI-call disclosure + recording consent vary by state.** Utah is one-party consent, but the manufacturer being called may sit in a two-party-consent state → handle per-state (disclose it's an AI/recorded call where required).
- Keep to B2B, existing-relationship contacts; mind TCPA-style rules on automated outbound.
- Log consent + disclosures per call.

## Cost (rough, current-market — validate)
| Piece | Ballpark | Notes |
|---|---|---|
| AI voice call | ~$0.05–0.15/min all-in | telephony + STT + LLM + TTS (Vapi / Bland.ai / Retell class). ~2–5 min stock/price call → **~$0.20–0.75/completed call** |
| Phone number | ~$1–2/mo each | Twilio-style rental |
| AI email/text agent | fractions of a cent / message | just LLM tokens + send service; bottleneck is reply latency (hours), not cost |
| Build/integration | weeks, not months | platforms handle telephony/voice; we build ask → parse → log → confidence-check |
| Platform run-rate (MVP) | low hundreds / mo | hosting + DB + AI at beta scale |

**Punchline:** a few hundred phone-only lookups/day at ~$0.50/call ≈ **$50–200/day of agent cost to replace hours of a salaried caller** — and email lookups are near-free on top. The agent is far cheaper than the human it augments.

## Monetization (this is where usage-based pricing actually fits)
1. **Raises the base SaaS value** — it's the feature that turns red rows green.
2. **Metered add-on** — included monthly call/email quota + overage per call, or a per-connected-phone-only-manufacturer fee. Usage scales with value delivered (unlike a per-PO %, which Braydn rightly flagged as lumpy).
3. **"Get you off the phones" managed tier** — premium plan where we run the agent across a distributor's whole phone-only tail. Sticky.
4. **Upgrade/migration services arm** — distributors on no/crappy systems: setup/implementation fee + recurring SaaS once they're on our data layer. Highest margin *and* biggest moat (we become their system of record). People-heavy → scope deliberately, possibly as a partner/reseller motion.
5. **Build-once, monetize-across-tenants** — a brand's email/voice connector, built once, benefits every distributor on the platform.

## Build options
Voice: **Vapi / Bland.ai / Retell** (they handle telephony + STT + TTS). Numbers: **Twilio**. Email agent: standard LLM + a transactional email provider. (Bryce referenced "quo.com" — confirm if that's a specific tool to price against.)

## Where it slots in the roadmap
- **Phase 0:** in the Connector Feasibility Matrix, tag the phone-only manufacturers as "AI-agent candidates" and note whether they have a monitored email (email-first target) vs. phone-only.
- **Phase 2:** build the agent as a connector type once the API/EDI core is proven (don't lead the MVP with it — prove the clean-data path first, then automate the messy tail).
- **Services arm:** parallel track / partner motion, not on the core build's critical path.
