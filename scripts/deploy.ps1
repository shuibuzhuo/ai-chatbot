#!/usr/bin/env pwsh
# Next.js 部署脚本 - 压缩并上传 .next 目录

param(
    [string]$Server = "root@120.48.20.216",
    [string]$RemotePath = "/root/zhitalk/agent-build",
    [switch]$Upload = $false,
    [switch]$Clean = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Next.js 部署脚本" -ForegroundColor Cyan
Write-Host ""

# 检查 .next 目录是否存在
if (-not (Test-Path ".next")) {
    Write-Host "❌ 错误: .next 目录不存在！" -ForegroundColor Red
    Write-Host "   请先运行 'pnpm build' 构建项目" -ForegroundColor Yellow
    exit 1
}

# 检查是否已存在压缩包
$zipFile = ".next.zip"
if (Test-Path $zipFile) {
    if ($Clean) {
        Write-Host "🗑️  删除已存在的压缩包..." -ForegroundColor Yellow
        Remove-Item $zipFile -Force
    } else {
        Write-Host "⚠️  警告: $zipFile 已存在" -ForegroundColor Yellow
        $response = Read-Host "是否覆盖? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Host "❌ 操作已取消" -ForegroundColor Red
            exit 0
        }
        Remove-Item $zipFile -Force
    }
}

# 计算 .next 目录大小
Write-Host "📊 分析 .next 目录..." -ForegroundColor Cyan
$nextSize = (Get-ChildItem .next -Recurse -File | Measure-Object -Property Length -Sum).Sum
$nextSizeMB = [math]::Round($nextSize / 1MB, 2)
$fileCount = (Get-ChildItem .next -Recurse -File).Count

Write-Host "   文件数量: $fileCount" -ForegroundColor Gray
Write-Host "   目录大小: $nextSizeMB MB" -ForegroundColor Gray
Write-Host ""

# 压缩 .next 目录
Write-Host "📦 正在压缩 .next 目录..." -ForegroundColor Cyan
$startTime = Get-Date

try {
    Compress-Archive -Path .next -DestinationPath $zipFile -Force -CompressionLevel Optimal
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    # 计算压缩后大小
    $zipSize = (Get-Item $zipFile).Length
    $zipSizeMB = [math]::Round($zipSize / 1MB, 2)
    $compressionRatio = [math]::Round((1 - $zipSize / $nextSize) * 100, 1)
    
    Write-Host "✅ 压缩完成！" -ForegroundColor Green
    Write-Host "   压缩文件: $zipFile" -ForegroundColor Gray
    Write-Host "   压缩大小: $zipSizeMB MB" -ForegroundColor Gray
    Write-Host "   压缩率: $compressionRatio%" -ForegroundColor Gray
    Write-Host "   耗时: $([math]::Round($duration, 2)) 秒" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "❌ 压缩失败: $_" -ForegroundColor Red
    exit 1
}

# 上传到服务器
if ($Upload) {
    Write-Host "📤 正在上传到服务器..." -ForegroundColor Cyan
    Write-Host "   服务器: $Server" -ForegroundColor Gray
    Write-Host "   目标路径: $RemotePath" -ForegroundColor Gray
    Write-Host ""
    
    try {
        # 上传压缩包
        scp $zipFile "${Server}:${RemotePath}/"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 上传成功！" -ForegroundColor Green
            Write-Host ""
            
            # 询问是否在服务器上解压
            $response = Read-Host "是否在服务器上解压? (Y/n)"
            if ($response -ne "n" -and $response -ne "N") {
                Write-Host "🔧 正在服务器上解压..." -ForegroundColor Cyan
                
                $sshCommand = "cd $RemotePath && unzip -q -o $zipFile && rm $zipFile && echo '解压完成' && ls -la | head -10"
                ssh $Server $sshCommand
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ 解压完成！" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  解压可能失败，请手动检查" -ForegroundColor Yellow
                }
            }
            
            # 询问是否删除本地压缩包
            $response = Read-Host "是否删除本地压缩包? (Y/n)"
            if ($response -ne "n" -and $response -ne "N") {
                Remove-Item $zipFile -Force
                Write-Host "✅ 本地压缩包已删除" -ForegroundColor Green
            }
        } else {
            Write-Host "❌ 上传失败！" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ 上传失败: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "💡 提示: 使用 -Upload 参数可以自动上传到服务器" -ForegroundColor Yellow
    Write-Host "   示例: .\scripts\deploy.ps1 -Upload" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✨ 完成！" -ForegroundColor Green

