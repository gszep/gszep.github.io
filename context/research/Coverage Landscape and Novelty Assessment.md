# Coverage Landscape and Novelty Assessment

*Compiled March 2, 2026 — based on systematic search across 60+ queries spanning mainstream tech press, academic databases, open-source community, investment coverage, and paywalled analysis.*

## Key Finding

**The individual threads of the agentic transition are heavily covered. The unified narrative — connecting hardware infrastructure, attestation, agents, open-source resistance, and regulation into a single structural analysis — is not being told by anyone.**

---

## Coverage Map: Who Is Telling Which Part

| Thread | Key Outlets | Framing | Gap |
|--------|------------|---------|-----|
| Google's TPU / silicon strategy | CNBC, Bloomberg, The Next Platform, investment analysts | Infrastructure investment story | No connection to attestation or agent-blocking |
| Zero-click search / publisher collapse | AdExchanger, Superlines, Forbes, click-vision.com | SEO / media industry story | No connection to hardware or open-source resistance |
| OpenClaw growth + security incidents | TheHackerNews, Reco.ai, Kaspersky, Auth0 | Security / developer story | No connection to Google's countermeasures or structural power |
| EU DMA forcing agent access | Reuters, Engadget, Search Engine Land | Antitrust / regulation story | No connection to technical arms race |
| WEI / attestation resistance | Techdirt, Ars Technica (mostly 2023-2024) | Open web / DRM story | Coverage went cold after WEI was abandoned; Media Integrity API pivot under-covered |
| Agentic economy market size | Tracxn, Crunchbase, Citrini Research | VC / market sizing story | Pure dollar framing, no structural analysis |
| Agent protocols (MCP, A2A, NLWeb, WebMCP) | Microsoft Build, The Verge, Forbes, Chrome DevRel | Developer / standards story | WebMCP covered as dev tooling; strategic implications (Google defining the sanctioned agent protocol) unexamined |
| Ad-model disruption in agentic era | Ben Thompson / Stratechery | Economics / business model story | Asks "how will it be paid for?" not "who controls access?" |
| Societal / philosophical impact | NYT (Ezra Klein / Jack Clark), Anthropic blog | Experience / meaning story | Demand-side only; never asks the supply-side infrastructure question |
| Multi-platform competition (MSFT, AAPL, AMZN) | Financial press, enterprise analysts | Market share / competition story | Covered as product competition, not as structural counter-force to Google's vertical control |
| Model distillation / capability erosion | ML research community, r/LocalLLaMA, HuggingFace blogs | Technical / hobbyist story | No connection to strategic implications for data moats or behavioral data degradation |

---

## Closest Approaches to the Unified Narrative

### 1. Ben Thompson — "The Agentic Web and Original Sin" (Stratechery, May 20, 2025)

https://stratechery.com/2025/the-agentic-web-and-original-sin/

Thompson correctly identifies that the ad-supported web is dying in the agentic era and proposes a stablecoin-based micro-transaction marketplace where AI providers pay content sources via auction. He quotes Microsoft's Kevin Scott on the need for open protocols (MCP + NLWeb), and Nilay Patel pressing Scott on the fundamental question: *"The traffic to the web is in precipitous decline... How do you fix that problem?"* Scott's answer: *"I don't know, honestly."*

**What Thompson covers:** Economics of the dying ad web, Microsoft's open agentic web proposal, stablecoins as the payment layer, content auctions for AI citation.

**What Thompson misses:** Google's hardware stack as infrastructure for control; attestation as a gating mechanism; open-source agents as a resistance movement; the power asymmetry of Google controlling browser + mobile OS + search + commerce protocol + custom silicon simultaneously. Thompson asks "how will the agentic web be paid for?" — not "who decides which agents get access at all?"

**Key insight:** Thompson's entire marketplace equilibrium only works if agents can freely access content. If Google gates access via hardware attestation, the "open" part breaks and Google becomes the sole buyer in the content auction.

Also relevant: **"Aggregators and AI"** (Stratechery, Feb 13, 2026) — https://stratechery.com/2026/aggregators-and-ai/ — Thompson updating Aggregation Theory for AI. Paywalled; likely the most current version of his framework.

### 2. Microsoft Research — "The Agentic Economy" (arXiv:2505.15799, May 2025)

https://arxiv.org/abs/2505.15799

The closest academic treatment. Explicitly maps two competing equilibria: "agentic walled gardens" vs. "open web of agents." Covers advertising implications, micro-transaction evolution, unbundling of digital goods.

**What it misses:** Hardware attestation, open-source resistance, Google's specific infrastructure strategy.

### 3. Ezra Klein / Jack Clark — NYT Interview (Feb 24, 2026)

https://www.nytimes.com/2026/02/24/opinion/ezra-klein-podcast-jack-clark.html

The most prominent mainstream treatment. Clark (Anthropic co-founder) discusses agents as "genies," Claude Code writing Claude Code, entry-level job displacement, recursive self-improvement risk, the absence of public policy, and AI's effect on personality formation.

**What it covers:** The experience of living through the agentic transition — demand-side, societal, philosophical.

**What it misses entirely:** Google's countermeasures, hardware attestation, open-source agent ecosystem, zero-click search disruption, infrastructure power dynamics. Neither Klein nor Clark asks: who controls the infrastructure these agents run on? Clark mentions the "AI-to-AI economy" but doesn't address Google positioning itself as the tollbooth operator.

### 4. Techdirt — Mike Masnick (2023-2024)

Separately covered WEI/attestation resistance, Google's "managed decline" of the open web, and the crawler/agent distinction. Closest to editorially connecting the dots but hasn't published a unified piece.

- "Google's Plan To DRM The Web Goes Against Everything Google Once Stood For" (Aug 2023)
- "Decentralized Systems Will Be Necessary To Stop Google From Putting the Web Into Managed Decline" (May 2024)
- "Crawlers And Agents And Bots, Oh My: Time To Clarify Robots.txt" (Jul 2024)

### 5. AdExchanger — "The AI Search Reckoning" (Jan 2026)

https://www.adexchanger.com/publishers/the-ai-search-reckoning-is-dismantling-open-web-traffic-and-publishers-may-never-recover/

Connects zero-click search, publisher traffic collapse, and open web decline. Doesn't extend to hardware/attestation.

### 6. Hertie School — "From Digital to Agent Economy" (Sep 2025)

https://www.hertie-school.org/en/digitalgovernance/news/detail/content/from-digital-to-agent-economy-a-strategic-framework-for-ai-security

European policy school framing the digital-to-agent economy transition with security implications. Think-tank level.

---

## What Nobody Is Covering

No single article, report, or author weaves together:

1. Google's vertical hardware integration (Ironwood TPU) as the compute backbone
2. Attestation / Media Integrity API as a potential *defensive* gating mechanism
3. WebMCP as the *constructive* strategy—defining the sanctioned protocol for agent-website interaction
4. The multi-front platform competition (Microsoft, Apple, Amazon) as the primary structural counter-force
5. AI agents (OpenClaw, Firecrawl) as tools for digital self-determination
6. EU DMA / antitrust as the regulatory counter-force (potentially the most decisive factor)
7. Zero-click search / UCP as Google's "Final Destination" model for information
8. The hybrid tier: frontier distillation as a mechanism for gradual capability erosion and surveillance avoidance
9. The fundamental question: does the individual retain the right to run software on their own hardware that accesses public information without corporate permission?

Each thread is well-documented in its own silo. The synthesis is the gap.

---

## Framing Comparison

| Analyst | Primary Question | Frame |
|---------|-----------------|-------|
| Ben Thompson | How will the agentic web be paid for? | Economics / business model |
| Jack Clark / Ezra Klein | What does it feel like to live in the agentic transition? | Societal / philosophical |
| Microsoft Research | What market structures emerge in the agent economy? | Academic / institutional |
| EU DMA enforcers | Is Google's vertical integration anti-competitive? | Regulatory / legal |
| Techdirt / EFF | Is the open web under threat from DRM? | Digital rights / open web |
| Investment analysts | How big is the agentic economy market? | Dollars / market sizing |
| Financial press | Who's winning: Google, Microsoft, or Apple? | Market share / competition |
| ML research community | How do you run frontier models locally? | Technical / capability |
| **This research document** | **Who controls the infrastructure layer of the agentic web, and how do users reclaim agency?** | **Structural power / multi-front competition / hybrid resistance** |

The infrastructure question — who controls the hardware, protocols, and attestation systems that determine which agents can access which information — is the one that determines whether all the other conversations matter. Thompson's marketplace only works on an open platform. Klein's societal concerns only matter if people retain agency. The EU's regulations only bite if enforcement is technically feasible.

---

## Timing

The timing for this analysis is strong:

- **Jan 27, 2026:** EU opened formal DMA specification proceedings against Google
- **Jan 27-29, 2026:** ClawHavoc supply-chain attack on OpenClaw
- **Feb 3, 2026:** CVE-2026-25253 disclosed (OpenClaw 1-click RCE)
- **Feb 13, 2026:** Thompson published "Aggregators and AI"
- **Feb 15, 2026:** Steinberger (OpenClaw founder) joined OpenAI
- **Feb 18, 2026:** Perplexity abandoned advertising entirely
- **Feb 19, 2026:** Google shipped WebMCP via Chrome 146 Canary
- **Feb 24, 2026:** Klein/Clark interview aired
- **March 2, 2026:** This research compiled and stress-tested

These events are days to weeks old. Nobody has yet stepped back to see the strategic pattern they form.

---

## Potential Interlocutors

People most likely to engage with or amplify a unified structural analysis:

| Person / Outlet | Why | Risk |
|----------------|-----|------|
| Mike Masnick (Techdirt) | Already covers WEI + open web decline separately | May see as speculative |
| Ben Thompson (Stratechery) | Has the framework (Aggregation Theory); missing the infrastructure layer | Paywalled audience; might disagree on attestation risk |
| Cory Doctorow | "Enshittification" framework maps directly; publishing AI book June 2026 | Skeptical of agents in general ("pogo-stick grift") |
| EFF | Digital rights organization; covered WEI resistance | Institutional pace; may not move fast |
| Matt Stoller (BIG Newsletter) | Antitrust focus; covers Google | May not have technical depth on attestation |
| Nilay Patel (The Verge) | Asked the key question to Kevin Scott; clearly thinking about this | Platform reach |
| 1ID.com (startup) | Building TPM-based agent identity — commercial embodiment of attestation concept | Commercial interest |

---

## Assessment

This research document fills a genuine, verified gap in public discourse. The corrected version — with fabricated claims removed, speculation clearly labeled, sourcing caveats added to unverified technical claims, and the analysis expanded to include the multi-platform competitive landscape, WebMCP's constructive strategy, and the hybrid distillation tier — is positioned as the first credible unified structural analysis of the agentic transition told from an infrastructure-control perspective.

The strongest framing for publication: *the economic conversation (Thompson), the societal conversation (Klein/Clark), and the competitive conversation (financial press) are all incomplete without the infrastructure conversation. Who controls the pipes determines whether the marketplace is open, whether the societal questions even matter, and whether users retain a pathway to agency through distillation and local execution. The hybrid tier — users who strategically extract frontier capabilities and execute locally — may be the most consequential and least-covered dynamic in the entire transition.*
