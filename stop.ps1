$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ComposeFile = Join-Path $RepoRoot "deployment\self-hosted\docker-compose.yml"
$EnvFile = Join-Path $RepoRoot ".env"

if (-not (Test-Path $EnvFile)) {
  $EnvFile = Join-Path $RepoRoot ".env.example"
}

docker compose --env-file $EnvFile -f $ComposeFile down
