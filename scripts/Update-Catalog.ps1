# Update all catalog JSON files to reference the rendered image paths
$catalogDir = "c:\Users\User\Desktop\PrintBox\catalog"
$files = Get-ChildItem $catalogDir -Filter "PB-*.json"
foreach ($f in $files) {
    $json = Get-Content $f.FullName -Raw | ConvertFrom-Json
    $id = $json.product_id
    $json.image_url_clean = "renders/${id}_clean.png"
    $json.image_url_branded_premium = "renders/${id}_branded.png"
    $json | ConvertTo-Json -Depth 10 | Out-File $f.FullName -Encoding utf8
    Write-Output "Updated $($f.Name)"
}

# Master catalog
$masterPath = Join-Path $catalogDir "_MASTER_catalog.json"
$master = Get-Content $masterPath -Raw | ConvertFrom-Json
foreach ($item in $master.items) {
    $id = $item.product_id
    $item.image_url_clean = "renders/${id}_clean.png"
    $item.image_url_branded_premium = "renders/${id}_branded.png"
}
$master | ConvertTo-Json -Depth 10 | Out-File $masterPath -Encoding utf8
Write-Output "Updated _MASTER_catalog.json"
