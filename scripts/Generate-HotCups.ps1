# PrintBox — regenerate PB-029 + PB-030 hot cups at IDENTICAL framing/scale
# so they appear the same size in their catalog cards
param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [string]$Model = "gemini-3-pro-image-preview"
)

$ErrorActionPreference = "Continue"

$rendersDir = 'c:\Users\User\Desktop\PrintBox\renders'
$publicDir  = 'c:\Users\User\Desktop\PrintBox\public\renders'
$gen        = 'c:\Users\User\Desktop\PrintBox\scripts\Generate-Images.ps1'

# Identical framing across both SKUs — cup occupies ~75% of vertical frame, centered, three-quarter front angle
$FRAMING = "the paper hot drink cup is centered in a square frame and occupies approximately 75 percent of the vertical frame height, fully visible from base to top of the lid, three-quarter front angle view, soft natural shadow under the cup, isolated on a clean warm cream beige solid background hex #EEE7D4, sharp tack-focus, ultra-detailed 8k commercial photorealistic rendering, editorial luxury beverage advertising aesthetic, no people no extra text beyond the RUBY & BUN brand label"

$BRAND = "the cup body is wrapped in a printed paper label featuring the RUBY & BUN brand identity: bright red label with the words RUBY & BUN in bold uppercase black sans-serif typography stacked vertically and a small black burger icon at the top center of the label"

$tasks = @(
    @{
        id = 'PB-029'
        prompt = "Professional cinematic product photography of a single 16oz single-wall paper hot drink cup with a glossy dark brown plastic snap-on dome lid, $BRAND, $FRAMING"
    },
    @{
        id = 'PB-030'
        prompt = "Professional cinematic product photography of a single 16oz double-wall insulated paper hot drink cup with a slightly thicker rim profile and a glossy dark brown plastic snap-on dome lid, $BRAND, $FRAMING"
    }
)

foreach ($task in $tasks) {
    for ($i = 1; $i -le 2; $i++) {
        $out = Join-Path $rendersDir "$($task.id)_v$i.png"
        Write-Host "Generating $($task.id)_v$i ..." -ForegroundColor Cyan
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        & $gen -ApiKey $ApiKey -Prompt $task.prompt -OutputPath $out -Model $Model 2>&1 | Out-Null
        $sw.Stop()
        if (Test-Path $out) {
            $kb = [math]::Round((Get-Item $out).Length / 1024, 1)
            Write-Host "  OK ($kb KB in $([math]::Round($sw.Elapsed.TotalSeconds,1))s)" -ForegroundColor Green
        } else {
            Write-Host "  FAILED" -ForegroundColor Red
        }
    }
    # Mirror v1+v2 into v3..v6 so modal has 6 entries (until distinct variants exist)
    if ((Test-Path (Join-Path $rendersDir "$($task.id)_v1.png")) -and (Test-Path (Join-Path $rendersDir "$($task.id)_v2.png"))) {
        Copy-Item (Join-Path $rendersDir "$($task.id)_v1.png") (Join-Path $rendersDir "$($task.id)_v3.png") -Force
        Copy-Item (Join-Path $rendersDir "$($task.id)_v2.png") (Join-Path $rendersDir "$($task.id)_v4.png") -Force
        Copy-Item (Join-Path $rendersDir "$($task.id)_v1.png") (Join-Path $rendersDir "$($task.id)_v5.png") -Force
        Copy-Item (Join-Path $rendersDir "$($task.id)_v2.png") (Join-Path $rendersDir "$($task.id)_v6.png") -Force
    }
    Copy-Item (Join-Path $rendersDir "$($task.id)_v*.png") $publicDir -Force
}

Write-Host "Done - synced to public/renders" -ForegroundColor Green
