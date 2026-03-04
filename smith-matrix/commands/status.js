#!/usr/bin/env node
// @smith-status: Show Smith Matrix status
// Display current execution status of the matrix

const fs = require('fs');
const path = require('path');

const SMITH_MATRIX_DIR = '.smith-matrix';

function getTaskStatus(taskContent) {
  if (taskContent.includes('- [x] 已完成')) return 'completed';
  if (taskContent.includes('- [x] 处理中')) return 'in_progress';
  if (taskContent.includes('- [x] 待处理')) return 'pending';
  return 'unknown';
}

function getTaskInfo(taskPath) {
  const content = fs.readFileSync(taskPath, 'utf-8');
  const titleMatch = content.match(/^# 任务:\s*(.+)/m);
  const idMatch = content.match(/\*\*任务ID\*\*:\s*(.+)/);
  const smithMatch = content.match(/\*\*所属史密斯\*\*:\s*(.+)/);
  const assignedMatch = content.match(/\*\*史密斯ID\*\*:\s*(.+)/);

  return {
    title: titleMatch ? titleMatch[1].trim() : 'Unknown',
    id: idMatch ? idMatch[1].trim() : path.basename(taskPath, '.md'),
    smith: smithMatch ? smithMatch[1].trim() : 'unknown',
    assigned: assignedMatch ? assignedMatch[1].trim() : null,
    status: getTaskStatus(content),
    path: taskPath,
  };
}

function getSmithResult(smithId) {
  const resultPath = path.join(
    SMITH_MATRIX_DIR,
    'smiths',
    smithId,
    'outbox',
    'result.md'
  );
  if (fs.existsSync(resultPath)) {
    const content = fs.readFileSync(resultPath, 'utf-8');
    const summaryMatch = content.match(/## 摘要\s*\n\s*(.+)/);
    return {
      exists: true,
      summary: summaryMatch ? summaryMatch[1].trim() : 'No summary',
      path: resultPath,
    };
  }
  return { exists: false };
}

function listSmiths() {
  const smithsDir = path.join(SMITH_MATRIX_DIR, 'smiths');
  if (!fs.existsSync(smithsDir)) return [];

  return fs
    .readdirSync(smithsDir)
    .filter((d) => d.startsWith('smith-'))
    .map((id) => {
      const result = getSmithResult(id);
      return { id, result };
    });
}

function listTasks() {
  const inboxDir = path.join(SMITH_MATRIX_DIR, 'inbox');
  if (!fs.existsSync(inboxDir)) return [];

  return fs
    .readdirSync(inboxDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => getTaskInfo(path.join(inboxDir, f)));
}

function getStatusIcon(status) {
  switch (status) {
    case 'completed':
      return '✅';
    case 'in_progress':
      return '🔄';
    case 'pending':
      return '⏳';
    default:
      return '❓';
  }
}

function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║       史密斯矩阵状态面板               ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');

  // 检查矩阵是否存在
  if (!fs.existsSync(SMITH_MATRIX_DIR)) {
    console.log('⚠️  史密斯矩阵尚未初始化');
    console.log('');
    console.log('运行以下命令初始化:');
    console.log('  /smith-init "你的任务描述"');
    return;
  }

  // 显示任务状态
  const tasks = listTasks();
  console.log(`📋 任务列表 (${tasks.length} 个)`);
  console.log('─────────────────────────────────────────');

  if (tasks.length === 0) {
    console.log('  (暂无任务)');
  } else {
    tasks.forEach((task) => {
      const icon = getStatusIcon(task.status);
      const assigned = task.assigned ? `→ ${task.assigned}` : '';
      console.log(`${icon} ${task.id}`);
      console.log(`   标题: ${task.title}`);
      console.log(`   所属: ${task.smith} ${assigned}`);
      console.log(`   状态: ${task.status}`);
      console.log('');
    });
  }

  // 显示史密斯状态
  const smiths = listSmiths();
  console.log(`👤 史密斯列表 (${smiths.length} 个)`);
  console.log('─────────────────────────────────────────');

  if (smiths.length === 0) {
    console.log('  (暂无史密斯)');
  } else {
    smiths.forEach((smith) => {
      const resultIcon = smith.result.exists ? '✅' : '⏳';
      console.log(`${resultIcon} ${smith.id}`);
      if (smith.result.exists) {
        console.log(`   摘要: ${smith.result.summary.slice(0, 50)}...`);
        console.log(`   路径: ${smith.result.path}`);
      } else {
        console.log('   状态: 等待结果...');
      }
      console.log('');
    });
  }

  // 显示最终结果
  const finalResultPath = path.join(SMITH_MATRIX_DIR, 'results', 'final.md');
  console.log('📊 最终结果');
  console.log('─────────────────────────────────────────');
  if (fs.existsSync(finalResultPath)) {
    const finalContent = fs.readFileSync(finalResultPath, 'utf-8');
    const lines = finalContent.split('\n').slice(0, 5);
    console.log('✅ 最终报告已生成');
    console.log('预览:');
    lines.forEach((line) => console.log(`  ${line}`));
    console.log('');
    console.log(`完整文件: ${finalResultPath}`);
  } else {
    console.log('⏳ 等待最终汇总...');
    console.log('根史密斯完成后会将结果写入: results/final.md');
  }

  console.log('');
  console.log('─────────────────────────────────────────');
  console.log('提示: 运行 /smith-status 刷新状态');
}

main();
