# 史密斯矩阵 (Smith Matrix)

一个递归自相似多智能体系统 Skill，实现无冲突的并行任务分解与执行。

## 核心概念

**史密斯 (Smith)**: 自相似智能体单元，每个史密斯可以：
- 执行任务
- 分解任务为子任务
- 创建子史密斯处理子任务
- 汇总子结果

**无冲突协议**: 通过目录隔离确保并行安全

## 安装

将此目录复制到你的 Claude Code skills 目录：
```bash
cp -r skills/smith-matrix ~/.claude/skills/
```

## 命令

| 命令 | 功能 |
|------|------|
| `/smith-init "任务描述"` | 初始化矩阵，创建根任务 |
| `/smith-spawn <task-id>` | 创建子史密斯（内部使用） |
| `/smith-status` | 查看矩阵执行状态 |

## 快速开始

```bash
# 初始化矩阵并创建根任务
/smith-init "分析AI Agent市场现状，输出研究报告"

# 查看执行状态
/smith-status
```

## 目录结构

运行时生成的工作目录：

```
.smith-matrix/
├── smith.md              # 只读：史密斯定义
├── inbox/                # 任务队列（父写，子读）
├── smiths/
│   ├── smith-root/       # 根史密斯
│   │   ├── private/      # 私有工作区
│   │   ├── outbox/       # 输出给父的结果
│   │   └── children/     # 子史密斯目录
│   └── smith-001/
└── results/
    └── final.md          # 最终结果
```

## 无冲突协议

1. **写隔离**: 每个史密斯只在自己的 `private/` 和 `outbox/` 里写
2. **父管生**: 只有父史密斯能创建子目录
3. **队列消费**: `inbox/` 任务被读取后即标记为处理中
4. **只读复制**: `smith.md` 只读复制到子目录

## 工作原理

1. `/smith-init` 创建 `.smith-matrix/` 工作目录和根任务
2. 根史密斯分析任务，决定是否需要分解
3. 如需分解，创建子任务到 `inbox/`，然后调用 `/smith-spawn` 创建子史密斯
4. 子史密斯并行处理，将结果写入各自的 `outbox/`
5. 父史密斯汇总子结果，输出到 `results/final.md`
