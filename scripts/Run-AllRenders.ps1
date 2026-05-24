# PrintBox - Batch render all 16 catalog images via Gemini Nano Banana Pro
param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [string]$OutputDir = "c:\Users\User\Desktop\PrintBox\renders",
    [string]$Model = "gemini-3-pro-image-preview",
    [string]$ScriptDir = "c:\Users\User\Desktop\PrintBox\scripts"
)

$ErrorActionPreference = "Continue"
$gen = Join-Path $ScriptDir "Generate-Images.ps1"

if (-not (Test-Path $OutputDir)) { New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null }

$tasks = @(
    # CLEAN STUDIO SHOTS (pure white background, blank/unbranded)
    @{ id="PB-001"; type="clean"; prompt="Professional e-commerce product photography of a coated paperboard hinged burger clamshell box, blank, unbranded, pure matte white surface, hinge slightly visible, closed position, isolated on an absolute pure white background, soft top studio lighting, gentle contact shadow beneath, three-quarter front angle, sharp focus, 8k resolution, highly detailed, commercial catalog aesthetic." },
    @{ id="PB-002"; type="clean"; prompt="Professional e-commerce product photography of a corrugated kraft burger box with hinged top opening, natural unbleached kraft color, visible B-flute corrugation on side edges, blank, unbranded, completely empty interior, isolated on an absolute pure white background, balanced soft studio lighting, subtle drop shadow, three-quarter front angle showing both lid and side profile, sharp focus, 8k resolution, highly detailed, professional packaging catalog look." },
    @{ id="PB-003"; type="clean"; prompt="Professional e-commerce product photography of a 16 oz single-wall paper cold drink cup, pure matte white body, blank, unbranded, fitted with a clear transparent PET dome lid, cross-cut straw slot visible, isolated on an absolute pure white background, soft overhead studio lighting, subtle realistic shadow under the cup, slight three-quarter front angle, sharp focus on lid translucence, 8k resolution, highly detailed, commercial catalog aesthetic." },
    @{ id="PB-004"; type="clean"; prompt="Professional e-commerce product photography of a large SOS paper carrier bag with flat paper handles, pure matte white kraft paper, blank, unbranded, standing upright with crisp side gussets and flat bottom, slight natural top fold, isolated on an absolute pure white background, soft frontal studio lighting, gentle realistic shadow, frontal three-quarter angle, sharp focus on paper texture, 8k resolution, highly detailed, e-commerce catalog aesthetic." },
    @{ id="PB-005"; type="clean"; prompt="Professional e-commerce product photography of a two-piece square paperboard meal box, deep base with separate telescoping lid placed on top, natural matte white finish, blank, unbranded, isolated on an absolute pure white background, soft top-down studio lighting, subtle realistic contact shadow, slight three-quarter elevated angle showing lid and base separation, sharp focus, 8k resolution, highly detailed, commercial catalog look." },
    @{ id="PB-006"; type="clean"; prompt="Professional e-commerce product photography of a paper fries scoop snack cup, tapered open top with flat bottom, pure matte white coated paper, blank, unbranded, empty, isolated on an absolute pure white background, soft front studio lighting, subtle realistic shadow underneath, three-quarter front angle showing scoop opening, sharp focus on paper crease, 8k resolution, highly detailed, e-commerce catalog aesthetic." },
    @{ id="PB-007"; type="clean"; prompt="Professional e-commerce product photography of a folded 2-ply paper napkin, quarter-fold, pure matte white tissue, blank, unbranded, slight natural creases visible, isolated on an absolute pure white background, soft top-down studio lighting, very subtle paper shadow, flat top-down angle with very slight perspective, sharp focus on tissue texture, 8k resolution, highly detailed, commercial catalog aesthetic." },
    @{ id="PB-008"; type="clean"; prompt="Professional e-commerce product photography of a stack of three premium business cards, 350 GSM coated stock, pure matte white surface, blank, unbranded, top card slightly offset to reveal the stack edge, isolated on an absolute pure white background, soft 45-degree studio lighting, sharp paper-edge shadow, elevated three-quarter angle, sharp focus on card thickness, 8k resolution, highly detailed, commercial catalog aesthetic." },

    # BRANDED PREMIUM MOCKUPS (matte black + gold foil)
    @{ id="PB-001"; type="branded"; prompt="Luxury product photography of a hinged paperboard burger box in deep matte black, premium soft-touch finish, top lid stamped with polished gold foil minimalist monogram and a thin geometric gold line accent, gold foil reflections catching directional studio light, isolated on a charcoal-to-black gradient background, dramatic side rim-light, micro contact shadow, three-quarter hero angle, sharp focus, 8k, highly detailed, editorial advertising aesthetic." },
    @{ id="PB-002"; type="branded"; prompt="Luxury product photography of a corrugated kraft burger box re-finished in deep matte black exterior with visible black-on-black corrugation edge, hinged top lid debossed and gold-foil stamped with a minimalist serif wordmark and a single geometric gold line, polished gold foil catching sharp directional light, interior left dark matte, isolated on a soft dark grey gradient background, cinematic side lighting with rim highlights, micro contact shadow, three-quarter hero angle, sharp focus, 8k, highly detailed, premium gourmet packaging aesthetic." },
    @{ id="PB-003"; type="branded"; prompt="Luxury product photography of a 16 oz matte black paper cold drink cup with a polished gold foil monogram wrap and a thin geometric gold ring near the rim, clear PET dome lid with a slim matte black paper straw inserted, gold foil reflections sharp against the soft matte body, isolated on a deep charcoal background with subtle vignette, directional rim lighting from the upper right, micro contact shadow, three-quarter hero angle, sharp focus, 8k, highly detailed, editorial luxury beverage aesthetic." },
    @{ id="PB-004"; type="branded"; prompt="Luxury product photography of a large SOS paper carrier bag in deep matte black, gold-foil stamped minimalist wordmark across the front face, a single thin geometric gold border line along the lower edge, polished gold foil handles attached at the top fold, standing upright with crisp gussets, isolated on a graphite-to-black gradient background, dramatic side lighting catching the foil reflections, soft contact shadow, three-quarter hero angle, sharp focus on paper grain, 8k, highly detailed, editorial luxury packaging aesthetic." },
    @{ id="PB-005"; type="branded"; prompt="Luxury product photography of a two-piece square paperboard meal box, both base and lid finished in deep matte black, lid centered with a polished gold foil minimalist circular emblem and a thin gold geometric corner accent, interior visible as a slim gold-foil line along the lid edge, isolated on a deep grey gradient background, cinematic side lighting catching the foil, micro contact shadow, elevated three-quarter angle, sharp focus, 8k, highly detailed, editorial luxury food packaging aesthetic." },
    @{ id="PB-006"; type="branded"; prompt="Luxury product photography of a paper fries scoop in deep matte black, polished gold foil minimalist monogram on the front face, a thin geometric gold line accent wrapping the upper edge, sharp gold foil reflections against the soft matte body, isolated on a charcoal gradient background, directional rim lighting from the upper left, micro contact shadow, three-quarter hero angle, sharp focus, 8k, highly detailed, editorial premium snack-bar aesthetic." },
    @{ id="PB-007"; type="branded"; prompt="Luxury product photography of a quarter-folded 2-ply paper napkin in deep matte black tissue, centered polished gold foil minimalist monogram with a thin geometric gold corner accent, gold foil catching soft directional light against the matte tissue grain, isolated on a deep charcoal background, top-down flat lay with subtle 3-degree perspective and gentle paper shadow, sharp focus, 8k, highly detailed, editorial luxury tabletop aesthetic." },
    @{ id="PB-008"; type="branded"; prompt="Luxury product photography of a stack of three premium business cards in deep matte black soft-touch finish, top card showing a polished gold foil minimalist wordmark and a single thin geometric gold line accent, second card showing reverse side with small gold foil contact glyph, sharp gold foil reflections against the soft matte black, isolated on a deep charcoal gradient background, dramatic 45-degree directional lighting catching the foil, micro paper-edge shadow, elevated three-quarter angle, sharp focus on card thickness, 8k, highly detailed, editorial luxury stationery aesthetic." }
)

$results = @()
$index = 0
$total = $tasks.Count
foreach ($task in $tasks) {
    $index++
    $filename = "{0}_{1}.png" -f $task.id, $task.type
    $output = Join-Path $OutputDir $filename
    Write-Host "[$index/$total] Generating $filename ..." -ForegroundColor Cyan
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $res = & $gen -ApiKey $ApiKey -Prompt $task.prompt -OutputPath $output -Model $Model 2>&1
        $sw.Stop()
        if (Test-Path $output) {
            $size = (Get-Item $output).Length
            Write-Host "  OK ($([math]::Round($size/1024,1)) KB, $([math]::Round($sw.Elapsed.TotalSeconds,1))s)" -ForegroundColor Green
            $results += [PSCustomObject]@{ id=$task.id; type=$task.type; file=$filename; status="OK"; size_kb=[math]::Round($size/1024,1); seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
        } else {
            Write-Host "  FAILED: $res" -ForegroundColor Red
            $results += [PSCustomObject]@{ id=$task.id; type=$task.type; file=$filename; status="FAILED"; size_kb=0; seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
        }
    } catch {
        $sw.Stop()
        Write-Host "  EXCEPTION: $($_.Exception.Message)" -ForegroundColor Red
        $results += [PSCustomObject]@{ id=$task.id; type=$task.type; file=$filename; status="EXCEPTION"; size_kb=0; seconds=[math]::Round($sw.Elapsed.TotalSeconds,1) }
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Yellow
$results | Format-Table -AutoSize
$results | ConvertTo-Json -Depth 3 | Out-File -FilePath (Join-Path $OutputDir "_render_log.json") -Encoding utf8
Write-Host "Saved render log to $OutputDir\_render_log.json"
