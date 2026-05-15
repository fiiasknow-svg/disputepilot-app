$ErrorActionPreference = "Stop"

$ManagerRoot = "C:\Users\LESLI\disputepilot-app"
$ScriptPath = Join-Path $ManagerRoot "scripts\run-agent.ps1"
$LogDir = Join-Path $ManagerRoot "agents\logs"
$PromptDir = Join-Path $ManagerRoot "agents\prompts"
$ReportDir = Join-Path $ManagerRoot "agents\reports"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$agents = @(
  @{
    Number = 1
    Worktree = "C:\Users\LESLI\disputepilot-agent-1-nav"
    Prompt = Join-Path $PromptDir "agent-1-nav-dashboard.txt"
    Report = "agents\reports\agent-1-report.md"
  },
  @{
    Number = 2
    Worktree = "C:\Users\LESLI\disputepilot-agent-2-clients"
    Prompt = Join-Path $PromptDir "agent-2-clients-profile.txt"
    Report = "agents\reports\agent-2-report.md"
  },
  @{
    Number = 3
    Worktree = "C:\Users\LESLI\disputepilot-agent-3-disputes"
    Prompt = Join-Path $PromptDir "agent-3-disputes-letters.txt"
    Report = "agents\reports\agent-3-report.md"
  },
  @{
    Number = 4
    Worktree = "C:\Users\LESLI\disputepilot-agent-4-billing"
    Prompt = Join-Path $PromptDir "agent-4-billing-leads.txt"
    Report = "agents\reports\agent-4-report.md"
  },
  @{
    Number = 5
    Worktree = "C:\Users\LESLI\disputepilot-agent-5-more"
    Prompt = Join-Path $PromptDir "agent-5-calendar-settings.txt"
    Report = "agents\reports\agent-5-report.md"
  }
)

foreach ($agent in $agents) {
  if (-not (Test-Path -LiteralPath $agent.Worktree)) {
    throw "Missing worktree for agent $($agent.Number): $($agent.Worktree)"
  }

  if (-not (Test-Path -LiteralPath $agent.Prompt)) {
    throw "Missing prompt for agent $($agent.Number): $($agent.Prompt)"
  }
}

foreach ($agent in $agents) {
  $logPath = Join-Path $LogDir "agent-$($agent.Number).log"
  $exitPath = Join-Path $LogDir "agent-$($agent.Number).exitcode"
  $reportPath = Join-Path $agent.Worktree $agent.Report

  Write-Host "Launching agent $($agent.Number)"
  Write-Host "  Worktree: $($agent.Worktree)"
  Write-Host "  Log: $logPath"
  Write-Host "  Exit code: $exitPath"
  Write-Host "  Report: $reportPath"

  Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    $ScriptPath,
    "-AgentNumber",
    $agent.Number,
    "-WorktreePath",
    $agent.Worktree,
    "-PromptPath",
    $agent.Prompt
  ) -WorkingDirectory $ManagerRoot -WindowStyle Hidden
}

Write-Host "All agents launched in separate PowerShell processes. No merge or push was performed."
