# PrintBox - Direct Gemini Image Generation
# Calls gemini-2.5-flash-image-preview REST endpoint and saves PNG output.

param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [Parameter(Mandatory=$true)][string]$Prompt,
    [Parameter(Mandatory=$true)][string]$OutputPath,
    [string]$Model = "gemini-2.5-flash-image-preview"
)

$ErrorActionPreference = "Stop"

$endpoint = "https://generativelanguage.googleapis.com/v1beta/models/$Model" + ":generateContent?key=$ApiKey"

$body = @{
    contents = @(
        @{
            parts = @(
                @{ text = $Prompt }
            )
        }
    )
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

# Walk response to find inlineData (base64 image)
$imageData = $null
if ($response.candidates) {
    foreach ($cand in $response.candidates) {
        if ($cand.content -and $cand.content.parts) {
            foreach ($part in $cand.content.parts) {
                if ($part.inlineData -and $part.inlineData.data) {
                    $imageData = $part.inlineData.data
                    break
                }
                if ($part.inline_data -and $part.inline_data.data) {
                    $imageData = $part.inline_data.data
                    break
                }
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

# Save PNG
$bytes = [System.Convert]::FromBase64String($imageData)
$parent = Split-Path -Parent $OutputPath
if ($parent -and -not (Test-Path $parent)) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
[System.IO.File]::WriteAllBytes($OutputPath, $bytes)
Write-Output "OK -> $OutputPath ($($bytes.Length) bytes)"
