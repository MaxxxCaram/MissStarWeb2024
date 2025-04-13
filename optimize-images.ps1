# Optimizar JPG y PNG
Get-ChildItem -Recurse -Include *.jpg,*.jpeg,*.png | ForEach-Object {
    $output = $_.FullName -replace $_.Extension, "_opt$($_.Extension)"
    sharp $_.FullName -o $output resize 1920 1080 fit inside
    sharp $output -o $_.FullName compress
    Remove-Item $output
    Write-Host "✅ Optimizada: $($_.Name)"
}

# Convertir a WebP
Get-ChildItem -Recurse -Include *.jpg,*.jpeg,*.png | ForEach-Object {
    $output = $_.FullName -replace $_.Extension, ".webp"
    sharp $_.FullName -o $output toFormat webp
    Write-Host "✅ Convertida a WebP: $($_.Name)"
}

Write-Host "`n🎉 Optimización completada!" 