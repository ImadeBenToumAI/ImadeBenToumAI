# Task: add Ambiflex to hashgraph-online/awesome-ai-plugins

Open one pull request, from the GitHub account **ImadeBenToumAI**, that adds a single line to the catalog. The maintainers asked for author-owned PRs. Change nothing else.

## Context

- Target repository: https://github.com/hashgraph-online/awesome-ai-plugins
- Contribution guide: https://github.com/hashgraph-online/awesome-ai-plugins/blob/main/CONTRIBUTING.md
- Entry format: `- [Name](https://github.com/owner/repo) - One-sentence description`, alphabetical within its section.
- Section: `README.md` → **Community Plugins** → **Development & Workflow** (Claude Code plugins live there; there is no Claude Code-specific section).
- A fork `ImadeBenToumAI/awesome-ai-plugins` may already exist from an earlier attempt. Reuse it if so.

## Steps

1. Fork `hashgraph-online/awesome-ai-plugins` into `ImadeBenToumAI` (or reuse the existing fork), and sync it with upstream `main`.
2. Create a branch `add-ambiflex` from the up-to-date `main`.
3. In `README.md`, find the `Development & Workflow` section. Insert the line below **between** the line starting `- [Alloy](` and the line starting `- [Anchor](`, as its own line:

   ```
   - [Ambiflex](https://github.com/ImadeBenToumAI/ambiflex) - Claude Code plugin that runs the plan as a live, steerable reasoning tree: a task is "done" only with a named proof, parallel subagents compete on one benchmark, and auto mode runs the plan with ETA and cost (`/plugin install ambiflex --marketplace ImadeBenToumAI/ambiflex`).
   ```

4. Check the diff: exactly one added line, no other change (no reformatting, no trailing-whitespace edits, file still ends with a newline). If the repository has a validation script (look in `scripts/`, `tests/`, or the `.github/workflows/` files), run it locally and make it pass.
5. Commit with the message: `Add Ambiflex to Development & Workflow`
6. Push the branch to the fork and open a pull request against `hashgraph-online/awesome-ai-plugins:main`.
   - Title: `Add Ambiflex (Claude Code plugin)`
   - Body:

   ```
   Adds Ambiflex to Community Plugins → Development & Workflow.

   Repository: https://github.com/ImadeBenToumAI/ambiflex
   What it is: a Claude Code plugin (Apache-2.0) that keeps the plan as a live reasoning tree, requires a proof before a task counts as done, explores competing tracks with parallel subagents scored by one benchmark, and runs the plan in auto mode with ETA and cost.
   Verified: installs from a fresh environment with `/plugin install ambiflex --marketplace ImadeBenToumAI/ambiflex`; `claude plugin validate` passes and 34 tests pass; ~40 unique installs on launch day.
   ```

7. Wait for the repository's validation workflow on the PR. If it fails, read its log, fix only what it reports in this one line or its placement, and push to the same branch. Do not touch other entries.
8. Report back the PR URL and the status of its checks.

## Do not

- Do not edit any file other than `README.md`.
- Do not reorder, reformat or "fix" other entries.
- Do not add `plugins.json` or registry entries unless the validation workflow explicitly requires it; if it does, report what it asks for before changing anything.
