# Klantanalyse-batch (skill klantanalyse-run).
#   Zonder -Start: alleen de selectie verversen en tellen. EUR 0, schrijft alleen lijsten in -Map.
#   Met -Start:    selectie verversen en daarna de runners losgekoppeld starten (WMI). KOST TOKENS: alleen met een go van Javi.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File skills\klantanalyse-run\scripts\klantanalyse-batch.ps1 -Van 2026-10-12 -Tot 2026-10-18 -Map C:\tmp\wecall-klantanalyse-1910 [-Start]
#
# Valt een runner om NA het insturen: de batch is betaald, niet opnieuw starten maar oogsten met
#   npx tsx --tsconfig scripts/tsconfig.json scripts/_oogst-klantanalyse-batch.ts --batch <id> --stroom sales|gi --run
param(
  [Parameter(Mandatory = $true)][string]$Van,
  [Parameter(Mandatory = $true)][string]$Tot,
  [Parameter(Mandatory = $true)][string]$Map,
  [switch]$Start
)
if ($Van -notmatch '^\d{4}-\d{2}-\d{2}$' -or $Tot -notmatch '^\d{4}-\d{2}-\d{2}$') { "STOP: -Van en -Tot moeten YYYY-MM-DD zijn."; exit 1 }

$app = "C:\Users\javim\Desktop\Executive_assistant\projects\ventasol\ventasol\data-project\wecall-app"
$skill = "C:\Users\javim\Desktop\Executive_assistant\skills\klantanalyse-run\scripts"
$mapFwd = $Map -replace '\\', '/'
New-Item -ItemType Directory -Force $Map | Out-Null
Copy-Item "$skill\_klantanalyse-selectie.ts", "$skill\_q-klantanalyse-nameting.ts" "$app\scripts\" -Force
Set-Location $app

# 1. Geen interesse: de picker (alle LEV-bakken, afboeking geen interesse, > 7 min, met transcript, zonder dossier).
npx tsx --tsconfig scripts/tsconfig.json scripts/pick-geen-interesse-batch.ts --van $Van --tot $Tot | Select-Object -Last 16
if ($LASTEXITCODE -ne 0) { "STOP: picker mislukt, niets gestart."; exit 1 }
Copy-Item C:/tmp/wecall-transcribe/_geen-interesse-batch.txt "$Map/gi-paren-ruw.txt" -Force

# 2. Selectie: sales + geen interesse, met exact de overslaan-toetsen van beide runners.
npx tsx --tsconfig scripts/tsconfig.json scripts/_klantanalyse-selectie.ts --van $Van --tot $Tot --map $mapFwd | Select-Object -Last 40
if ($LASTEXITCODE -ne 0) { "STOP: selectie mislukt, niets gestart."; exit 1 }

$sales = @(((Get-Content "$Map/sales-records.txt" -Raw -ErrorAction SilentlyContinue) -split '\s+') | Where-Object { $_ })
$gi = @(((Get-Content "$Map/gi-paren.txt" -Raw -ErrorAction SilentlyContinue) -split '\s+') | Where-Object { $_ })

# Sales gaan als argumenten mee; cmd.exe kapt af bij 8191 tekens. Meer dan 700 records: in delen (elk een eigen batch-job).
$stuk = 700
$delen = @()
for ($i = 0; $i -lt $sales.Count; $i += $stuk) {
  $eind = [Math]::Min($i + $stuk, $sales.Count) - 1
  $delen += , @($sales[$i..$eind])
}
"Sales: $($sales.Count) in $($delen.Count) batch-job(s) | geen interesse: $($gi.Count) in 1 batch-job"
if (-not $Start) { "Alleen selectie (zonder -Start). Niets gestart, EUR 0."; exit 0 }

$n = 0
foreach ($deel in $delen) {
  $n++
  $log = if ($delen.Count -gt 1) { "$Map\sales-$n.log" } else { "$Map\sales.log" }
  $cmd = "cmd.exe /c npx tsx --tsconfig scripts/tsconfig.json scripts/klant-dossier-runner.ts $($deel -join ' ') --run --batch > `"$log`" 2>&1"
  if ($cmd.Length -gt 8000) { "STOP: opdrachtregel sales deel $n te lang ($($cmd.Length) tekens). Niets meer gestart."; exit 1 }
  $r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmd; CurrentDirectory = $app }
  "Gestart: sales deel $n ($($deel.Count) records) PID $($r.ProcessId) (rc $($r.ReturnValue)) -> $log"
}
if ($gi.Count -gt 0) {
  $cmdGi = "cmd.exe /c npx tsx --tsconfig scripts/tsconfig.json scripts/analyse-recycling-leads-run.ts --bestand $mapFwd/gi-paren.txt --herkomst lev-geen-interesse --run --batch > `"$Map\gi.log`" 2>&1"
  $r = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmdGi; CurrentDirectory = $app }
  "Gestart: geen interesse ($($gi.Count) paren) PID $($r.ProcessId) (rc $($r.ReturnValue)) -> $Map\gi.log"
}
