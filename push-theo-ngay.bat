@echo off
chcp 65001 >nul
powershell -ExecutionPolicy Bypass -File "D:\Tieuluanmonhoc_149\DoAnChuyenNganh\scripts\push-daily-commit.ps1" -Count 1
pause
