# PrintBox — Generate PB-031 drink-tower SKU (v1..v6)
param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [string]$Model = "gemini-3-pro-image-preview"
)

$ErrorActionPreference = "Continue"

$rendersDir = 'c:\Users\User\Desktop\PrintBox\renders'
$publicDir  = 'c:\Users\User\Desktop\PrintBox\public\renders'
$gen        = 'c:\Users\User\Desktop\PrintBox\scripts\Generate-Images.ps1'

$SHAPE = "the cup is a tall slim transparent acrylic yard-glass drink tower approximately 60cm tall, with a precise repeatable silhouette: clear cylindrical main body with 3 to 4 horizontal ribbed segment rings dividing the body into sections, a polished brown plastic snap-on cap on top with a small integrated pour spout, and an elegant decorative tapered goblet-style pedestal base that flares outward at the bottom forming a wide stable footprint, the entire product is one continuous transparent acrylic piece, this exact shape must be preserved precisely identically across all renders without alteration"

$prompts = @(
    "Professional cinematic product photography of a single drink tower for events and bars. $SHAPE. The transparent body is wrapped in a printed paper label featuring the RUBY & BUN brand identity: bright red label with the words RUBY & BUN in bold uppercase black sans-serif typography stacked vertically and a small black burger icon at the top, filled with warm caramel-amber liquid that catches soft directional studio lighting, isolated on a clean warm cream beige solid background hex #EEE7D4, soft natural shadow under the base, three-quarter front angle, sharp tack-focus, ultra-detailed 8k commercial photorealistic rendering, editorial luxury beverage advertising aesthetic, no people no extra text beyond the RUBY & BUN brand label",
    "Professional cinematic product photography of three drink towers lined up side by side at slight angles for a takeaway promotion. Each tower has $SHAPE. All three wrapped with the RUBY & BUN brand identity: bright red paper labels with bold uppercase black RUBY & BUN typography and a small black burger icon at the top of each label, filled with varied translucent liquid colors warm amber and deep ruby red and orange, catching warm soft directional studio lighting, isolated on a clean warm cream beige solid background hex #EEE7D4, subtle natural shadows under the bases, three-quarter front angle, sharp tack-focus, ultra-detailed 8k commercial photorealistic rendering, editorial luxury beverage advertising aesthetic, no people no extra text beyond the RUBY & BUN brand label"
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
