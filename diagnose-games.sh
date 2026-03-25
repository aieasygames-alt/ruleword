#!/bin/bash

echo "=== 🔍 游戏诊断报告 ==="
echo ""

GAMES_DIR="/Users/robert/ruleword/astro-app/src/components/games"
CONTENT_DIR="/Users/robert/ruleword/astro-app/src/content/games"

echo "📊 统计信息:"
echo "- 游戏组件总数: $(ls "$GAMES_DIR"/*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo "- 内容JSON文件数: $(ls "$CONTENT_DIR"/*.json 2>/dev/null | wc -l | tr -d ' ')"
echo "- GameWrapper导入数: $(grep -c "import('./games/" "$GAMES_DIR"/../GameWrapper.tsx | tr -d ' ')"
echo ""

echo "🔍 检查结果:"
echo ""

# 1. 检查缺失的默认导出
echo "1️⃣ 检查默认导出:"
for file in "$GAMES_DIR"/*.tsx; do
  filename=$(basename "$file" .tsx)
  case "$filename" in Calendar|Feedback|GameGuide) continue;; esac

  if ! grep -q "export default" "$file" 2>/dev/null; then
    echo "   ❌ $filename - 缺少默认导出"
  fi
done
echo ""

# 2. 检查缺失的内容JSON
echo "2️⃣ 检查内容JSON文件:"
for file in "$GAMES_DIR"/*.tsx; do
  filename=$(basename "$file" .tsx)
  case "$filename" in Calendar|Feedback|GameGuide) continue;; esac

  # 转换文件名到slug格式
  if [[ "$filename" =~ ^([A-Z]) ]]; then
    # 将驼峰命名转换为kebab-case
    slug=$(echo "$filename" | sed 's/\([A-Z]\)/-\L\1/g' | sed 's/^-//')
  else
    slug="$filename"
  fi

  json_file="$CONTENT_DIR/${slug}.json"
  if [ ! -f "$json_file" ]; then
    echo "   ⚠️  $filename -> ${slug}.json (可能缺失)"
  fi
done
echo ""

# 3. 检查React导入
echo "3️⃣ 检查React导入:"
for file in "$GAMES_DIR"/*.tsx; do
  filename=$(basename "$file" .tsx)
  case "$filename" in Calendar|Feedback|GameGuide) continue;; esac

  if ! grep -q "import.*React" "$file" && ! grep -q "import.*react" "$file"; then
    echo "   ⚠️  $filename - 可能缺少React导入"
  fi
done
echo ""

# 4. 检查可能的TypeScript错误
echo "4️⃣ 检查常见问题:"
for file in "$GAMES_DIR"/*.tsx; do
  filename=$(basename "$file" .tsx)
  case "$filename" in Calendar|Feedback|GameGuide) continue;; esac

  # 检查是否有使用useState但没有导入
  if grep -q "useState" "$file" && ! grep -q "import.*useState" "$file"; then
    echo "   ⚠️  $filename - useState未导入"
  fi

  # 检查是否有使用useEffect但没有导入
  if grep -q "useEffect" "$file" && ! grep -q "import.*useEffect" "$file"; then
    echo "   ⚠️  $filename - useEffect未导入"
  fi
done
echo ""

echo "✅ 诊断完成"
