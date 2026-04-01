#!/bin/bash

# RuleWord 外链提交 - 快速启动脚本
# 用法: ./start-submission.sh

echo "🚀 RuleWord 外链提交工具"
echo "========================"
echo ""

# 检查操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
    OPEN_CMD="open"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OPEN_CMD="xdg-open"
else
    echo "❌ 不支持的操作系统"
    exit 1
fi

# 低门槛平台列表（按推荐顺序）
declare -a platforms=(
    "Reddit r/SideProject|https://reddit.com/r/SideProject/submit"
    "Hacker News|https://news.ycombinator.com/submit"
    "Uneed|https://uneed.co/submit"
    "Dev Hunt|https://devhunt.org/submit"
    "Launched|https://launched.io/submit"
    "Toolbase|https://toolbase.io/submit"
    "BetaList|https://betalist.com/submit"
    "IndieHackers|https://indiehackers.com/post/new"
    "AlternativeTo|https://alternativeto.net/submit/"
)

# 显示菜单
echo "📱 选择要打开的平台（输入数字）："
echo ""
for i in "${!platforms[@]}"; do
    IFS='|' read -r name url <<< "${platforms[$i]}"
    echo "  $((i+1))) $name"
done
echo ""
echo "  a) 打开所有平台"
echo "  m) 查看提交物料"
echo "  q) 退出"
echo ""
read -p "请选择: " choice

if [[ "$choice" == "q" ]]; then
    echo "👋 再见！"
    exit 0
fi

if [[ "$choice" == "m" ]]; then
    echo ""
    echo "📄 提交物料文件："
    echo "   /Users/robert/ruleword/marketing/submissions/materials.md"
    echo ""
    # 尝试打开物料文件
    if command -v code &> /dev/null; then
        code /Users/robert/ruleword/marketing/submissions/materials.md
    elif command -v nano &> /dev/null; then
        nano /Users/robert/ruleword/marketing/submissions/materials.md
    else
        $OPEN_CMD /Users/robert/ruleword/marketing/submissions/materials.md
    fi
    exit 0
fi

if [[ "$choice" == "a" ]]; then
    echo ""
    echo "🌐 正在打开所有平台..."
    for platform in "${platforms[@]}"; do
        IFS='|' read -r name url <<< "$platform"
        echo "   ✓ $name"
        $OPEN_CMD "$url"
        sleep 0.5
    done
    echo ""
    echo "✅ 已打开所有平台！"
    echo ""
    echo "📄 提交物料请查看："
    echo "   /Users/robert/ruleword/marketing/submissions/materials.md"
    exit 0
fi

# 打开单个平台
if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#platforms[@]} ]; then
    index=$((choice-1))
    IFS='|' read -r name url <<< "${platforms[$index]}"
    echo ""
    echo "🌐 正在打开 $name..."
    $OPEN_CMD "$url"
    echo ""
    echo "📄 提交物料请查看："
    echo "   /Users/robert/ruleword/marketing/submissions/materials.md"
    exit 0
fi

echo "❌ 无效选择"
