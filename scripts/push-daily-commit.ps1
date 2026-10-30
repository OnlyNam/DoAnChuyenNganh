param(
    [int]$Count = 1
)

Set-Location "D:\Tieuluanmonhoc_149\DoAnChuyenNganh"

$unpushed = @(git rev-list --reverse origin/main..HEAD)

if ($unpushed.Count -eq 0) {
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "[OK] Tat ca cac commit hien tai da duoc day len GitHub!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    exit 0
}

$pushIndex = [Math]::Min($Count, $unpushed.Count) - 1
$targetCommit = $unpushed[$pushIndex]
$commitMsg = git log -1 --format="%h | %ai | %s" $targetCommit

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Hang doi hien co $($unpushed.Count) commit chua day len GitHub." -ForegroundColor Cyan
Write-Host "Dang day $Count commit cua hom nay len GitHub:" -ForegroundColor Yellow
Write-Host "  -> $commitMsg" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

git push origin "$($targetCommit):main"

$remaining = $unpushed.Count - ($pushIndex + 1)
Write-Host ""
Write-Host "[THANH CONG] Da day $Count commit len GitHub! Con lai $remaining commit trong hang doi cho cac ngay tiep theo." -ForegroundColor Green
