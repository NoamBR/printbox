# PrintBox - 3 BRANDED VARIATIONS per product (24 total)
# v1 = RUBY & BUN (bold modern burger) - red/cream/black, spot UV, chunky typography
# v2 = OLIVE GROVE (wellness/eco) - sage/ivory/terracotta, gold foil + botanical illustration
# v3 = TOKYO LANE (modern asian fusion) - navy/tangerine/white, screen-print, sun mark
param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [string]$OutputDir = "c:\Users\User\Desktop\PrintBox\renders",
    [string]$Model = "gemini-3-pro-image-preview",
    [string]$ScriptDir = "c:\Users\User\Desktop\PrintBox\scripts"
)

$ErrorActionPreference = "Continue"
$gen = Join-Path $ScriptDir "Generate-Images.ps1"
if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null }

# Shared clean-photography style suffix (photography aesthetic stays minimal)
$style = "professional product photography, soft diffuse even studio lighting from above, very gentle natural contact shadow, generous negative space around the product, sharp focus, 8k resolution, highly detailed, clean editorial catalog style, the packaging itself is the focal point, no extra props, no people, no environment clutter."

# Three distinct fictional brand worlds
$brands = @{
    "v1" = @{
        name = "RUBY & BUN"
        body = "with a bold cherry-red printed exterior over warm cream base accents"
        design = "a large chunky condensed sans-serif wordmark 'RUBY & BUN' printed in jet black across the front, paired with a small simple flat-illustrated cheeseburger icon above the wordmark, classic American street-burger aesthetic, slight spot UV gloss highlight on the wordmark catching the light, vibrant CMYK saturation, bold confident graphic"
        bg = "isolated on a warm cream off-white seamless background"
    }
    "v2" = @{
        name = "OLIVE GROVE"
        body = "in soft muted sage-green uncoated matte finish with subtle warm ivory base"
        design = "an elegant thin serif wordmark 'OLIVE GROVE' printed in deep terracotta brown across the front, accompanied by a delicate hand-drawn botanical olive branch line illustration in soft gold foil placed above or beside the wordmark, the gold foil catching a faint reflection, organic wellness aesthetic, very refined and calm"
        bg = "isolated on a warm cream off-white seamless paper background"
    }
    "v3" = @{
        name = "TOKYO LANE"
        body = "in deep navy indigo printed exterior with rice-white base panels"
        design = "a clean modern sans-serif wordmark 'TOKYO LANE' printed in bright tangerine orange across the front, with a single bold solid tangerine-orange geometric circle (sun mark) placed above or beside the wordmark, screen-print aesthetic with very slight ink texture, confident modern Japanese minimal graphic design"
        bg = "isolated on a warm cream off-white seamless paper background"
    }
}

# Per-product material spec (must be respected regardless of brand)
$products = @{
    "PB-001" = @{ form="a hinged paperboard burger clamshell box, closed position"; angle="slight three-quarter front hero angle, eye-level camera" }
    "PB-002" = @{ form="a corrugated B-flute burger box with hinged top closed, subtle visible corrugation along the side edges (preserve the corrugated texture under the brand design)"; angle="slight three-quarter front hero angle, eye-level camera" }
    "PB-003" = @{ form="a 16 oz single-wall paper cold drink cup fitted with a clear PET dome lid on top, a slim matching color paper straw inserted through the dome"; angle="slight three-quarter front angle, eye-level camera" }
    "PB-004" = @{ form="a large SOS paper carrier bag with FLAT MATCHING-COLOR PAPER HANDLES (not metal, not rope, not cord), standing upright with crisp side gussets and a flat bottom"; angle="three-quarter front hero angle, eye-level camera" }
    "PB-005" = @{ form="a two-piece square paperboard meal box, base and lid both branded matching, lid placed on top of base"; angle="elevated 45-degree three-quarter angle showing both lid and base depth" }
    "PB-006" = @{ form="a paper fries scoop snack cup with tapered open top and flat bottom"; angle="slight three-quarter front angle showing the open scoop top" }
    "PB-007" = @{ form="a quarter-folded 2-ply paper napkin"; angle="top-down flat lay, perfectly centered, very subtle 3-degree perspective" }
    "PB-008" = @{ form="a stack of three premium business cards in soft-touch finish, stack slightly offset to reveal edge thickness"; angle="elevated three-quarter angle showing card thickness" }
}

$tasks = @()
foreach ($sku in $products.Keys | Sort-Object) {
    foreach ($v in @("v1","v2","v3")) {
        $b = $brands[$v]
        $prod = $products[$sku]
        $prompt = "Mockup product photography of $($prod.form), the packaging is $($b.body), featuring $($b.design), $($b.bg), $($prod.angle), $style"
        $tasks += @{ id=$sku; variant=$v; brand=$b.name; prompt=$prompt }
    }
}

$results = @()
$index = 0
$total = $tasks.Count
foreach ($task in $tasks) {
    $index++
    $filename = "{0}_{1}.png" -f $task.id, $task.variant
    $output = Join-Path $OutputDir $filename
    if ((Test-Path $output) -and $task.variant -eq "v1") {
        Write-Host "[$index/$total] $filename ($($task.brand)) - SKIP (already correct cream bg)" -ForegroundColor Gray
        $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; brand=$task.brand; file=$filename; status="SKIPPED"; size_kb=[math]::Round((Get-Item $output).Length/1024,1); seconds=0 }
        continue
    }
    Write-Host "[$index/$total] $filename ($($task.brand)) ..." -ForegroundColor Cyan
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $res = & $gen -ApiKey $ApiKey -Prompt $task.prompt -OutputPath $output -Model $Model 2>&1
        $sw.Stop()
        if (Test-Path $output) {
            $size = (Get-Item $output).Length
            Write-Host "  OK ($([math]::Round($size/1024,1)) KB, $([math]::Round($sw.Elapsed.TotalSeconds,1))s)" -ForegroundColor Green
            $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; brand=$task.brand; file=$filename; status="OK"; size_kb=[math]::Round($size/1024,1); seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
        } else {
            Write-Host "  FAILED: $res" -ForegroundColor Red
            $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; brand=$task.brand; file=$filename; status="FAILED"; size_kb=0; seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
        }
    } catch {
        $sw.Stop()
        Write-Host "  EXCEPTION: $($_.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; brand=$task.brand; file=$filename; status="EXCEPTION"; size_kb=0; seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
    }
}

Write-Host "`n=== BRANDED VARIATIONS SUMMARY ===" -ForegroundColor Yellow
$results | Format-Table -AutoSize
$ok = ($results | Where-Object { $_.status -eq "OK" }).Count
Write-Host "Completed: $ok / $total" -ForegroundColor $(if ($ok -eq $total) { "Green" } else { "Yellow" })
