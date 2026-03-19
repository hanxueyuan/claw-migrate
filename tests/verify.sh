#!/bin/bash

# ClawMigrate 测试验证脚本
# 用于本地快速验证功能

set -e

echo "╔════════════════════════════════════════════════════╗"
echo "║  ClawMigrate 测试验证                              ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL=0
PASSED=0
FAILED=0

# 测试函数
run_test() {
    local name=$1
    local command=$2
    
    TOTAL=$((TOTAL + 1))
    echo -n "测试 $TOTAL: $name ... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}通过${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}失败${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 检查 Node.js
echo "环境检查..."
node --version > /dev/null 2>&1 && echo "✓ Node.js 已安装" || echo "✗ Node.js 未安装"

# 进入项目目录
cd "$(dirname "$0")/.."

echo ""
echo "开始测试..."
echo ""

# ==================== 语法检查 ====================
echo "📋 语法检查..."

for file in src/*.js; do
    run_test "语法检查 $file" "node -c $file"
done

# ==================== 帮助命令 ====================
echo ""
echo "📋 帮助命令测试..."

run_test "显示帮助信息" "node src/index.js --help"

# ==================== 配置检查 ====================
echo ""
echo "📋 配置检查..."

# 检查配置文件是否存在（如果存在则测试）
if [ -f ~/.openclaw/claw-migrate/config.json ]; then
    run_test "配置文件有效" "node -e \"JSON.parse(require('fs').readFileSync('~/.openclaw/claw-migrate/config.json'))\""
else
    echo "⚠️  配置文件不存在（正常，首次使用需要 setup）"
fi

# ==================== 模块加载测试 ====================
echo ""
echo "📋 模块加载测试..."

run_test "加载 utils.js" "node -e \"require('./src/utils.js')\""
run_test "加载 config.js" "node -e \"require('./src/config.js')\""
run_test "加载 github.js" "node -e \"require('./src/github.js')\""
run_test "加载 merger.js" "node -e \"require('./src/merger.js')\""
run_test "加载 backup.js" "node -e \"require('./src/backup.js')\""
run_test "加载 restore.js" "node -e \"require('./src/restore.js')\""
run_test "加载 setup.js" "node -e \"require('./src/setup.js')\""

# ==================== 单元测试 ====================
echo ""
echo "📋 单元测试..."

if [ -d "tests/unit" ]; then
    for test in tests/unit/*.test.js; do
        if [ -f "$test" ]; then
            run_test "单元测试 $(basename $test)" "node $test"
        fi
    done
else
    echo "⚠️  单元测试目录不存在"
fi

# ==================== 总结 ====================
echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║  测试总结                                          ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "总测试数：$TOTAL"
echo -e "通过：${GREEN}$PASSED${NC}"
echo -e "失败：${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}❌ 有 $FAILED 个测试失败${NC}"
    exit 1
fi
