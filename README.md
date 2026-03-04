# Agent Smith Matrix

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 递归自相似多智能体系统 —— 通过目录隔离协议实现无冲突的并行任务分解与执行

## 简介

**Agent Smith Matrix**（史密斯矩阵）是一个 Claude Code 插件，实现了递归自相似的多智能体系统。它通过严格的目录隔离协议，让多个 AI Agent 能够并行工作，无冲突地协作完成复杂任务。

核心设计理念：
- **自相似性**：每个智能体（史密斯）都遵循相同的协议，可递归创建子智能体
- **无冲突并行**：通过目录隔离确保多 Agent 同时工作时互不干扰
- **任务分解**：自动将复杂任务拆分为可并行的子任务

## 快速开始

### 安装

将 `smith-matrix` 目录复制到 Claude Code 的 skills 目录：

```bash
# macOS / Linux
cp -r smith-matrix ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse smith-matrix $env:USERPROFILE\.claude\skills\
```

### 使用方法

1. **触发 Smith Matrix Skill**

   在 Claude Code 中输入以下任一指令：
   - "创建多智能体系统"
   - "设置智能体矩阵"
   - "分解任务并行执行"

2. **定义任务**

   描述你需要完成的复杂任务，例如：
   > "帮我进行 AI Agent 市场研究，需要了解市场趋势、主要厂商、技术发展和应用场景"

3. **观察执行**

   Smith Matrix 会自动：
   - 初始化工作目录 `.smith-matrix/`
   - 分析任务并决定分解策略
   - 创建子智能体并行执行
   - 汇总结果生成最终报告

## 核心概念

### 史密斯 (Smith)

自相似的智能体单元，每个史密斯拥有：
- 唯一 ID（如 `smith-root`、`smith-001`）
- 层级标识（Level 0 为根，逐级递增）
- 父史密斯引用（根史密斯无父）

### 目录隔离协议

```
.smith-matrix/
├── inbox/                 # 任务队列（父写子读）
├── smiths/
│   ├── smith-root/        # 根智能体
│   │   ├── smith.md       # 智能体定义
│   │   ├── private/       # 私有工作区
│   │   ├── outbox/        # 结果输出
│   │   └── children/      # 子智能体目录
│   └── smith-001/         # 子智能体
│       ├── smith.md
│       ├── private/
│       ├── outbox/
│       └── children/
└── results/
    └── final.md           # 最终结果
```

**写约束规则**：
- ✅ 可以写入自己的 `private/` 和 `outbox/`
- ✅ 可以写入 `children/` 创建子智能体
- ✅ 可以写入 `inbox/` 创建子任务
- ❌ 禁止写入其他智能体的目录

## 执行流程

```
读取 inbox/ 任务
    ↓
分析任务复杂度
    ↓
┌─────────────┴─────────────┐
↓                           ↓
可直接完成              需要分解
    ↓                           ↓
执行任务              设计子任务
    ↓                           ↓
写入 outbox/          创建 inbox/ 子任务
    ↓                           ↓
结束                  创建子智能体
                              ↓
                        等待子结果
                              ↓
                        汇总结果
                              ↓
                        写入 outbox/
                              ↓
                        结束
```

## 示例场景

### 市场研究

将复杂的 AI Agent 市场研究任务分解为 4 个并行子任务：
1. 市场趋势分析
2. 主要厂商调研
3. 技术发展追踪
4. 应用场景研究

→ [查看完整示例](./smith-matrix/examples/market-research.md)

### 代码重构

将大规模代码重构分解为模块级别的并行处理：
1. 数据层重构
2. 业务逻辑层重构
3. API 接口层重构
4. 前端组件重构

## 项目结构

```
smith-matrix/
├── SKILL.md              # Skill 定义（主入口）
├── smith.md              # 史密斯核心提示词模板
├── examples/             # 使用示例
│   ├── market-research.md
│   └── code-refactor.md
├── references/           # 参考资料
│   ├── concepts.md
│   ├── protocol.md
│   └── best-practices.md
└── templates/            # 文件模板
```

## 适用场景

- ✅ 需要多维度分析的复杂研究任务
- ✅ 可并行处理的批量数据处理
- ✅ 需要多领域专业知识的综合项目
- ✅ 大规模代码审查或重构
- ✅ 内容创作的分布式协作

## 最佳实践

1. **任务分解粒度**：每个子任务应该在 1-4 小时内可完成
2. **独立性优先**：子任务之间应尽量低耦合，减少依赖
3. **明确输入输出**：每个任务都应有清晰的输入定义和输出格式
4. **及时汇总**：子任务完成后应尽快汇总，避免信息丢失

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

[MIT](LICENSE) © 2026 Chen Yijun
