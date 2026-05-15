# Phase 5 Orchestrator Usage

This repo uses the manager worktree at `C:\Users\LESLI\disputepilot-app` as the integration point. Worker agents run in separate git worktrees and branches so they do not edit the same folder.

Agents must not auto-merge to `main`. Agents must not push unless that is explicitly enabled later.

## Worktrees

Create the five worker worktrees from the manager root:

```powershell
cd C:\Users\LESLI\disputepilot-app
.\scripts\create-agent-worktrees.ps1
```

The script refuses to run if the manager root worktree is dirty. It also refuses to overwrite existing worktree paths or existing agent branches.

Created worktrees and branches:

| Agent | Worktree | Branch |
| --- | --- | --- |
| 1 | `C:\Users\LESLI\disputepilot-agent-1-nav` | `agent-1-nav-dashboard` |
| 2 | `C:\Users\LESLI\disputepilot-agent-2-clients` | `agent-2-clients-profile` |
| 3 | `C:\Users\LESLI\disputepilot-agent-3-disputes` | `agent-3-disputes-letters` |
| 4 | `C:\Users\LESLI\disputepilot-agent-4-billing` | `agent-4-billing-leads` |
| 5 | `C:\Users\LESLI\disputepilot-agent-5-more` | `agent-5-calendar-settings` |

## Run One Agent

Example for Agent 1:

```powershell
cd C:\Users\LESLI\disputepilot-app
.\scripts\run-agent.ps1 -AgentNumber 1 -WorktreePath C:\Users\LESLI\disputepilot-agent-1-nav -PromptPath .\agents\prompts\agent-1-nav-dashboard.txt
```

The script changes into the worker worktree, runs `codex exec` with the prompt file content, writes the log to `agents\logs\agent-1.log` in the manager root, and writes the exit code to `agents\logs\agent-1.exitcode`.

## Run All Agents

```powershell
cd C:\Users\LESLI\disputepilot-app
.\scripts\run-all-agents.ps1
```

This starts five separate hidden PowerShell processes. It does not merge or push. Logs are written under `agents\logs` in the manager root. Reports are written by each agent inside its own worktree under `agents\reports\agent-X-report.md`.

## Inspect Results

Check logs and exit codes from the manager root:

```powershell
Get-Content .\agents\logs\agent-1.log
Get-Content .\agents\logs\agent-1.exitcode
```

Check each worker report:

```powershell
Get-Content C:\Users\LESLI\disputepilot-agent-1-nav\agents\reports\agent-1-report.md
```

Inspect each branch before integration:

```powershell
git -C C:\Users\LESLI\disputepilot-agent-1-nav status --short
git -C C:\Users\LESLI\disputepilot-agent-1-nav diff
```

## Manager Integration

The manager should merge one branch at a time after reviewing that agent's report, logs, tests, build result, and diff.

Recommended flow from the manager root:

```powershell
cd C:\Users\LESLI\disputepilot-app
git status --short
git fetch --all --prune
git merge --no-ff agent-1-nav-dashboard
npm run build
npx playwright test --project=chromium --config=playwright.config.ts
```

Repeat for only one agent branch at a time. Resolve conflicts in the manager root, rerun verification, then continue to the next branch.

## Recovery

If an agent makes bad changes, do not merge that branch. Inspect the worktree and either ask the agent to repair it or remove the worktree and branch after confirming nothing needs to be saved.

Remove a failed worktree and branch:

```powershell
cd C:\Users\LESLI\disputepilot-app
git worktree remove C:\Users\LESLI\disputepilot-agent-1-nav
git branch -D agent-1-nav-dashboard
```

If the bad branch was already merged into the manager root, use a normal reviewed revert commit rather than rewriting shared history.

## Verification Commands

```powershell
git status --short
git worktree list
powershell -NoProfile -Command "$errors = $null; [System.Management.Automation.PSParser]::Tokenize((Get-Content -Raw .\scripts\create-agent-worktrees.ps1), [ref]$errors) > $null; if ($errors) { $errors; exit 1 }"
powershell -NoProfile -Command "$errors = $null; [System.Management.Automation.PSParser]::Tokenize((Get-Content -Raw .\scripts\run-agent.ps1), [ref]$errors) > $null; if ($errors) { $errors; exit 1 }"
powershell -NoProfile -Command "$errors = $null; [System.Management.Automation.PSParser]::Tokenize((Get-Content -Raw .\scripts\run-all-agents.ps1), [ref]$errors) > $null; if ($errors) { $errors; exit 1 }"
npm run build
```
