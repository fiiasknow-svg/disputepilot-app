param(
  [Parameter(Mandatory = $true)]
  [ValidateRange(1, 5)]
  [int]$AgentNumber,

  [Parameter(Mandatory = $true)]
  [string]$WorktreePath,

  [Parameter(Mandatory = $true)]
  [string]$PromptPath
)

$ErrorActionPreference = "Stop"

$ManagerRoot = "C:\Users\LESLI\disputepilot-app"
$NestedForbidden = "C:\Users\LESLI\disputepilot-app\disputepilot-app"

$resolvedWorktree = (Resolve-Path -LiteralPath $WorktreePath).Path
$resolvedPrompt = (Resolve-Path -LiteralPath $PromptPath).Path

if ($resolvedWorktree -eq $ManagerRoot) {
  throw "Refusing to run an agent in the manager root worktree."
}

if ($resolvedWorktree -eq $NestedForbidden -or $resolvedWorktree.StartsWith("$NestedForbidden\")) {
  throw "Refusing to run inside forbidden nested folder: $NestedForbidden"
}

$logDir = Join-Path $ManagerRoot "agents\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$logPath = Join-Path $logDir "agent-$AgentNumber.log"
$exitPath = Join-Path $logDir "agent-$AgentNumber.exitcode"
$promptContent = Get-Content -LiteralPath $resolvedPrompt -Raw

Set-Location -LiteralPath $resolvedWorktree

"Starting Agent $AgentNumber at $(Get-Date -Format o)" | Set-Content -LiteralPath $logPath
"Worktree: $resolvedWorktree" | Add-Content -LiteralPath $logPath
"Prompt: $resolvedPrompt" | Add-Content -LiteralPath $logPath
"Command: codex exec <prompt file content>" | Add-Content -LiteralPath $logPath
"" | Add-Content -LiteralPath $logPath

try {
  & codex exec $promptContent *>> $logPath
  $exitCode = $LASTEXITCODE
} catch {
  $_ | Out-String | Add-Content -LiteralPath $logPath
  $exitCode = 1
}

$exitCode | Set-Content -LiteralPath $exitPath
"Exit code: $exitCode" | Add-Content -LiteralPath $logPath

exit $exitCode
