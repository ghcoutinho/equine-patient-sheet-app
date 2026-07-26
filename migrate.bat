@echo off
set SRC_DIR=C:\Users\ghcou\.gemini\antigravity\scratch\equine-patient-sheet-app\src
set DL_DIR=C:\Users\ghcou\Downloads\equine-patient-sheet\src

echo Backing up current files...
mkdir "%SRC_DIR%\_backup"
xcopy /E /I /Y "%SRC_DIR%\components" "%SRC_DIR%\_backup\components"
copy /Y "%SRC_DIR%\types.ts" "%SRC_DIR%\_backup\types.ts"
copy /Y "%SRC_DIR%\App.tsx" "%SRC_DIR%\_backup\App.tsx"
copy /Y "%SRC_DIR%\main.tsx" "%SRC_DIR%\_backup\main.tsx"
copy /Y "%SRC_DIR%\index.css" "%SRC_DIR%\_backup\index.css"
copy /Y "C:\Users\ghcou\.gemini\antigravity\scratch\equine-patient-sheet-app\vite.config.ts" "%SRC_DIR%\_backup\vite.config.ts"

echo Copying new UI architecture...
xcopy /E /I /Y "%DL_DIR%\components" "%SRC_DIR%\components"
copy /Y "%DL_DIR%\types.ts" "%SRC_DIR%\types.ts"
copy /Y "%DL_DIR%\App.tsx" "%SRC_DIR%\App.tsx"
copy /Y "%DL_DIR%\main.tsx" "%SRC_DIR%\main.tsx"
copy /Y "%DL_DIR%\index.css" "%SRC_DIR%\index.css"
copy /Y "C:\Users\ghcou\Downloads\equine-patient-sheet\vite.config.ts" "C:\Users\ghcou\.gemini\antigravity\scratch\equine-patient-sheet-app\vite.config.ts"

echo Done!
