<#
.SYNOPSIS
    Sobe o Postgres (se necessário), builda e roda o backend localmente,
    carregando as variáveis de ambiente do ".env" na raiz do projeto.

.PARAMETER SkipBuild
    Pula o "mvnw package" e roda direto o jar que já existe em target/.

.PARAMETER SkipPostgres
    Não tenta subir o container do Postgres via docker compose.

.EXAMPLE
    .\run.ps1
    .\run.ps1 -SkipBuild
#>
param(
    [switch]$SkipBuild,
    [switch]$SkipPostgres
)

$backendDir = $PSScriptRoot
$rootDir = Split-Path $backendDir -Parent
$envFile = Join-Path $rootDir ".env"

if (-not (Test-Path $envFile)) {
    Write-Error "Arquivo .env não encontrado em '$rootDir'. Copie .env.example para .env e ajuste os valores antes de continuar."
    exit 1
}

# 1. Carrega as variáveis do .env na sessão atual do processo.
Write-Host "Carregando variáveis de $envFile..." -ForegroundColor Cyan
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    $parts = $line -split "=", 2
    if ($parts.Length -eq 2) {
        [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
}

# 2. Sobe o Postgres via docker compose, a menos que -SkipPostgres seja passado.
#    Native commands podem escrever no stderr mesmo em caso de sucesso, então
#    checamos $LASTEXITCODE em vez de depender de try/catch aqui.
if (-not $SkipPostgres) {
    Write-Host "Subindo o Postgres (docker compose up -d postgres)..." -ForegroundColor Cyan
    Push-Location $rootDir
    docker compose up -d postgres 2>&1 | Write-Host
    $dockerExit = $LASTEXITCODE
    Pop-Location
    if ($dockerExit -ne 0) {
        Write-Warning "Não foi possível subir o Postgres via Docker (exit $dockerExit). Verifique se o Docker Desktop está aberto."
    }
}

# 3. Builda o jar, a menos que -SkipBuild seja passado.
Push-Location $backendDir

if (-not $SkipBuild) {
    Write-Host "Compilando o backend (mvnw package -DskipTests)..." -ForegroundColor Cyan
    & "$backendDir\mvnw.cmd" -q package -DskipTests
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Error "Build falhou (mvnw exit code $LASTEXITCODE)."
        exit $LASTEXITCODE
    }
}

$jar = Get-ChildItem "$backendDir\target\concessionaria-api.jar" -ErrorAction SilentlyContinue
if (-not $jar) {
    Pop-Location
    Write-Error "Jar não encontrado em target/. Rode sem -SkipBuild na primeira vez."
    exit 1
}

# 4. Roda o jar diretamente (evita o bug do spring-boot:run com caminhos
#    com acento no Windows).
Write-Host "Iniciando o backend..." -ForegroundColor Green
java -jar "$backendDir\target\concessionaria-api.jar"
Pop-Location
