# PrintBox - Render 3 MINIMALIST variations per product (24 total)
# Aesthetic: Aesop/Le Labo/Muji — light bg, soft even light, single small wordmark, lots of negative space
# Naming: PB-XXX_v1.png (hero 3/4), PB-XXX_v2.png (straight front), PB-XXX_v3.png (alt angle)
param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [string]$OutputDir = "c:\Users\User\Desktop\PrintBox\renders",
    [string]$Model = "gemini-3-pro-image-preview",
    [string]$ScriptDir = "c:\Users\User\Desktop\PrintBox\scripts"
)

$ErrorActionPreference = "Continue"
$gen = Join-Path $ScriptDir "Generate-Images.ps1"

if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null }

$style = "isolated on a clean off-white seamless paper background, soft diffuse even studio lighting from above, very gentle natural contact shadow, generous negative space around the product, restrained editorial product photography in the style of Aesop, Le Labo or Muji catalogs, sharp focus, 8k resolution, highly detailed, true minimalism, no decorative elements, no patterns, no extra graphics."

# Per-product: base description + single tiny wordmark
$products = @{
    "PB-001" = "a hinged paperboard burger clamshell box in matte black soft-touch finish, closed position, a single small polished gold foil wordmark 'PRINTBOX' centered on the top lid in a thin clean sans-serif typeface (occupying about 25 percent of lid width), no monogram, no geometric accents, no decorative lines"
    "PB-002" = "a corrugated kraft burger box in matte black with subtle visible black-on-black B-flute corrugation along the side edges, hinged top closed, a single small polished gold foil wordmark 'PRINTBOX' centered on the lid in a thin clean sans-serif typeface, no monogram, no geometric accents"
    "PB-003" = "a 16 oz matte black single-wall paper cold drink cup with a single small polished gold foil wordmark 'PRINTBOX' centered on the cup body in a thin clean sans-serif typeface (about 1/3 cup width), clear PET dome lid fitted on top, a slim matte black paper straw inserted through the dome, no monogram, no patterns"
    "PB-004" = "a large SOS paper carrier bag in matte black with FLAT BLACK PAPER HANDLES (not metal, not rope, not cord), a single small polished gold foil wordmark 'PRINTBOX' centered on the front face in a thin clean sans-serif typeface, no borders, no patterns, standing upright with crisp side gussets and a flat bottom"
    "PB-005" = "a two-piece square paperboard meal box, both base and lid finished in matte black, lid placed on the base, a single small polished gold foil wordmark 'PRINTBOX' centered on the lid in a thin clean sans-serif typeface, no monogram, no accents"
    "PB-006" = "a paper fries scoop snack cup in matte black with a tapered open top and flat bottom, a single small polished gold foil wordmark 'PRINTBOX' centered on the front face in a thin clean sans-serif typeface, no monogram, no patterns"
    "PB-007" = "a quarter-folded 2-ply paper napkin in matte black tissue, a single small polished gold foil wordmark 'PRINTBOX' centered on the visible folded face in a thin clean sans-serif typeface, no monogram, no patterns"
    "PB-008" = "a stack of three premium business cards in matte black soft-touch finish, top card showing a single small polished gold foil wordmark 'PRINTBOX' centered in a thin clean sans-serif typeface, stack slightly offset to reveal edge thickness, no decorative lines, no glyphs"
}

# Three angle/composition variations applied to all products
$angles = @{
    "v1" = "slight three-quarter front hero angle, eye-level camera"
    "v2" = "straight-on front-facing centered composition, eye-level camera, perfectly symmetric framing"
    "v3" = "elevated 45-degree top-down angle showing depth of the product"
}

# PB-007 napkin needs a specific top-down treatment since it's flat
$napkinOverride = @{
    "v1" = "top-down flat lay, perfectly centered, very subtle 3-degree perspective"
    "v2" = "top-down flat lay, perfectly centered, exact orthographic angle"
    "v3" = "very slight three-quarter overhead angle, napkin laid flat on surface"
}

$tasks = @()
foreach ($sku in $products.Keys | Sort-Object) {
    foreach ($v in @("v1","v2","v3")) {
        $angle = if ($sku -eq "PB-007") { $napkinOverride[$v] } else { $angles[$v] }
        $prompt = "Minimalist product photography of " + $products[$sku] + ", " + $angle + ", " + $style
        $tasks += @{ id=$sku; variant=$v; prompt=$prompt }
    }
}

$results = @()
$index = 0
$total = $tasks.Count
foreach ($task in $tasks) {
    $index++
    $filename = "{0}_{1}.png" -f $task.id, $task.variant
    $output = Join-Path $OutputDir $filename
    Write-Host "[$index/$total] $filename ..." -ForegroundColor Cyan
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $res = & $gen -ApiKey $ApiKey -Prompt $task.prompt -OutputPath $output -Model $Model 2>&1
        $sw.Stop()
        if (Test-Path $output) {
            $size = (Get-Item $output).Length
            Write-Host "  OK ($([math]::Round($size/1024,1)) KB, $([math]::Round($sw.Elapsed.TotalSeconds,1))s)" -ForegroundColor Green
            $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; file=$filename; status="OK"; size_kb=[math]::Round($size/1024,1); seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
        } else {
            Write-Host "  FAILED: $res" -ForegroundColor Red
            $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; file=$filename; status="FAILED"; size_kb=0; seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
        }
    } catch {
        $sw.Stop()
        Write-Host "  EXCEPTION: $($_.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ id=$task.id; variant=$task.variant; file=$filename; status="EXCEPTION"; size_kb=0; seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
    }
}

Write-Host "`n=== MINIMALIST VARIATIONS SUMMARY ===" -ForegroundColor Yellow
$results | Format-Table -AutoSize
$ok = ($results | Where-Object { $_.status -eq "OK" }).Count
Write-Host "Completed: $ok / $total" -ForegroundColor $(if ($ok -eq $total) { "Green" } else { "Yellow" })
