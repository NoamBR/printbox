# PrintBox — Hero cups+splash, brand v1 cinematic style, cream-baked bg
param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [string]$Model = "gemini-3-pro-image-preview"
)

$ErrorActionPreference = "Stop"

$prompt = "Cinematic brand product photography in the style of premium beverage advertising: two photorealistic deep espresso-brown (hex #5C3819) paper cold drink cups, slightly tilted toward each other, large and dominant in the frame, each cup wrapped with a polished gold-foil ornate monogram letter M centered on the cup body and a thin gold decorative double-line ring near the rim, clear PET dome lids with slim deep-espresso paper straws, between and across the two cups a dynamic mid-air liquid splash with rich honey-amber translucent coffee droplets and graceful ribbons of liquid arcing across and looping around the cups frozen in time, warm soft directional studio lighting from upper-left catching the gold foil and the splash, the composition fills the entire frame edge to edge with the cups taking center stage, set against a smooth solid warm cream beige background hex #EAE2C8, no surface no shadow no pedestal no podium, the cream background extends uniformly across the entire canvas with no vignette, ultra-detailed 8k commercial photorealistic rendering, editorial luxury beverage advertising aesthetic, sharp tack-focus, no people no text no labels"

$rendersDir = 'c:\Users\User\Desktop\PrintBox\renders'
$publicDir  = 'c:\Users\User\Desktop\PrintBox\public\renders'
$out        = Join-Path $rendersDir 'HERO_cups_icon.png'
$pubOut     = Join-Path $publicDir  'HERO_cups_icon.png'

if (-not (Test-Path $rendersDir)) { New-Item -ItemType Directory -Force -Path $rendersDir | Out-Null }
if (-not (Test-Path $publicDir))  { New-Item -ItemType Directory -Force -Path $publicDir  | Out-Null }

$gen = 'c:\Users\User\Desktop\PrintBox\scripts\Generate-Images.ps1'

Write-Host "Generating HERO_cups_icon.png (brand v1, cream bg) via $Model ..." -ForegroundColor Cyan
$sw = [System.Diagnostics.Stopwatch]::StartNew()
& $gen -ApiKey $ApiKey -Prompt $prompt -OutputPath $out -Model $Model
$sw.Stop()

if (Test-Path $out) {
    $kb = [math]::Round((Get-Item $out).Length / 1024, 1)
    Copy-Item $out $pubOut -Force
    Write-Host "OK  ($kb KB in $([math]::Round($sw.Elapsed.TotalSeconds,1))s)" -ForegroundColor Green
    Write-Host "  -> $out"
    Write-Host "  -> $pubOut"
} else {
    Write-Error "Generation failed; no output file."
    exit 2
}
