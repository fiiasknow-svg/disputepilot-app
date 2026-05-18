# Phase 5 Orchestrator Usage

This repo uses the manager worktree at `C:\Users\LESLI\disputepilot-app` as the integration point. Worker agents run in separate git worktrees and branches so they do not edit the same folder.

Agents must not auto-merge to `main`. Agents must not push unless that is explicitly enabled later.

## Worktrees

The five worker worktrees already exist and should be used by default:

| Agent | Worktree | Branch |
| --- | --- | --- |
| 1 | `C:\Users\LESLI\disputepilot-agent-letters` | `agent/letters` |
| 2 | `C:\Users\LESLI\disputepilot-agent-clients` | `agent/clients` |
| 3 | `C:\Users\LESLI\disputepilot-agent-disputes` | `agent/disputes` |
| 4 | `C:\Users\LESLI\disputepilot-agent-billing` | `agent/billing` |
| 5 | `C:\Users\LESLI\disputepilot-agent-company` | `agent/company` |

Do not run `create-agent-worktrees.ps1` for the normal Phase 5 flow. Use it only when intentionally creating a new, separate set of worktrees.

```powershell
cd C:\Users\LESLI\disputepilot-app
.\scripts\create-agent-worktrees.ps1
```

The creation script refuses to run if the manager root worktree is dirty. It also refuses to overwrite existing worktree paths or existing agent branches.

## Run One Agent

Example for Agent 1:

```powershell
cd C:\Users\LESLI\disputepilot-app
.\scripts\run-agent.ps1 -AgentNumber 1 -WorktreePath C:\Users\LESLI\disputepilot-agent-letters -PromptPath .\agents\prompts\agent-1-nav-dashboard.txt
```

The script generates a per-agent wrapper in `agents\logs\run-agent-X-wrapper.ps1`, then runs that wrapper with `powershell.exe -ExecutionPolicy Bypass -File`. The wrapper uses this command shape because the direct `codex.cmd` pipe works from PowerShell while inline script piping failed:

```powershell
Get-Content "<resolved prompt path>" -Raw | codex.cmd exec -C "<resolved worktree path>" -
```

Output is written to `agents\logs\agent-X.log` in the manager root, and the exit code is written to `agents\logs\agent-X.exitcode`.

## Run All Agents

```powershell
cd C:\Users\LESLI\disputepilot-app
.\scripts\run-all-agents.ps1
```

This starts five separate PowerShell processes. It does not merge or push. Logs are written under `agents\logs` in the manager root. Reports are written by each agent inside its own worktree under `agents\reports\agent-X-report.md`.

## Inspect Results

Check logs and exit codes from the manager root:

```powershell
Get-Content .\agents\logs\agent-1.log
Get-Content .\agents\logs\agent-1.exitcode
```

An exit code of `0` means the agent command succeeded. An exit code of `1` means it failed; inspect the matching `agent-X.log` file first.

Check each worker report:

```powershell
Get-Content C:\Users\LESLI\disputepilot-agent-letters\agents\reports\agent-1-report.md
```

Inspect each branch before integration:

```powershell
git -C C:\Users\LESLI\disputepilot-agent-letters status --short
git -C C:\Users\LESLI\disputepilot-agent-letters diff
```

## Manager Integration

The manager should merge one branch at a time after reviewing that agent's report, logs, tests, build result, and diff.

Recommended flow from the manager root:

```powershell
cd C:\Users\LESLI\disputepilot-app
git status --short
git fetch --all --prune
git merge --no-ff agent/letters
npm run build
npx playwright test --project=chromium --config=playwright.config.ts
```

Repeat for only one agent branch at a time. Resolve conflicts in the manager root, rerun verification, then continue to the next branch.

## Recovery

If an agent makes bad changes, do not merge that branch. Inspect the worktree and either ask the agent to repair it or remove the worktree and branch after confirming nothing needs to be saved.

Remove a failed worktree and branch:

```powershell
cd C:\Users\LESLI\disputepilot-app
git worktree remove C:\Users\LESLI\disputepilot-agent-letters
git branch -D agent/letters
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
