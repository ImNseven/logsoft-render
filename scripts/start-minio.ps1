$env:MINIO_ROOT_USER = "minioadmin"
$env:MINIO_ROOT_PASSWORD = "minioadmin"

$MinioExe = "d:\minio\minio.exe"
$DataDir = "d:\minio\data"

if (-not (Test-Path $MinioExe)) {
    Write-Error "minio.exe не найден по пути $MinioExe. Скачай: https://dl.min.io/server/minio/release/windows-amd64/minio.exe"
    exit 1
}

if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir | Out-Null
}

Write-Host "MinIO API:     http://localhost:9000"
Write-Host "MinIO Console: http://localhost:9001 (логин $env:MINIO_ROOT_USER)"

& $MinioExe server $DataDir --console-address ":9001"
