# PrintBox - 3 DISTINCT PALETTE variations per product (24 total, all minimalist)
# v1=Onyx&Gold | v2=Ivory&Charcoal | v3=Kraft&Forest
# Naming: PB-XXX_v1.png (luxury), PB-XXX_v2.png (editorial), PB-XXX_v3.png (artisan/eco)
param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [string]$OutputDir = "c:\Users\User\Desktop\PrintBox\renders",
    [string]$Model = "gemini-3-pro-image-preview",
    [string]$ScriptDir = "c:\Users\User\Desktop\PrintBox\scripts"
)

$ErrorActionPreference = "Continue"
$gen = Join-Path $ScriptDir "Generate-Images.ps1"
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null }

# Shared minimalist style suffix
$style = "soft diffuse even studio lighting from above, very gentle natural contact shadow, generous negative space around the product, restrained editorial product photography in the style of Aesop, Le Labo or Muji catalogs, sharp focus, 8k resolution, highly detailed, true minimalism, no decorative elements, no patterns, no extra graphics, single small clean wordmark only (no monograms, no geometric accents, no decorative lines)."

# Three distinct minimalist palettes
$palettes = @{
    "v1" = @{
        name = "Onyx & Gold"
        body = "in deep matte black soft-touch finish"
        mark = "a single small polished gold foil wordmark 'PRINTBOX' in a thin clean sans-serif typeface"
        bg   = "isolated on a warm light cream seamless paper background"
    }
    "v2" = @{
        name = "Ivory & Charcoal"
        body = "in soft ivory off-white uncoated matte finish"
        mark = "a single small matte charcoal black ink-printed wordmark 'PRINTBOX' in a thin clean sans-serif typeface"
        bg   = "isolated on a very light dove grey seamless paper background"
    }
    "v3" = @{
        name = "Kraft & Forest"
        body = "in natural unbleached kraft brown uncoated paper with subtle natural fiber texture"
        mark = "a single small deep forest green ink-printed wordmark 'PRINTBOX' in a thin clean sans-serif typeface"
        bg   = "isolated on a warm sand-beige seamless paper background"
    }
}

# Per-product description (material, format) + per-product angle override if needed
$products = @{
    "PB-001" = @{ desc="a hinged paperboard burger clamshell box BODY closed position"; angle="slight three-quarter front hero angle, eye-level camera" }
    "PB-002" = @{ desc="a corrugated B-flute burger box BODY with hinged top closed, subtle natural corrugation visible along side edges"; angle="slight three-quarter front hero angle, eye-level camera" }
    "PB-003" = @{ desc="a 16 oz single-wall paper cold drink cup BODY, fitted with a clear PET dome lid on top, a slim matching color paper straw inserted through the dome"; angle="slight three-quarter front angle, eye-level camera" }
    "PB-004" = @{ desc="a large SOS paper carrier bag BODY with flat matching color paper handles (NOT metal, NOT rope, NOT cord), standing upright with crisp side gussets and a flat bottom"; angle="three-quarter front hero angle, eye-level camera" }
    "PB-005" = @{ desc="a two-piece square paperboard meal box BODY with separate telescoping lid placed on top of the base"; angle="elevated 45-degree three-quarter angle showing both lid and base depth" }
    "PB-006" = @{ desc="a paper fries scoop snack cup BODY with tapered open top and flat bottom"; angle="slight three-quarter front angle showing the open scoop top, eye-level camera" }
    "PB-007" = @{ desc="a quarter-folded 2-ply paper napkin BODY"; angle="top-down flat lay, perfectly centered, very subtle 3-degree perspective" }
    "PB-008" = @{ desc="a stack of three premium business cards BODY in soft-touch finish, stack slightly offset to reveal edge thickness"; angle="elevated three-quarter angle showing card thickness, eye-level camera" }
}

$tasks = @()
foreach ($sku in $products.Keys | Sort-Object) {
    foreach ($v in @("v1","v2","v3")) {
        $p = $palettes[$v]
        $prod = $products[$sku]
        # Substitute palette material into product description
        $body = $prod.desc -replace "BODY", $p.body
        $prompt = "Minimalist product photography of $body, $($p.mark) printed once centered on the most prominent face, $($p.bg), $($prod.angle), $style"
        $tasks += @{ id=$sku; variant=$v; palette=$p.name; prompt=$prompt }
    }
}

$results = @()
$index = 0
$total = $tasks.Count
foreach ($task in $tasks) {
    $index++
    $filename = "{0}_{1}.png" -f $task.id, $task.variant
    $output = Join-Path $OutputDir $filename
    Write-Host "[$index/$total] $filename ($($task.palette)) ..." -ForegroundColor Cyan
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $res = & $gen -ApiKey $ApiKey -Prompt $task.prompt -OutputPath $output -Model $Model 2>&1
        $sw.Stop()
        if (Test-Path $output) {
            $size = (Get-Item $output).Length
            Write-Host "  OK ($([math]::Round($size/1024,1)) KB, $([math]::Round($sw.Elapsed.TotalSeconds,1))s)" -ForegroundColor Green
            $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; palette=$task.palette; file=$filename; status="OK"; size_kb=[math]::Round($size/1024,1); seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
        } else {
            Write-Host "  FAILED: $res" -ForegroundColor Red
            $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; palette=$task.palette; file=$filename; status="FAILED"; size_kb=0; seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
        }
    } catch {
        $sw.Stop()
        Write-Host "  EXCEPTION: $($_.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; palette=$task.palette; file=$filename; status="EXCEPTION"; size_kb=0; seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
    }
}

Write-Host "`n=== PALETTE VARIATIONS SUMMARY ===" -ForegroundColor Yellow
$results | Format-Table -AutoSize
$ok = ($results | Where-Object { $_.status -eq "OK" }).Count
Write-Host "Completed: $ok / $total" -ForegroundColor $(if ($ok -eq $total) { "Green" } else { "Yellow" })
