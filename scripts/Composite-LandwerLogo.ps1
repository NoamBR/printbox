# PrintBox - Composite the exact Landwer logo onto each v8 render
# Reads existing v8 PNGs, overlays logo PNG at center (covers AI-approximated logo with the real one)
param(
    [string]$RendersDir = "c:\Users\User\Desktop\PrintBox\renders",
    [string]$LogoPath   = "c:\Users\User\Desktop\PrintBox\assets\landwer_logo.png",
    [double]$LogoWidthRatio = 0.30,
    [double]$VerticalCenterRatio = 0.50
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $LogoPath)) { Write-Error "Logo not found: $LogoPath"; exit 1 }

# Per-product logo positioning + scale overrides (vertical ratio + width ratio)
# Default: centered, 30% width. Override for specific products.
$overrides = @{
    "PB-003" = @{ vRatio = 0.55; wRatio = 0.35 }  # cold cup - logo center-low
    "PB-004" = @{ vRatio = 0.50; wRatio = 0.32 }  # SOS bag - center
    "PB-005" = @{ vRatio = 0.50; wRatio = 0.32 }  # meal box - center
    "PB-007" = @{ vRatio = 0.50; wRatio = 0.32 }  # napkin
    "PB-008" = @{ vRatio = 0.50; wRatio = 0.30 }  # cards
    "PB-014" = @{ vRatio = 0.40; wRatio = 0.25 }  # donut box lid
    "PB-015" = @{ vRatio = 0.35; wRatio = 0.28 }  # bread bag - upper header
    "PB-016" = @{ vRatio = 0.55; wRatio = 0.35 }  # cup carrier
    "PB-027" = @{ vRatio = 0.55; wRatio = 0.32 }  # salad bowl
    "PB-028" = @{ vRatio = 0.50; wRatio = 0.32 }  # ice cream pint
    "PB-029" = @{ vRatio = 0.55; wRatio = 0.32 }  # hot cup single
    "PB-030" = @{ vRatio = 0.55; wRatio = 0.32 }  # hot cup double
    "PB-031" = @{ vRatio = 0.30; wRatio = 0.30 }  # cookie box lid
    "PB-032" = @{ vRatio = 0.40; wRatio = 0.28 }  # bucket combo
    "PB-033" = @{ vRatio = 0.45; wRatio = 0.32 }  # round cake box
    "PB-034" = @{ vRatio = 0.50; wRatio = 0.30 }  # drawer cake box
    "PB-035" = @{ vRatio = 0.50; wRatio = 0.32 }  # tied parcel
    "PB-036" = @{ vRatio = 0.45; wRatio = 0.32 }  # cone bag
    "PB-037" = @{ vRatio = 0.35; wRatio = 0.30 }  # macaron box lid
    "PB-038" = @{ vRatio = 0.40; wRatio = 0.30 }  # charcuterie box lid
}

$logoOrig = [System.Drawing.Image]::FromFile($LogoPath)
$logoAspect = $logoOrig.Width / $logoOrig.Height

$files = Get-ChildItem $RendersDir -Filter "PB-*_v8.png" | Sort-Object Name
Write-Host "Compositing logo onto $($files.Count) v8 renders..." -ForegroundColor Cyan

$count = 0
foreach ($file in $files) {
    $sku = ($file.Name -split '_')[0]
    $config = if ($overrides.ContainsKey($sku)) { $overrides[$sku] } else { @{ vRatio = 0.50; wRatio = 0.30 } }

    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $bmp = New-Object System.Drawing.Bitmap $img.Width, $img.Height
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.DrawImage($img, 0, 0, $img.Width, $img.Height)

        $logoW = [int]($img.Width * $config.wRatio)
        $logoH = [int]($logoW / $logoAspect)
        $x = [int](($img.Width - $logoW) / 2)
        $y = [int](($img.Height * $config.vRatio) - ($logoH / 2))

        $g.DrawImage($logoOrig, $x, $y, $logoW, $logoH)
        $g.Dispose()

        $img.Dispose()
        $bmp.Save($file.FullName, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()

        $count++
        Write-Host "  OK $($file.Name) [v:$($config.vRatio), w:$($config.wRatio)]" -ForegroundColor Green
    } catch {
        Write-Host "  FAIL $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

$logoOrig.Dispose()
Write-Host "`nComposited logo onto $count files." -ForegroundColor Yellow
