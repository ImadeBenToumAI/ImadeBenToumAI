# Ambiflex launch kit

Everything launch day needs, ready to paste. Drafted by Claude from the session's real data; Imade edits, signs and posts. Nothing here is published by the plugin or by Claude.

## 1. The 60-second video (node n10)

**Rendered, ready to post:** `assets/launch/ambiflex-portrait.mp4` (1080×1920, X / LinkedIn / Shorts) and `assets/launch/ambiflex-landscape.mp4` (1920×1080, HN / YouTube), plus one still per shot (`assets/launch/0N-*.png`) for posts and the README. Re-render after a tree change with `node tools/launch-video/record.js portrait|landscape` (needs Playwright's Chromium and ffmpeg; the page it records embeds `.ambiflex/tree.json`).

Shot list, as rendered (captions only, no voice-over):

| # | Seconds | What is on screen | Caption |
|---|---|---|---|
| 1 | 0-5 | The tree, top-down, 19 nodes. Goal at the top. | "This is a plan Claude Code is executing on its own." |
| 2 | 5-12 | Tap n7 "Tree search". The sheet opens: summary, verification, buttons. | "Every node needs a proof before it counts as done." |
| 3 | 12-20 | Tap n16 "Demo: CSV parse". Scroll to *Tracks by score*: n19 7.3, n18 6.66, n17 3.15. | "Three agents tried three ideas in parallel. Same benchmark." |
| 4 | 20-28 | Terminal: `BASELINE_MS=334 node demo/bench.js` → `ms: 44.0 / SCORE: 7.38`. | "I ran the benchmark myself. 334 ms → 44 ms." |
| 5 | 28-36 | Header: progress 59 %, ETA, *Expected end*, cost line "$48 spent · est. $300 to finish · five_hour 2 %". | "Cost and ETA, before and during. Not after." |
| 6 | 36-44 | Tap n11, press **Validate**. Toast "Sent to Claude". | "I steer from my phone. Claude replies in the session." |
| 7 | 44-52 | Terminal: the plugin's hand-over line "[tree] Auto mode, turn 14/40. Work on n7…" | "After each turn, the plugin hands Claude the next node. No approval needed." |
| 8 | 52-60 | README install line. | "`/plugin install ambiflex --marketplace ImadeBenToumAI/ImadeBenToumAI`. Felix Rieseberg's method, as a panel." |

Recording tips: light theme, 1080×1920 for the phone cut, hide notifications, pause one second on each caption. Export a 1920×1080 version for X and HN (the tree is wider than tall on desktop).

## 2. Reply to Felix Rieseberg's tutorial on X (node n12, first)

Post as a reply to his tutorial thread, with the video attached.

> I took "How to be more ambitious" literally and turned it into a panel inside Claude Code.
>
> Altitude / Depth / Range as a live tree. "Done" needs a proof or it stays "needs review". Three agents explore three tracks in parallel, scored by one benchmark; the winner merged at 7.4×.
>
> One evening, $48 of API time, 31 tests. What it taught me about the plugin API is in the thread.
>
> github.com/ImadeBenToumAI/ImadeBenToumAI/tree/main/plugins/ambiflex

Thread, second post (the field notes, the part his team is most likely to read):

> Four things the function-hooks API did better than I expected, and five asks, with commits behind each:
> – `claude plugin validate` caught what TypeScript cannot
> – a cloud host queued the plugin's own prompts; I built a fallback
> – `cd` moves your plugin (use `$.session.root()`)
> – `$.agent.spawn` from a hook works, `prompt.submit` from a tool hook is refused, and the message says why
> Full notes: [link to article 4]

## 3. Show HN (node n12)

Post a Tuesday or Wednesday, 8-9 am US Eastern. Title under 80 characters, factual.

**Title:** Show HN: A reasoning-tree pane for Claude Code that keeps humans in control of agents

**URL:** the article 3 link (the tree-search run), or the repository.

**First comment (post it yourself within a minute):**

> Author here. Ambiflex is a Claude Code plugin that runs Felix Rieseberg's "be more ambitious" method (Altitude / Depth / Range) as a live tree you can steer, and that can execute a reviewed plan on its own.
>
> What I think is new:
> – A node cannot be "done" without naming the test or metric that proved it; otherwise it stays "needs review". Only the user validates.
> – Tree search: one subagent per competing track, in parallel, each in its own git worktree, scored by the same judge. On the demo in the repo, three ideas for a parser scored 3.15 / 6.66 / 7.3 as reported by the agents and 2.95 / 4.41 / 7.24 when I ran the benchmark myself; the winner merged at 7.4×.
> – Calibration from real timings: Claude finished nodes I had estimated at "2 days" in about ten minutes (factor 0.01). The ETA and the cost projection use that factor.
> – Cost comes from Claude Code's own ledger; the plugin alerts on a budget and on the 5-hour window and stops auto mode on the cap.
>
> It is built on Claude Code's function-hooks plugin API, which is early access; the notes on what worked and what did not are in the repo (docs/articles/04). Happy to answer anything about the API or the method.

## 4. Awesome lists (node n12)

PR title: `Add Ambiflex: ambitious reasoning tree plugin (auto mode, tree search, cost)`

Line to add:

> - [Ambiflex](https://github.com/ImadeBenToumAI/ImadeBenToumAI/tree/main/plugins/ambiflex) - Felix Rieseberg's Altitude / Depth / Range method as a live, steerable reasoning tree; runs a reviewed plan on its own, explores competing tracks with parallel subagents scored by a judge, reports ETA and cost.

Targets: `awesome-claude-code`, `awesome-claude-code-plugins` and any list with a "plugins" section. One PR each, same line.

## 5. Claude Code Discord and r/ClaudeAI (node n12)

One post, not two.

> I built a plugin that turns Felix Rieseberg's "How to be more ambitious" tutorial into a pane inside Claude Code: the plan as a tree, nodes that need a proof to count as done, parallel subagents scored by one benchmark, auto mode with ETA and cost.
>
> The part I would like feedback on: the auto mode hands Claude the next node after each turn without asking. It stops on interruption, on a turn budget, on a dollar budget, and when it needs a decision that is yours (publishing, spending, going public). Is that the right set of stops?
>
> Install: `/plugin install ambiflex --marketplace ImadeBenToumAI/ImadeBenToumAI`. 60-second video and the tree-search numbers in the README.

## 6. French post, LinkedIn or a francophone community (node n12)

> Felix Rieseberg (Anthropic) a publié un tutoriel sur l'ambition avec les modèles : Altitude, Profondeur, Étendue. Je l'ai pris au mot et j'en ai fait un panneau dans Claude Code.
>
> Un nœud n'est « terminé » que s'il nomme la preuve (test, métrique) ; sinon il reste « à valider ». Trois agents explorent trois pistes en parallèle, jugés par le même benchmark : le gagnant fusionné à 7,4×. Et un chiffre qui m'a surpris : Claude termine en dix minutes ce que j'avais estimé à deux jours. Facteur 0,01.
>
> Code, démo et notes sur l'API des plugins : github.com/ImadeBenToumAI/ImadeBenToumAI/tree/main/plugins/ambiflex

## 7. Launch-day order (node n15)

Same morning, in this order, nothing earlier:

1. Create `github.com/ImadeBenToumAI/ambiflex` (public, empty) and tell Claude: the prepared repository is pushed, marketplace switched, README links updated.
2. Publish article 1 on your site.
3. Reply to Felix with the video (section 2).
4. Show HN (section 3), first comment within a minute.
5. Awesome-list PRs (section 4).
6. Discord / Reddit (section 5), French post (section 6) in the afternoon.
7. Answer every comment within 24 h; record each piece of feedback as a node in the tree.

## 8. What to measure (node n14)

Weekly, in the tree as a node update: stars, marketplace installs if visible, issues opened by others, external PRs merged, mentions by anyone at Anthropic. Targets at 90 days: 500 / — / 20 / 10 / 1. At 45 days with nothing at half, change the content angle, not the features.
