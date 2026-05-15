param(
  [string]$MainBranch = "main"
)

$ErrorActionPreference = "Stop"

$RepoRoot = "C:\Users\LESLI\disputepilot-app"

if ((Resolve-Path -LiteralPath (Get-Location)).Path -ne $RepoRoot) {
  throw "Run this script from $RepoRoot."
}

$gitRoot = (git rev-parse --show-toplevel).Trim()
if ($gitRoot -ne $RepoRoot) {
  throw "Git root is $gitRoot, expected $RepoRoot."
}

$status = git status --porcelain
if ($status) {
  throw "Root worktree is dirty. Commit, stash, or discard changes before creating agent worktrees."
}

$worktrees = @(
  @{
    Number = 1
    Path = "C:\Users\LESLI\disputepilot-agent-1-nav"
    Branch = "agent-1-nav-dashboard"
  },
  @{
    Number = 2
    Path = "C:\Users\LESLI\disputepilot-agent-2-clients"
    Branch = "agent-2-clients-profile"
  },
  @{
    Number = 3
    Path = "C:\Users\LESLI\disputepilot-agent-3-disputes"
    Branch = "agent-3-disputes-letters"
  },
  @{
    Number = 4
    Path = "C:\Users\LESLI\disputepilot-agent-4-billing"
    Branch = "agent-4-billing-leads"
  },
  @{
    Number = 5
    Path = "C:\Users\LESLI\disputepilot-agent-5-more"
    Branch = "agent-5-calendar-settings"
  }
)

$existingWorktreeList = git worktree list --porcelain

foreach ($worktree in $worktrees) {
  if (Test-Path -LiteralPath $worktree.Path) {
    throw "Refusing to overwrite existing path: $($worktree.Path)"
  }

  if ($existingWorktreeList -match [regex]::Escape($worktree.Path)) {
    throw "Worktree is already registered: $($worktree.Path)"
  }

  $branchExists = git show-ref --verify --quiet "refs/heads/$($worktree.Branch)"
  if ($LASTEXITCODE -eq 0) {
    throw "Branch already exists: $($worktree.Branch)"
  }
}

foreach ($worktree in $worktrees) {
  Write-Host "Creating agent $($worktree.Number): $($worktree.Path) on branch $($worktree.Branch)"
  git worktree add -b $worktree.Branch $worktree.Path $MainBranch
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to create worktree for agent $($worktree.Number)."
  }
}

Write-Host "Created all agent worktrees. No merge or push was performed."
