@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title نظام الطيبات — الدليل التفاعلي
cd /d "%~dp0"

echo.
echo  ================================================
echo   نظام الطيبات - الدليل التفاعلي (local dev)
echo  ================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo  [!] Node.js غير مثبت. حمّله من https://nodejs.org ثم أعد التشغيل.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo  [*] تثبيت الاعتماديات لأول مرة... (قد يستغرق دقيقة)
  call npm install
  if errorlevel 1 (
    echo  [!] فشل التثبيت. راجع الرسائل أعلاه.
    pause
    exit /b 1
  )
) else (
  echo  [OK] الاعتماديات موجودة.
)

echo  [*] تشغيل خادم التطوير وفتح المتصفح تلقائياً...
echo      اضغط Ctrl+C لإيقافه.
echo.

call npm run dev -- --open
if errorlevel 1 (
  echo.
  echo  [!] توقف الخادم أو حدث خطأ.
  pause
)
