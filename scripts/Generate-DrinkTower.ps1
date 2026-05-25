# PrintBox — Generate PB-031 drink-tower SKU (v1..v6)
param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [string]$Model = "gemini-3-pro-image-preview"
)

$ErrorActionPreference = "Continue"

$rendersDir = 'c:\Users\User\Desktop\PrintBox\renders'
$publicDir  = 'c:\Users\User\Desktop\PrintBox\public\renders'
$gen        = 'c:\Users\User\Desktop\PrintBox\scripts\Generate-Images.ps1'

$prompts = @(
    "Professional cinematic product photography of a single tall slim transparent yard-glass drink tower for events and bars, clear cylindrical body approximately 60cm tall with elegant decorative tapered base, polished brown plastic snap-on cap on top with a small pour spout, the body labeled with a vertical gold-foil minimalist monogram letter M, filled with warm amber liquid that catches soft directional studio lighting, isolated on a clean warm cream beige solid background hex #EEE7D4, soft natural shadow under the base, three-quarter front angle, sharp tack-focus, ultra-detailed 8k commercial photorealistic rendering, editorial luxury beverage advertising aesthetic, no people no text no labels beyond the M monogram",
    "Professional cinematic product photography of three tall slim transparent yard-glass drink towers lined up side by side at angles, varied vibrant translucent liquid colors orange amber and rose, polished brown plastic snap-on caps with pour spouts, each cup with a vertical gold-foil minimalist monogram letter M printed on the body, elegant decorative tapered bases, catching warm soft directional studio lighting, isolated on a clean warm cream beige solid background hex #EEE7D4, subtle natural shadows under the bases, three-quarter front angle, sharp tack-focus, ultra-detailed 8k commercial photorealistic rendering, editorial luxury beverage advertising aesthetic, no people no text no labels beyond the M monogram"
)

for ($i = 0; $i -lt 2; $i++) {
    $n = $i + 1
    $out = Join-Path $rendersDir "PB-031_v$n.png"
    Write-Host "[$n/2] Generating PB-031_v$n ..." -ForegroundColor Cyan
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    & $gen -ApiKey $ApiKey -Prompt $prompts[$i] -OutputPath $out -Model $Model 2>&1 | Out-Null
    $sw.Stop()
    if (Test-Path $out) {
        $kb = [math]::Round((Get-Item $out).Length / 1024, 1)
        Write-Host "  OK ($kb KB in $([math]::Round($sw.Elapsed.TotalSeconds,1))s)" -ForegroundColor Green
    } else {
        Write-Host "  FAILED" -ForegroundColor Red
    }
}

# Duplicate v1 + v2 to fill v3..v6 so ProductModal doesn't show broken images
if ((Test-Path (Join-Path $rendersDir 'PB-031_v1.png')) -and (Test-Path (Join-Path $rendersDir 'PB-031_v2.png'))) {
    Copy-Item (Join-Path $rendersDir 'PB-031_v1.png') (Join-Path $rendersDir 'PB-031_v3.png') -Force
    Copy-Item (Join-Path $rendersDir 'PB-031_v2.png') (Join-Path $rendersDir 'PB-031_v4.png') -Force
    Copy-Item (Join-Path $rendersDir 'PB-031_v1.png') (Join-Path $rendersDir 'PB-031_v5.png') -Force
    Copy-Item (Join-Path $rendersDir 'PB-031_v2.png') (Join-Path $rendersDir 'PB-031_v6.png') -Force
    Write-Host "Filled v3..v6 placeholders" -ForegroundColor Yellow
}

# Sync to public/renders
Copy-Item (Join-Path $rendersDir 'PB-031_v*.png') $publicDir -Force
Write-Host "Synced PB-031_v* to public/renders" -ForegroundColor Green
