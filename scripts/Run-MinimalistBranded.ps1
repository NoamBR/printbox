# PrintBox - Re-render 8 BRANDED mockups in true minimalist aesthetic
# Aesop/Le Labo/Muji school: light bg, soft even light, single tiny wordmark, lots of negative space
param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [string]$OutputDir = "c:\Users\User\Desktop\PrintBox\renders",
    [string]$Model = "gemini-3-pro-image-preview",
    [string]$ScriptDir = "c:\Users\User\Desktop\PrintBox\scripts"
)

$ErrorActionPreference = "Continue"
$gen = Join-Path $ScriptDir "Generate-Images.ps1"

if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null }

# Shared style suffix for consistency across all 8 SKUs
$styleSuffix = "isolated on a clean off-white seamless paper background, soft diffuse even studio lighting from above, very gentle natural contact shadow, generous negative space around the product, restrained editorial product photography in the style of Aesop, Le Labo or Muji catalogs, sharp focus, 8k resolution, highly detailed, true minimalism, no decorative elements, no patterns, no extra graphics."

$tasks = @(
    @{ id="PB-001"; prompt="Minimalist product photography of a hinged paperboard burger clamshell box in matte black soft-touch finish, closed position, single small polished gold foil wordmark 'PRINTBOX' centered on the top lid in a thin clean sans-serif typeface (approximately 1/4 of the lid width), no monogram, no geometric accents, no decorative lines, three-quarter front hero angle, $styleSuffix" },
    @{ id="PB-002"; prompt="Minimalist product photography of a corrugated kraft burger box re-finished in matte black with subtle visible black-on-black B-flute corrugation along the side edges, hinged top closed, single small polished gold foil wordmark 'PRINTBOX' centered on the lid in a thin clean sans-serif typeface, no monogram, no geometric accents, no decorative lines, three-quarter front hero angle, $styleSuffix" },
    @{ id="PB-003"; prompt="Minimalist product photography of a 16 oz matte black single-wall paper cold drink cup, single small polished gold foil wordmark 'PRINTBOX' centered on the cup body in a thin clean sans-serif typeface (approximately 1/3 of the cup width), clear PET dome lid with a slim matte black paper straw inserted, no monogram, no patterns, no extra graphics, slight three-quarter front angle, $styleSuffix" },
    @{ id="PB-004"; prompt="Minimalist product photography of a large SOS paper carrier bag in matte black with FLAT BLACK PAPER HANDLES (not metal, not rope, not cord), single small polished gold foil wordmark 'PRINTBOX' centered on the front face in a thin clean sans-serif typeface (approximately 1/3 of the bag width), no decorative borders, no patterns, standing upright with crisp side gussets and flat bottom, three-quarter hero angle, $styleSuffix" },
    @{ id="PB-005"; prompt="Minimalist product photography of a two-piece square paperboard meal box, both base and lid finished in matte black, lid placed on top of base, single small polished gold foil wordmark 'PRINTBOX' centered on the lid in a thin clean sans-serif typeface, no monogram, no geometric accents, slight elevated three-quarter angle, $styleSuffix" },
    @{ id="PB-006"; prompt="Minimalist product photography of a paper fries scoop snack cup in matte black, tapered open top with flat bottom, single small polished gold foil wordmark 'PRINTBOX' centered on the front face in a thin clean sans-serif typeface, no monogram, no patterns, no decorative lines, three-quarter front hero angle, $styleSuffix" },
    @{ id="PB-007"; prompt="Minimalist product photography of a quarter-folded 2-ply paper napkin in matte black tissue, single small polished gold foil wordmark 'PRINTBOX' centered on the visible folded face in a thin clean sans-serif typeface, no monogram, no patterns, no corner accents, top-down flat lay with very subtle 3-degree perspective, $styleSuffix" },
    @{ id="PB-008"; prompt="Minimalist product photography of a stack of three premium business cards in matte black soft-touch finish, top card showing a single small polished gold foil wordmark 'PRINTBOX' centered in a thin clean sans-serif typeface, stack slightly offset to reveal edge thickness, no decorative lines, no glyphs, no patterns, elevated three-quarter angle, $styleSuffix" }
)

$results = @()
$index = 0
$total = $tasks.Count
foreach ($task in $tasks) {
    $index++
    $filename = "{0}_branded.png" -f $task.id
    $output = Join-Path $OutputDir $filename
    Write-Host "[$index/$total] Re-rendering $filename ..." -ForegroundColor Cyan
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $res = & $gen -ApiKey $ApiKey -Prompt $task.prompt -OutputPath $output -Model $Model 2>&1
        $sw.Stop()
        if (Test-Path $output) {
            $size = (Get-Item $output).Length
            Write-Host "  OK ($([math]::Round($size/1024,1)) KB, $([math]::Round($sw.Elapsed.TotalSeconds,1))s)" -ForegroundColor Green
            $results += [PSCustomObject]@{ id=$task.id; file=$filename; status="OK"; size_kb=[math]::Round($size/1024,1); seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
        } else {
            Write-Host "  FAILED: $res" -ForegroundColor Red
            $results += [PSCustomObject]@{ id=$task.id; file=$filename; status="FAILED"; size_kb=0; seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
        }
    } catch {
        $sw.Stop()
        Write-Host "  EXCEPTION: $($_.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ id=$task.id; file=$filename; status="EXCEPTION"; size_kb=0; seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
    }
}

Write-Host "`n=== MINIMALIST RE-RENDER SUMMARY ===" -ForegroundColor Yellow
$results | Format-Table -AutoSize
