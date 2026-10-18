# Ambiflex: an ambitious reasoning tree for Claude Code

Ambiflex turns Felix Rieseberg's **be-ambitious** method (Altitude, Depth, Range) into something you can **see and steer** while Claude Code works, and that can **run the plan on its own** once you have approved it.

- **Reasoning graph.** A root goal (the goal behind the goal), **Altitude / Depth / Range** tracks, and steps. Branches can converge (merge), like Git branches.
- **Live panel.** SVG graph (colour = track, dashed = proposed, ◆ = needs review, ✓ = validated, ⤵ = merged, red dot = agent running), progress in %, "you are here", **end-to-end ETA** on the critical path, and a calibration factor once nodes have real timings.
- **Steer by touch.** Tap a node, then **Validate, Deeper, Wider, Higher, Spawn agent, Abandon, Merge into…**. Each action reaches Claude as a `[tree] …` instruction.
- **Nothing is "done" without proof.** A node marked done without a `verification` (the test, command or metric that proved it) is kept at *needs review*. Only you can set *validated*.
- **Auto mode.** `/ambiflex auto` (or the *Run on auto* button) executes the plan without asking for approval: after each turn, the plugin hands Claude the next open node whose parents are settled, until nothing is left, the turn budget is spent, you interrupt, or `/ambiflex stop`. It announces the end-to-end ETA when it starts and writes a report (estimate vs. actual per node) when it finishes.
- **Subagents.** An agent spawned with `#n4` in its description is attached to node n4 and shown live.
- **Git branches tab.** Branches, commits and merges, refreshed after every git command.
- **History.** The tree lives in `.ambiflex/tree.json`, versioned with your code.
- **Mobile.** The mobile app places no panel, so `/ambiflex` draws the tree inline in the transcript. For a persistent, touch-first view, Claude can publish an "Ambiflex" claude.ai page that mirrors the tree live and sends your taps back as comments.

Claude fills the tree through the tools `tree_set_goal`, `tree_upsert`, `tree_merge`, `tree_get`, `tree_auto`.

## Commands

| Command | Effect |
|---|---|
| `/ambiflex` | Open the panel (or draw the tree inline on mobile) |
| `/ambiflex auto [turns]` | Run the plan without approval; optional turn budget (default 40) |
| `/ambiflex stop` | Stop auto mode |
| `/ambiflex status` | Text report: progress, ETA, calibration, nodes |

## Install

In a Claude Code terminal session:

```
/plugin install ambiflex --marketplace ImadeBenToumAI/ImadeBenToumAI
```

From a shell:

```
claude plugin install ambiflex --marketplace ImadeBenToumAI/ImadeBenToumAI
```

In the desktop app: **+** next to the prompt box → **Plugins** → **Add marketplace** `ImadeBenToumAI/ImadeBenToumAI` → **Add plugin** `ambiflex`.

In this repository, `.claude/settings.json` enables the plugin for every session (cloud or local) opened on the repository.

> Status: Claude Code's "function hooks" plugin API is in early access and may change between releases.

## Safety notes

- The system prompt carries only the method. The tree's content reaches the model through `tree_get`, as data, with long fields clipped. A repository cannot inject instructions through `tree.json`.
- Auto mode submits prompts in your session under **your** permission mode. Set the permission mode you are comfortable with before starting it.
- Auto mode stops on any interrupted or errored turn.

## Develop

```
claude plugin validate plugins/ambiflex
cd plugins/ambiflex && claude plugin test .
```
