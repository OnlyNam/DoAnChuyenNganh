@echo off
chcp 65001 >nul
echo ========================================================
echo   KHOI DONG HE THONG QUAN LY DU AN SINH VIEN (StudentJira)
echo ========================================================

echo [1/3] Khoi dong Backend Server tai cong 4000...
start "StudentJira - Backend API (Port 4000)" cmd /k "cd /d D:\Tieuluanmonhoc_149\DoAnChuyenNganh\backend && npm run dev"

echo [2/3] Khoi dong Frontend Next.js tai cong 3000...
start "StudentJira - Frontend UI (Port 3000)" cmd /k "cd /d D:\Tieuluanmonhoc_149\DoAnChuyenNganh\frontend && npm run dev"

echo [3/3] Dang mo trinh duyet tai http://localhost:3000 ...
timeout /t 4 >nul
start http://localhost:3000

echo Hoan tat!
