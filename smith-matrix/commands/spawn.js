#!/usr/bin/env node
// @smith-spawn: Spawn a child Smith
// Create a child Smith to handle a specific task
// { "argumentLabels": ["taskId"] }

const fs = require('fs');
const path = require('path');

const SMITH_MATRIX_DIR = '.smith-matrix';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getNextSmithId() {
  const smithsDir = path.join(SMITH_MATRIX_DIR, 'smiths');
  if (!fs.existsSync(smithsDir)) {
    return 'smith-001';
  }

  const existing = fs
    .readdirSync(smithsDir)
    .filter((d) => d.startsWith('smith-'))
    .map((d) => parseInt(d.replace('smith-', '')))
    .filter((n) => !isNaN(n));

  const max = existing.length > 0 ? Math.max(...existing) : 0;
  return `smith-${String(max + 1).padStart(3, '0')}`;
}

function readTaskFile(taskId) {
  const taskPath = path.join(SMITH_MATRIX_DIR, 'inbox', `${taskId}.md`);
  if (!fs.existsSync(taskPath)) {
    throw new Error(`Task file not found: ${taskPath}`);
  }
  return fs.readFileSync(taskPath, 'utf-8');
}

function generateSmithMd(smithId, parentId, level) {
  const smithCore = fs.readFileSync(
    path.join(__dirname, '..', 'smith.md'),
    'utf-8'
  );
  return smithCore
    .replace(/{SMITH_ID}/g, smithId)
    .replace(/{PARENT_ID}/g, parentId)
    .replace(/{LEVEL}/g, level.toString());
}

function generateStartGuide(smithId, taskId, parentId) {
  return `# 史密斯启动指南

你是 **${smithId}** (子史密斯)

## 你的任务
读取任务文件: ../../inbox/${taskId}.md

## 你的父史密斯
${parentId}

## 下一步
1. 阅读上述任务文件
2. 决定是否需要进一步分解
3. 执行任务或创建子任务

## 输出位置
将你的最终结果写入: outbox/result.md

父史密斯会读取你的结果并汇总。
`;
}

function main() {
  const taskId = process.argv[2];

  if (!taskId) {
    console.error('Usage: /smith-spawn <task-id>');
    console.error('Example: /smith-spawn task-1234567890');
    process.exit(1);
  }

  // 确定父史密斯（谁创建了这个任务）
  const taskContent = readTaskFile(taskId);
  const smithMatch = taskContent.match(/\*\*所属史密斯\*\*:\s*(.+)/);
  const parentId = smithMatch ? smithMatch[1].trim() : 'smith-root';

  // 生成新的史密斯ID
  const smithId = getNextSmithId();

  // 解析层级
  const levelMatch = taskContent.match(/\*\*层级\*\*:\s*(\d+)/);
  const level = levelMatch ? parseInt(levelMatch[1]) : 1;

  console.log(`🔄 创建子史密斯: ${smithId}`);
  console.log(`📋 任务: ${taskId}`);
  console.log(`👤 父史密斯: ${parentId}`);

  // 创建子史密斯目录
  const smithDir = path.join(SMITH_MATRIX_DIR, 'smiths', smithId);
  const dirs = [
    path.join(smithDir, 'private'),
    path.join(smithDir, 'outbox'),
    path.join(smithDir, 'children'),
  ];

  dirs.forEach(ensureDir);

  // 复制 smith.md
  const smithMdPath = path.join(smithDir, 'smith.md');
  fs.writeFileSync(smithMdPath, generateSmithMd(smithId, parentId, level));

  // 创建启动指南
  const guidePath = path.join(smithDir, 'private', 'START_HERE.md');
  fs.writeFileSync(guidePath, generateStartGuide(smithId, taskId, parentId));

  // 更新任务状态为处理中
  const taskPath = path.join(SMITH_MATRIX_DIR, 'inbox', `${taskId}.md`);
  let updatedTask = fs.readFileSync(taskPath, 'utf-8');
  updatedTask = updatedTask.replace(
    '- [ ] 待处理',
    '- [x] 待处理\n- [x] 处理中'
  );
  updatedTask = updatedTask.replace(
    '## 状态',
    `## 分配的史密斯
- **史密斯ID**: ${smithId}
- **激活时间**: ${new Date().toISOString()}

## 状态`
  );
  fs.writeFileSync(taskPath, updatedTask);

  console.log('');
  console.log(`✅ 子史密斯 ${smithId} 已创建!`);
  console.log('');
  console.log('📁 工作目录:');
  console.log(`  ${SMITH_MATRIX_DIR}/smiths/${smithId}/`);
  console.log('  ├── smith.md      (史密斯定义)');
  console.log('  ├── private/      (私有工作区)');
  console.log('  │   └── START_HERE.md');
  console.log('  ├── outbox/       (输出结果 → 父读取)');
  console.log('  └── children/     (子史密斯目录)');
  console.log('');
  console.log(`🚀 ${smithId} 启动指令:`);
  console.log(`  1. Read ${SMITH_MATRIX_DIR}/smiths/${smithId}/private/START_HERE.md`);
  console.log(`  2. Read ${SMITH_MATRIX_DIR}/inbox/${taskId}.md`);
  console.log(`  3. 执行任务`);
  console.log(`  4. Write result to ${SMITH_MATRIX_DIR}/smiths/${smithId}/outbox/result.md`);
}

main();
