# =====================================================
# Script: Test Admin Upgrade API (PowerShell)
# Description: Tests the admin upgrade user endpoint
# =====================================================

# Configuration
$ApiUrl = "http://localhost:3000/api/admin/upgrade-user"
$TargetUserId = "replace-with-target-user-id"

Write-Host "`nTesting Admin Upgrade API" -ForegroundColor Yellow
Write-Host "==========================================="

# Test 1: Upgrade to PRO with expiration
Write-Host "`nTest 1: Upgrade user to PRO tier" -ForegroundColor Yellow
$ExpireDate = (Get-Date).AddDays(30).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
Write-Host "Expiration date: $ExpireDate"

$Body1 = @{
    targetUserId = $TargetUserId
    tier = "PRO"
    expireAt = $ExpireDate
} | ConvertTo-Json

try {
    $Response1 = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $Body1 -ContentType "application/json"
    Write-Host "Response: $($Response1 | ConvertTo-Json -Depth 10)" -ForegroundColor Cyan

    if ($Response1.success) {
        Write-Host "✓ PRO upgrade successful" -ForegroundColor Green
    } else {
        Write-Host "✗ PRO upgrade failed" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Test 2: Upgrade to VIP (lifetime)
Write-Host "`nTest 2: Upgrade user to VIP tier" -ForegroundColor Yellow

$Body2 = @{
    targetUserId = $TargetUserId
    tier = "VIP"
    expireAt = $null
} | ConvertTo-Json

try {
    $Response2 = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $Body2 -ContentType "application/json"
    Write-Host "Response: $($Response2 | ConvertTo-Json -Depth 10)" -ForegroundColor Cyan

    if ($Response2.success) {
        Write-Host "✓ VIP upgrade successful" -ForegroundColor Green
    } else {
        Write-Host "✗ VIP upgrade failed" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

# Test 3: Invalid tier
Write-Host "`nTest 3: Try invalid tier (should fail)" -ForegroundColor Yellow

$Body3 = @{
    targetUserId = $TargetUserId
    tier = "INVALID"
    expireAt = $null
} | ConvertTo-Json

try {
    $Response3 = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $Body3 -ContentType "application/json" -ErrorAction Stop
    Write-Host "✗ Should have rejected invalid tier" -ForegroundColor Red
} catch {
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Cyan
    Write-Host "✓ Correctly rejected invalid tier" -ForegroundColor Green
}

# Test 4: PRO without expiration (should fail)
Write-Host "`nTest 4: PRO tier without expireAt (should fail)" -ForegroundColor Yellow

$Body4 = @{
    targetUserId = $TargetUserId
    tier = "PRO"
    expireAt = $null
} | ConvertTo-Json

try {
    $Response4 = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $Body4 -ContentType "application/json" -ErrorAction Stop
    Write-Host "✗ Should have rejected PRO without expireAt" -ForegroundColor Red
} catch {
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Cyan
    Write-Host "✓ Correctly rejected PRO without expireAt" -ForegroundColor Green
}

Write-Host "`n==========================================="
Write-Host "Testing complete!`n" -ForegroundColor Yellow
