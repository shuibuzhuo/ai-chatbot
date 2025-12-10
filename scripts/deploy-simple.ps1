#!/usr/bin/env pwsh
# 简化版：仅压缩 .next 目录

$ErrorActionPreference = "Stop"

Write-Host "📦 压缩 .next 目录..." -ForegroundColor Cyan

# 检查 .next 目录
if (-not (Test-Path ".next")) {
    Write-Host "❌ .next 目录不存在！" -ForegroundColor Red
    exit 1
}

# 删除已存在的压缩包
if (Test-Path ".next.zip") {
    Remove-Item ".next.zip" -Force
}

# 压缩
Write-Host "正在压缩..." -ForegroundColor Gray
$startTime = Get-Date
Compress-Archive -Path .next -DestinationPath .next.zip -Force -CompressionLevel Optimal
$duration = (Get-Date) - $startTime

# 显示结果
$originalSize = (Get-ChildItem .next -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
$zipSize = (Get-Item .next.zip).Length / 1MB

Write-Host "✅ 压缩完成！" -ForegroundColor Green
Write-Host "   原始大小: $([math]::Round($originalSize, 2)) MB" -ForegroundColor Gray
Write-Host "   压缩大小: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Gray
Write-Host "   压缩率: $([math]::Round((1 - $zipSize/$originalSize) * 100, 1))%" -ForegroundColor Gray
Write-Host "   耗时: $([math]::Round($duration.TotalSeconds, 2)) 秒" -ForegroundColor Gray

