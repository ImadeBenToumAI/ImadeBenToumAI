# Task: re-run the source scan on hashgraph-online/awesome-ai-plugins PR #899

PR #899 (from `ImadeBenToumAI`, branch `add-ambiflex`) adds one line for Ambiflex. Its source scan scored 57/100 on `ImadeBenToumAI/ambiflex` commit `fce70ee` (minimum 80). The findings were fixed in the source repository at commit `d1ba856` on `main`:

- `demo/parse.js` no longer uses `new Function` (DANGEROUS_DYNAMIC_EXECUTION)
- `.github/workflows/traffic.yml` pins `actions/checkout` to a commit SHA (GITHUB_ACTION_UNPINNED)
- `.github/dependabot.yml` added (DEPENDABOT_MISSING)
- `SECURITY.md` added (SECURITY_MD_MISSING)
- the 58 MB film removed from the tree (SCAN_RESOURCE_BUDGET_EXCEEDED)

Nothing in the catalog line needs to change. The scan only has to run again on the source repository's current `main`.

## Steps

1. Confirm the source repository is at the fixed commit: `git ls-remote https://github.com/ImadeBenToumAI/ambiflex refs/heads/main` must print `d1ba856…` or a later commit.
2. Open https://github.com/hashgraph-online/awesome-ai-plugins/pull/899/checks and find the failed scan workflow run.
3. Re-run it, in this order of preference:
   1. **Re-run failed jobs** (or **Re-run all jobs**) on that run, if the button is available to the PR author.
   2. Otherwise, re-run through the API: `gh run rerun <run-id> --repo hashgraph-online/awesome-ai-plugins --failed`.
   3. Otherwise, trigger a new run by pushing an empty commit to the PR branch:
      ```
      git -C <fork clone> checkout add-ambiflex
      git -C <fork clone> commit --allow-empty -m "Re-run source scan after fixes in ImadeBenToumAI/ambiflex@d1ba856"
      git -C <fork clone> push origin add-ambiflex
      ```
      The README line stays exactly as it is.
4. Wait for the scan to finish. Read the scan report in the job summary or its artifact.
5. Check which source commit it scanned. It must be `d1ba856` or later. If it still scanned `fce70ee`, the scanner caches by commit: say so in step 7, do not retry in a loop.
6. If the score is 80 or more and all checks are green: post one comment on the PR:
   ```
   Source findings fixed in ImadeBenToumAI/ambiflex@d1ba856 (no dynamic code execution, pinned action, dependabot, SECURITY.md, large media removed). Re-scan passes. Thanks for reviewing.
   ```
7. Report back: the new score, the scanned commit, the full findings table if any rule still fails, and the PR's check status. Do not change anything in `ImadeBenToumAI/ambiflex` yourself.

## Do not

- Do not edit the catalog line or any other file in the catalog.
- Do not close and reopen the PR.
- Do not rewrite history on `ImadeBenToumAI/ambiflex` (the old film still sits in its history; that decision belongs to the owner).
