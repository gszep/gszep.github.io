# Tit-for-Tat Revisited: What the Axelrod Tournament Actually Teaches

Research notes from building the *Game Theory & AI Safety* lecture's interactive Axelrod tournament. These findings emerged from building working simulations of the 14 original 1980 strategies plus Generous TFT, then stress-testing the popular "TFT wins, cooperation is solved" narrative against both the live histograms and the actual literature.

---

## 1. The popular TFT story is overstated

The folk narrative — "Axelrod ran a tournament, TFT won, cooperation is solved" — collapses on closer inspection:

- **TFT won by a small margin.** The top 8 strategies (TFT, Tideman-Chieruzzi, Nydegger, Grofman, Shubik, Stein-Rapoport, Friedman, Davis) all scored within ~5% of each other. They share the "nice cluster" traits more than they differ on them.
- **TFT can't win individual matchups.** TFT only ties or loses 1-on-1; it gets to the top by being a *good loser*. Rapoport, Seale & Colman (2015, *PLOS One*, ["Is Tit-for-Tat the Answer?"](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0134128)) showed that TFT's tournament win was largely a "**kingmaker effect**" — two weak strategies in the bottom 7 happened to consume TFT's rivals more than TFT itself.
- **Tit-for-Two-Tats would have won 1980 if anyone had submitted it.** Axelrod confirmed this post-hoc — but TFT2 *lost* the 1981 tournament when Axelrod entered it himself, because the second-tournament pool was nastier. **The winner depends on the pool.**
- **The result is contingent on tournament design** (5×200-round iterations averaged), success criterion (total points), and the specific payoff matrix (T=5, R=3, P=1, S=0). Change any one and the ranking shifts.

## 2. Axelrod's four traits remain the strongest single predictor

Despite the caveats, the classical four traits cleanly separate the histogram clusters in our simulation:

1. **Nice** — never the first to defect
2. **Retaliatory** — defect back when defected against
3. **Forgiving** — stop retaliating when opponent returns to cooperation
4. **Clear** — predictable enough that opponents can learn to trust you

In our visualization with default payoffs, the green-labelled (good-cluster) strategies all peak near R·N = 600 points per matchup. The red-labelled (non-cooperative) strategies show broad, low-mean distributions. Niceness is the single biggest predictor — but **not the whole story**.

## 3. Noise dramatically reshuffles the rankings

Turning the noise slider above ~5% causes a near-inversion of the strict half of the top cluster:

- **Friedman (Grim)** drops to **last**. It never forgives, so one accidental defection from noise (or its own noise-flipped move) locks two Grims into mutual defection forever. Davis, Shubik, Tideman-Chieruzzi follow it down.
- **TFT** falls to the middle. Its strict mirror reflex creates the [Nowak-Sigmund "death spiral"](https://www.semanticscholar.org/paper/A-strategy-of-win-stay,-lose-shift-that-outperforms-Nowak-Sigmund/f472362ec34cec502a368e62f0a27f321062f43c): one noise flip → endless mutual recriminations.
- **Generous TFT** rises near the top. Nowak & Sigmund 1992 (*Nature* 355) showed GTFT with `q = min(1 - (T-R)/(R-S), (R-P)/(T-P))` (~1/3 for classic payoffs) is evolutionarily stable against TFT and recovers from noise.
- **Grofman** climbs because its "if last actions matched, cooperate" rule actively *un-locks* mutual defection: after a noise-induced DD, both Grofmans offer peace next round.

This is the pedagogical core of the *Noise Problem* slide. Strict principles fail in the real world.

## 4. Adaptive strategies can beat principled ones

The surprise finding: **Revised Downing wins under noise**, beating even GTFT.

We use Axelrod's "revised" Downing — cooperates first 2 rounds to gather data, then chooses the move with higher expected payoff: E[C] = pC·R + (1-pC)·S vs E[D] = pD·T + (1-pD)·P. The *original* Downing (defects first) had a fatal flaw: it never explored cooperation, so pC stayed at the uninformed default, trapping it in permanent defection against forgiving strategies. Axelrod identified this bug post-tournament.

Revised Downing wins because:

- **It models its opponents.** Tracks P(opp cooperates | my last move) and computes expected payoff for each action. Against reciprocators it learns pC ≈ 1.0 and cooperates; against defectors it learns pD ≈ 0 and defects.
- **Adapts to noise without overreacting.** A single noise-flipped move barely shifts its running estimates, so its policy stays stable. Strict reciprocators (TFT) overreact; reflexive forgivers (GTFT) recover but slowly; *learners* (Downing) just absorb the noise.
- **Pays a small upfront cost for information.** 2 rounds of cooperation to calibrate pC, then stable optimal play.

This is the most important finding for the AI safety thread — not "bad strategies win" but "modeling beats principles."

## 5. The lecture progression that emerges

1. **Class submissions first** → start the non-spatial tournament with only **Random** visible. Students describe strategies in plain language; we implement them live in `src/lib/ipdStudentStrategies.ts`.
2. **Compare against a hidden literature pool** → each submitted strategy is scored against the full literature set, but the literature histograms stay hidden until the "Show literature strategies" checkbox is enabled.
3. **Reveal the literature strategies** → show that TFT is part of a top cluster, not a magic winner. Rankings depend on the pool, noise, payoff matrix, and scoring criterion.
4. **Add noise** → GTFT > TFT > Random. "Be forgiving too." Even Random can beat TFT because Random can't death-spiral — strict reciprocity amplifies noise into prolonged mutual punishment.
5. **Allow opponent-modeling strategies** → Downing > GTFT. **"Modeling beats principles."**

That fifth step is exactly what modern AI systems do. They don't follow fixed reciprocity rules — they build models of users, agents, environments. The simulation's "Revised Downing wins" result is the pedagogical pivot from Part I (game theory) into Part III (AI collective behavior): *the more capable the learner, the less safe it is to assume it will follow simple principles like "be nice."*

The twist: Revised Downing is *nice* (cooperates first). It doesn't win by being bad — it wins by being *smart*. The threat isn't malicious agents; it's agents that model you well enough to find the optimal response to your strategy.

### Current interactive structure

- **Non-spatial histogram tournament (`AxelrodTournament.astro`)**
  - Uses `LITERATURE_STRATEGIES + STUDENT_STRATEGIES + Random`.
  - Literature strategies are hidden by default; the checkbox reveals them live.
  - Student strategies are imported from `src/lib/ipdStudentStrategies.ts`, so one live edit makes a submission appear in the tournament.
  - The visible chart starts with Random only, then student submissions, then the literature reveal.

- **Spatial population dynamics (`CooperationEmergence.astro`)**
  - Uses the same literature set and the same shared `STUDENT_STRATEGIES`.
  - Each grid cell is a strategy, not just "cooperate" or "defect".
  - Cells play short repeated PD matches against neighbors, earn payoffs, then copy the locally best-performing neighbor.
  - Mutation means randomly switching to another strategy from the full available strategy list.
  - The paint dropdown uses the same strategy names and category colors; left-click drag paints the selected strategy.
  - The time series shows population share for good/mixed/bad strategy categories, matching the grid colors.

## 6. Modern literature that strengthens the story

Worth citing in the lecture or as backing for any "TFT solved cooperation" pushback:

- **[Nowak & Sigmund (1993), *Nature* 364](https://www.semanticscholar.org/paper/A-strategy-of-win-stay,-lose-shift-that-outperforms-Nowak-Sigmund/f472362ec34cec502a368e62f0a27f321062f43c)** — Pavlov (Win-Stay-Lose-Shift) outperforms TFT in *simultaneous* iterated PD with noise.
- **Nowak & Sigmund (1992), *Nature* 355** — Generous TFT (forgiveness probability ~1/3) is evolutionarily stable against TFT, recovers from noise.
- **[Press & Dyson (2012), *PNAS* 109](https://www.pnas.org/doi/10.1073/pnas.1206569109)** — *Zero-determinant strategies* can deterministically set the opponent's score in iterated PD. They don't necessarily *win* (the [Stewart-Plotkin commentary](https://www.pnas.org/content/109/26/10134) calls them "mischievous"), and they're not evolutionarily stable, but they invalidate the claim that "no strategy can systematically extort another." Caveat: TFT is a singular case where their equations involve a division by zero.
- **[Rapoport, Seale & Colman (2015), *PLOS One*](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0134128)** — formal demonstration that TFT's tournament success was contingent on Axelrod's specific design, criterion, and payoff values. The "kingmaker effect."

## 7. Methodological lessons from building the simulation

Notes for future interactive game-theory components:

- **Show distributions, not rankings.** A single tournament run with stochastic strategies gives noisy ordinal results. Histograms over many iterations reveal both *mean performance* and *variance* (which is often more interesting — e.g., Joss's bimodal distribution: huge exploits or huge losses).
- **Use median rather than mean for ranking.** Robust to outliers in bimodal distributions.
- **Iterations have to be high enough.** With the current 16-strategy pool, 50 iterations × 16 matchups = 800 samples per strategy gives reasonably smooth histograms.
- **Include self-matchups, but only once.** Excluding them hides Grim's biggest weakness (Grim-vs-Grim spirals into perpetual defection under noise). Double-counting self-matchups overweights self-play and biases the histograms.
- **Hide/reveal matters pedagogically.** Students should see their own strategy against Random first, then against the hidden literature pool, before the literature strategies are revealed.
- **Use one shared student-strategy source.** Student submissions belong in `src/lib/ipdStudentStrategies.ts`, imported by both non-spatial and spatial simulations. Duplicating the list guarantees drift.
- **Simplified strategy implementations matter.** A too-forgiving "Nydegger" implementation (cooperate if opp cooperated 2 of 3 rounds) accidentally became TFT-for-Two-Tats, which would have won Axelrod's tournament. Faithful implementations of complex 1980 strategies (Nydegger's lookup table, Stein-Rapoport's chi-squared test, Downing's outcome maximization) significantly change the rankings.

## 8. Strategy implementation audit (session 2)

Stress-tested all 16 strategy implementations against the Axelrod-Python reference implementations and primary literature. Key findings:

### Bugs fixed

1. **Downing expected payoff** — was comparing `pC > pD` instead of `E[C] = pC·R + (1-pC)·S` vs `E[D] = pD·T + (1-pD)·P`. The simplified comparison gave wrong decisions even for classic payoffs (e.g. pC=0.6, pD=0.4 → simplified says cooperate, but E[C]=1.8 < E[D]=2.6).

2. **Original vs Revised Downing** — the correct expected-payoff formula exposed a deeper problem. Original Downing (defects first 2 rounds) never explores cooperation, so pC stays at the uninformed default 0.5. Against GTFT, E[D] ≈ 2.33 > E[C] = 1.5 permanently — Downing exploits forgiving strategies indefinitely instead of learning to cooperate. This is the exact flaw Axelrod identified. Switched to **Revised Downing** (cooperates first 2 rounds) which gathers data for pC early and genuinely models opponents. Classification changed from "bad" to "mixed."

3. **Tullock sliding window** — was using full-history cooperation rate instead of last 10 moves as in the original. Full history makes Tullock less responsive to recent behavior changes.

4. **Hot-path allocations** — Tideman `h.slice(-10).filter()`, Nydegger `h.slice(-3).filter()`, Graaskamp `h.slice(51,56).some()` all replaced with index-based loops. These were allocating millions of arrays in the innermost tournament loop.

5. **Slider debounce** — added `requestAnimationFrame` debounce. Previously every `input` event ran the full 2.56M-round tournament.

### Acknowledged simplifications (not fixed)

| Strategy | Our version | Original | Impact |
|---|---|---|---|
| **Nydegger** | TFT + defect if 2/3 recent opponent defections | 64-entry lookup table using weighted 3-round history including own moves | Meaningfully different behavior but stays in nice cluster |
| **Tideman-Chieruzzi** | TFT + defect if >3/10 recent defections | Escalating retaliation + score-based "fresh start" mechanism + endgame defection | Missing fresh start makes it too punishing under noise |
| **Stein-Rapoport** | Cooperation rate threshold (±0.08 of 0.50) | Chi-squared test for randomness | Rougher detection but same intent |
| **Graaskamp** | Fixed exploitation every 5th round | Random 5-15 round exploitation intervals | Too predictable but same probe-then-classify structure |

These simplifications keep the strategies in their correct clusters, which matters more than exact rankings for the lecture narrative.

### Classification audit

Verified all 16 strategy classifications against Axelrod's four traits (nice, retaliatory, forgiving, clear):

| Category | Definition | Strategies |
|---|---|---|
| good (green) | nice + retaliatory + forgiving | Tit-for-Tat, Generous Tit-for-Tat, Modified Tit-for-Tat (Tideman-Chieruzzi), Three-Round Retaliator (Nydegger), Probabilistic Forgiver (Grofman), Random Detector (Stein-Rapoport) |
| mixed (amber) | nice but missing a trait | Grim Trigger, Gradual Punisher (Shubik), Delayed Grim Trigger (Davis), Probe-and-Exploit (Graaskamp), Expected-Payoff Learner (Downing), Periodic Prober |
| bad (red) | breaks niceness or unreliable | Fading Tit-for-Tat (Feld), Sneaky Tit-for-Tat (Joss), Undercutting Cooperator (Tullock), Random |

Key change: **Downing moved from "bad" to "mixed"** after switching to the revised version (cooperates first = nice).

## 9. TFT vs Random under noise: not a bug

At 500 rounds, 1% noise, Random ranks #4 — above TFT at #5. Diagnosed via per-matchup score analysis:

**TFT death-spirals with 7/16 opponents.** Noise flips a single C→D, TFT retaliates, the opponent retaliates back, and strict reciprocity amplifies the perturbation into prolonged mutual punishment:

| TFT vs | Score | Mechanism |
|---|---|---|
| Shubik | 599 | Noise triggers escalating punishment |
| Tullock | 603 | Tullock undercuts → TFT retaliates → spiral |
| Grim | 633 | One noise flip → permanent DD |
| Tideman | 635 | Simplified Tideman lacks "fresh start" to break cycles |
| Davis | 646 | Grim after round 10, triggers from noise |
| Feld | 677 | Increasing defection rate feeds TFT retaliation |
| Joss | 703 | Sneaky 10% defection → classic death spiral |

TFT median across all 16 matchups: **858**.

**Random is immune to death spirals** because it doesn't retaliate. Against the same opponents that destroy TFT via spiral (Tullock 969, Joss 1043, Feld 912), Random scores ~300 points higher per matchup because it simply doesn't amplify noise.

Random median: **940** — beating TFT by 82 points.

This is correct behavior, not a simulation artifact. It strengthens the lecture's point: **strict reciprocity is TFT's weakness under noise, not its strength.** The very trait that makes TFT dominant in clean environments (immediate retaliation) becomes a liability when communication is noisy.

## 10. Where the simulation can mislead

- Our **Random** ranks ~7th in our noisy setup, vs. last in Axelrod's. Reason: with only one Random in a 16-strategy pool and 50 iterations, Random's variance is huge — it sometimes stumbles into good runs against reciprocators that get exploited by its accidental defections. In Axelrod's averaged 5×200-round design, Random consistently came last.
- **Periodic Prober** stands in for Axelrod's "Name Withheld" entry. The original code is not public in our current source trail, so this remains a teaching placeholder, not a faithful reconstruction.
- **The spatial simulation is not the same experiment as the histogram tournament.** It shows local imitation and cluster formation: strategies play neighbors, then cells copy the highest-payoff neighbor. This is useful for "cooperation can emerge from self-interested local updating," but it will favor different properties than a well-mixed round-robin. For example, Grim Trigger can dominate spatially because cooperative Grim clusters are stable and harsh at boundaries, while it is brittle in noisy well-mixed tournaments.
- **Mutation in the spatial simulation means strategy replacement.** A mutated cell randomly selects another available strategy from the shared pool, including student submissions. It is not a C/D action flip.

---

## TL;DR for the lecture

1. **TFT is *good*, not *the answer*.** It's a member of the top cluster; the cluster matters more than the winner.
2. **Niceness + retaliation + forgiveness** is the right pattern for cooperative environments without noise.
3. **Noise breaks reciprocity-based strategies.** Strict ones (Grim, TFT) collapse; forgivers (GTFT) recover. At 1% noise, even Random beats TFT because Random can't death-spiral.
4. **Adaptive strategies beat principled ones** in noisy pools. Revised Downing wins by genuinely modeling opponents (E[C] vs E[D]), not by exploiting them. This is the AI safety bridge.
5. **There is no universal winning strategy** — only strategies robust to specific conditions. The "cooperation is solved" claim is a myth.
