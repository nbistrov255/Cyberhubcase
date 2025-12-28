#!/bin/bash

# Скрипт диагностики проблем с Tailwind CSS
# Использование: bash diagnose.sh

echo "🔍 ДИАГНОСТИКА TAILWIND CSS V4"
echo "================================"
echo ""

# Проверка 1: Node.js версия
echo "1️⃣  Версия Node.js:"
node --version
echo ""

# Проверка 2: npm версия
echo "2️⃣  Версия npm:"
npm --version
echo ""

# Проверка 3: Tailwind установлен
echo "3️⃣  Версия Tailwind CSS:"
if [ -f "package.json" ]; then
  grep -A 1 '"tailwindcss"' package.json
else
  echo "❌ package.json не найден!"
fi
echo ""

# Проверка 4: Vite plugin установлен
echo "4️⃣  Vite плагин Tailwind:"
if [ -f "package.json" ]; then
  grep -A 1 '"@tailwindcss/vite"' package.json
else
  echo "❌ package.json не найден!"
fi
echo ""

# Проверка 5: Существование файлов
echo "5️⃣  Проверка файлов:"

files=(
  "src/main.tsx"
  "src/styles/index.css"
  "src/styles/tailwind.css"
  "vite.config.ts"
  "postcss.config.mjs"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file ОТСУТСТВУЕТ!"
  fi
done
echo ""

# Проверка 6: Содержимое tailwind.css
echo "6️⃣  Содержимое src/styles/tailwind.css:"
if [ -f "src/styles/tailwind.css" ]; then
  cat src/styles/tailwind.css
else
  echo "❌ Файл не найден!"
fi
echo ""

# Проверка 7: Первая строка main.tsx
echo "7️⃣  Первая строка src/main.tsx:"
if [ -f "src/main.tsx" ]; then
  head -n 1 src/main.tsx
else
  echo "❌ Файл не найден!"
fi
echo ""

# Проверка 8: Кэш Vite
echo "8️⃣  Кэш Vite:"
if [ -d "node_modules/.vite" ]; then
  echo "  ⚠️  КЭШВИТЕ СУЩЕСТВУЕТ - рекомендуется очистить!"
  echo "  Размер: $(du -sh node_modules/.vite 2>/dev/null | cut -f1)"
else
  echo "  ✅ Кэш отсутствует (норма после очистки)"
fi
echo ""

# Проверка 9: НЕ должен существовать tailwind.config.ts
echo "9️⃣  Проверка tailwind.config.ts (НЕ должен существовать для v4):"
if [ -f "tailwind.config.ts" ] || [ -f "tailwind.config.js" ]; then
  echo "  ❌ НАЙДЕН! Удалите его - он конфликтует с Tailwind v4!"
else
  echo "  ✅ Отсутствует (правильно для v4)"
fi
echo ""

# Итоговая рекомендация
echo "================================"
echo "📋 РЕКОМЕНДАЦИИ:"
echo ""

if [ -d "node_modules/.vite" ]; then
  echo "1. Очистите кэш Vite:"
  echo "   rm -rf node_modules/.vite dist"
  echo ""
fi

if [ -f "tailwind.config.ts" ] || [ -f "tailwind.config.js" ]; then
  echo "2. УДАЛИТЕ tailwind.config.ts (несовместим с v4!):"
  echo "   rm tailwind.config.ts"
  echo ""
fi

echo "3. Перезапустите сервер:"
echo "   npm run dev"
echo ""

echo "4. Жесткая перезагрузка браузера:"
echo "   Ctrl+Shift+R (Windows/Linux) или Cmd+Shift+R (Mac)"
echo ""

echo "================================"
