# PrintBox - Direct Gemini Image Generation (supports optional reference image)
param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [Parameter(Mandatory=$true)][string]$Prompt,
    [Parameter(Mandatory=$true)][string]$OutputPath,
    [string]$Model = "gemini-3-pro-image-preview",
    [string]$ReferenceImage = ""
)

$ErrorActionPreference = "Stop"

$endpoint = "https://generativelanguage.googleapis.com/v1beta/models/$Model" + ":generateContent?key=$ApiKey"

# Build parts: text always, plus reference image if provided
$parts = @(
    @{ text = $Prompt }
)
if ($ReferenceImage -and (Test-Path $ReferenceImage)) {
    $refBytes = [System.IO.File]::ReadAllBytes($ReferenceImage)
    $refB64 = [System.Convert]::ToBase64String($refBytes)
    $ext = [System.IO.Path]::GetExtension($ReferenceImage).TrimStart('.').ToLower()
    $mime = if ($ext -in @("jpg","jpeg")) { "image/jpeg" } elseif ($ext -eq "png") { "image/png" } else { "image/$ext" }
    $parts += @{ inlineData = @{ mimeType = $mime; data = $refB64 } }
}

$body = @{
    contents = @( @{ parts = $parts } )
    generationConfig = @{
        responseModalities = @("IMAGE")
    }
} | ConvertTo-Json -Depth 10 -Compress

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -ContentType "application/json" -Body $body -TimeoutSec 120
} catch {
    Write-Error "API call failed: $($_.Exception.Message)"
    if ($_.ErrorDetails) { Write-Error $_.ErrorDetails.Message }
    exit 1
}

$imageData = $null
if ($response.candidates) {
    foreach ($cand in $response.candidates) {
        if ($cand.content -and $cand.content.parts) {
            foreach ($part in $cand.content.parts) {
                if ($part.inlineData -and $part.inlineData.data) { $imageData = $part.inlineData.data; break }
                if ($part.inline_data -and $part.inline_data.data) { $imageData = $part.inline_data.data; break }
            }
        }
        if ($imageData) { break }
    }
}

if (-not $imageData) {
    Write-Error "No image data in response."
    Write-Output ($response | ConvertTo-Json -Depth 10)
    exit 2
}

$bytes = [System.Convert]::FromBase64String($imageData)
$parent = Split-Path -Parent $OutputPath
if ($parent -and -not (Test-Path $parent)) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
[System.IO.File]::WriteAllBytes($OutputPath, $bytes)
Write-Output "OK -> $OutputPath ($($bytes.Length) bytes)"
