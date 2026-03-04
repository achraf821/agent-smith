#!/usr/bin/env node
// @smith-init: Initialize Smith Matrix
// Initialize the Smith Matrix with a root task
// { "argumentLabels": ["taskDescription"] }

const fs = require('fs');
const path = require('path');

const SMITH_MATRIX_DIR = '.smith-matrix';
const TASK_ID = `task-${Date.now()}`;
const TIMESTAMP = new Date().toISOString();

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateTaskFile(description) {
  return `# 任务: ${description.slice(0, 50)}${description.length > 50 ? '...' : ''}

## 任务信息
- **任务ID**: ${TASK_ID}
- **所属史密斯**: smith-root
- **父任务ID**: none
- **创建时间**: ${TIMESTAMP}
- **层级**: 0

## 任务描述
${description}

## 输入上下文
这是根任务，由用户直接创建。作为根史密斯，你需要：
1. 分析任务的复杂度和可分解性
2. 如可分解，拆分为 2-4 个并行的子任务
3. 为每个子任务创建子史密斯
4. 汇总所有子结果，生成最终报告

## 期望输出
一份结构化的研究报告或解决方案文档。

## 完成标准
- [ ] 任务分析完成
- [ ] 子任务创建（如需）
- [ ] 子结果汇总（如需）
- [ ] 最终结果写入 results/final.md

## 状态
- [x] 待处理
- [ ] 处理中
- [ ] 已完成
`;
}

function generateSmithMd() {
  const smithCore = fs.readFileSync(
    path.join(__dirname, '..', 'smith.md'),
    'utf-8'
  );
  return smithCore
    .replace('{SMITH_ID}', 'smith-root')
    .replace('{PARENT_ID}', 'none')
    .replace('{LEVEL}', '0');
}

function main() {
  const taskDescription = process.argv[2];

  if (!taskDescription) {
    console.error('Usage: /smith-init "任务描述"');
    console.error('Example: /smith-init "分析AI Agent市场现状"');
    process.exit(1);
  }

  console.log('🔄 初始化史密斯矩阵...');
  console.log(`📋 任务: ${taskDescription}`);

  // 创建目录结构
  const dirs = [
    SMITH_MATRIX_DIR,
    path.join(SMITH_MATRIX_DIR, 'inbox'),
    path.join(SMITH_MATRIX_DIR, 'smiths', 'smith-root', 'private'),
    path.join(SMITH_MATRIX_DIR, 'smiths', 'smith-root', 'outbox'),
    path.join(SMITH_MATRIX_DIR, 'smiths', 'smith-root', 'children'),
    path.join(SMITH_MATRIX_DIR, 'results'),
  ];

  dirs.forEach(ensureDir);

  // 复制 smith.md 到根目录
  const smithMdPath = path.join(SMITH_MATRIX_DIR, 'smith.md');
  fs.writeFileSync(smithMdPath, generateSmithMd());
  console.log('✅ 创建史密斯定义');

  // 创建任务文件
  const taskPath = path.join(SMITH_MATRIX_DIR, 'inbox', `${TASK_ID}.md`);
  fs.writeFileSync(taskPath, generateTaskFile(taskDescription));
  console.log(`✅ 创建任务: ${TASK_ID}`);

  // 创建根史密斯私有工作区的启动指南
  const guidePath = path.join(
    SMITH_MATRIX_DIR,
    'smiths',
    'smith-root',
    'private',
    'START_HERE.md'
  );
  fs.writeFileSync(
    guidePath,
    `# 史密斯启动指南

你是 **smith-root** (根史密斯)

## 你的任务
读取任务文件: inbox/${TASK_ID}.md

## 下一步
1. 阅读上述任务文件
2. 决定是否需要分解
3. 执行任务或创建子任务

## 输出位置
将你的最终结果写入: outbox/result.md

完成后，结果会被汇总到: results/final.md
`);

  console.log('');
  console.log('✨ 史密斯矩阵已初始化!');
  console.log('');
  console.log('📁 目录结构:');
  console.log(`  ${SMITH_MATRIX_DIR}/`);
  console.log('  ├── smith.md          (史密斯定义)');
  console.log(`  ├── inbox/${TASK_ID}.md  (任务文件)`);
  console.log('  └── smiths/smith-root/  (你的工作区)');
  console.log('      ├── private/      (私有工作区)');
  console.log('      │   └── START_HERE.md');
  console.log('      ├── outbox/       (输出结果)');
  console.log('      └── children/     (子史密斯)');
  console.log('');
  console.log('🚀 作为 smith-root 开始工作:');
  console.log('  1. 读取任务: Read .smith-matrix/inbox/' + TASK_ID + '.md');
  console.log('  2. 执行或分解任务');
  console.log('  3. 输出结果到: .smith-matrix/smiths/smith-root/outbox/result.md');
  console.log('');
  console.log('如需查看状态，运行: /smith-status');
}

main();
