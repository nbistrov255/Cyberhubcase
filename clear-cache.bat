@echo off
REM Скрипт для очистки кэша Vite (Windows)
REM Использование: clear-cache.bat

echo.
echo 🧹 Очистка кэша Vite...
echo.

REM Удалить кэш Vite
if exist "node_modules\.vite" (
  rmdir /s /q "node_modules\.vite"
  echo ✅ Кэш Vite удален
) else (
  echo ⚠️  Кэш Vite не найден
)

REM Удалить папку dist
if exist "dist" (
  rmdir /s /q "dist"
  echo ✅ Папка dist удалена
) else (
  echo ⚠️  Папка dist не найдена
)

echo.
echo ✨ Кэш очищен!
echo.
echo Теперь запустите сервер:
echo   npm run dev
echo.
echo И обновите браузер: Ctrl+Shift+R
echo.
pause
