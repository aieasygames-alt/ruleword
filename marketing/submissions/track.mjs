#!/usr/bin/env node
/**
 * RuleWord 外链提交管理工具
 *
 * 用法:
 *   node track.mjs status              - 查看当前状态
 *   node track.mjs list [tier]         - 列出所有平台
 *   node track.mjs submit <id>         - 标记为已提交
 *   node track.mjs approve <id>        - 标记为已通过
 *   node track.mjs reject <id>         - 标记为被拒绝
 *   node track.mjs next                - 显示下一个待提交平台
 *   node track.mjs report              - 生成进度报告
 *   node track.mjs open <id>           - 打开提交页面
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, 'config.json');
const PROGRESS_PATH = path.join(__dirname, 'progress.json');

// 读取配置
function loadConfig() {
  const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(data);
}

// 读取进度
function loadProgress() {
  if (!fs.existsSync(PROGRESS_PATH)) {
    return {};
  }
  const data = fs.readFileSync(PROGRESS_PATH, 'utf-8');
  return JSON.parse(data);
}

// 保存进度
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
}

// 获取所有平台
function getAllPlatforms(config) {
  const platforms = [];
  for (const [tierKey, tierData] of Object.entries(config.priority)) {
    for (const platform of tierData.platforms) {
      platforms.push({
        ...platform,
        tier: tierKey,
        tierName: tierData.name
      });
    }
  }
  return platforms;
}

// 状态命令
function statusCommand() {
  const config = loadConfig();
  const progress = loadProgress();
  const platforms = getAllPlatforms(config);

  const stats = {
    total: platforms.length,
    pending: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  };

  platforms.forEach(p => {
    const status = progress[p.id]?.status || 'pending';
    stats[status] = (stats[status] || 0) + 1;
  });

  console.log('\n📊 RuleWord 外链提交进度\n');
  console.log(`总计: ${stats.total} 个平台`);
  console.log(`✅ 已通过: ${stats.approved}`);
  console.log(`📤 已提交: ${stats.submitted}`);
  console.log(`⏳ 待提交: ${stats.pending}`);
  console.log(`❌ 被拒绝: ${stats.rejected}`);
  console.log(`\n完成率: ${((stats.approved / stats.total) * 100).toFixed(1)}%`);
}

// 列表命令
function listCommand(tier) {
  const config = loadConfig();
  const progress = loadProgress();

  const tiers = tier ? { [tier]: config.priority[tier] } : config.priority;

  for (const [tierKey, tierData] of Object.entries(tiers)) {
    console.log(`\n📁 ${tierData.name}\n`);

    tierData.platforms.forEach(p => {
      const status = progress[p.id]?.status || 'pending';
      const statusIcon = {
        pending: '⏳',
        submitted: '📤',
        approved: '✅',
        rejected: '❌',
        'needs-revision': '🔄'
      }[status] || '⏳';

      console.log(`  ${statusIcon} ${p.name}`);
      console.log(`     URL: ${p.submitUrl}`);
      if (p.notes) {
        console.log(`     备注: ${p.notes}`);
      }
      console.log('');
    });
  }
}

// 更新状态命令
function updateStatus(id, newStatus) {
  const config = loadConfig();
  const progress = loadProgress();
  const platforms = getAllPlatforms(config);

  const platform = platforms.find(p => p.id === id);

  if (!platform) {
    console.log(`❌ 找不到平台: ${id}`);
    console.log('可用平台:', platforms.map(p => p.id).join(', '));
    return;
  }

  progress[id] = {
    ...progress[id],
    status: newStatus,
    updatedAt: new Date().toISOString()
  };

  if (newStatus === 'submitted') {
    progress[id].submittedAt = new Date().toISOString();
  } else if (newStatus === 'approved') {
    progress[id].approvedAt = new Date().toISOString();
  }

  saveProgress(progress);
  console.log(`✅ 已更新 ${platform.name} 状态为: ${newStatus}`);
}

// 下一个待提交
function nextCommand() {
  const config = loadConfig();
  const progress = loadProgress();
  const platforms = getAllPlatforms(config);

  // 按 tier 优先级排序
  const tierOrder = ['tier1', 'tier2', 'tier3', 'tier4', 'tier5'];
  const sortedPlatforms = platforms.sort((a, b) => {
    const aIndex = tierOrder.indexOf(a.tier);
    const bIndex = tierOrder.indexOf(b.tier);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return (a.priority || 999) - (b.priority || 999);
  });

  const next = sortedPlatforms.find(p => {
    const status = progress[p.id]?.status || 'pending';
    return status === 'pending';
  });

  if (next) {
    console.log('\n🎯 下一个待提交平台:\n');
    console.log(`名称: ${next.name}`);
    console.log(`分类: ${next.tierName}`);
    console.log(`提交URL: ${next.submitUrl}`);
    console.log(`模板: templates/${next.template}`);
    if (next.notes) {
      console.log(`备注: ${next.notes}`);
    }
    console.log('\n命令:');
    console.log(`  node track.mjs submit ${next.id}  # 标记为已提交`);
    console.log(`  node track.mjs open ${next.id}    # 打开提交页面`);
  } else {
    console.log('🎉 所有平台都已提交！');
  }
}

// 生成报告
function reportCommand() {
  const config = loadConfig();
  const progress = loadProgress();
  const platforms = getAllPlatforms(config);

  let report = '# RuleWord 外链提交进度报告\n\n';
  report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

  const stats = {
    total: platforms.length,
    pending: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  };

  platforms.forEach(p => {
    const status = progress[p.id]?.status || 'pending';
    stats[status] = (stats[status] || 0) + 1;
  });

  report += '## 总体进度\n\n';
  report += `- 总计: ${stats.total} 个平台\n`;
  report += `- ✅ 已通过: ${stats.approved}\n`;
  report += `- 📤 已提交: ${stats.submitted}\n`;
  report += `- ⏳ 待提交: ${stats.pending}\n`;
  report += `- ❌ 被拒绝: ${stats.rejected}\n`;
  report += `- 完成率: ${((stats.approved / stats.total) * 100).toFixed(1)}%\n\n`;

  for (const [tierKey, tierData] of Object.entries(config.priority)) {
    report += `## ${tierData.name}\n\n`;
    report += '| 平台 | 状态 | 提交时间 | 链接 |\n';
    report += '|------|------|----------|------|\n';

    tierData.platforms.forEach(p => {
      const pProgress = progress[p.id] || {};
      const status = pProgress.status || 'pending';
      const statusText = {
        pending: '⏳ 待提交',
        submitted: '📤 已提交',
        approved: '✅ 已通过',
        rejected: '❌ 被拒绝',
        'needs-revision': '🔄 需修改'
      }[status] || '⏳ 待提交';

      const date = pProgress.submittedAt
        ? new Date(pProgress.submittedAt).toLocaleDateString('zh-CN')
        : '-';

      report += `| ${p.name} | ${statusText} | ${date} | [提交](${p.submitUrl}) |\n`;
    });

    report += '\n';
  }

  const reportPath = path.join(__dirname, 'REPORT.md');
  fs.writeFileSync(reportPath, report);
  console.log(`📄 报告已生成: ${reportPath}`);
}

// 打开网页
function openCommand(id) {
  const config = loadConfig();
  const platforms = getAllPlatforms(config);
  const platform = platforms.find(p => p.id === id);

  if (!platform) {
    console.log(`❌ 找不到平台: ${id}`);
    return;
  }

  const url = platform.submitUrl;
  const cmd = process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;

  exec(cmd, (error) => {
    if (error) {
      console.log(`请手动打开: ${url}`);
    } else {
      console.log(`✅ 已打开 ${platform.name}`);
    }
  });
}

// 主入口
const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

switch (command) {
  case 'status':
    statusCommand();
    break;
  case 'list':
    listCommand(param);
    break;
  case 'submit':
    updateStatus(param, 'submitted');
    break;
  case 'approve':
    updateStatus(param, 'approved');
    break;
  case 'reject':
    updateStatus(param, 'rejected');
    break;
  case 'next':
    nextCommand();
    break;
  case 'report':
    reportCommand();
    break;
  case 'open':
    openCommand(param);
    break;
  default:
    console.log(`
RuleWord 外链提交管理工具

用法:
  node track.mjs status              查看当前状态
  node track.mjs list [tier]         列出所有平台
  node track.mjs submit <id>         标记为已提交
  node track.mjs approve <id>        标记为已通过
  node track.mjs reject <id>         标记为被拒绝
  node track.mjs next                显示下一个待提交平台
  node track.mjs report              生成进度报告
  node track.mjs open <id>           打开提交页面
    `);
}
