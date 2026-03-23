import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import { getGlobalRulesDir, getProjectRulesDir } from '../utils/paths.js';

/**
 * move 命令：在全局和项目之间移动/复制 rule
 *
 * 用法:
 *   claude-tidy move react/core.md --to project
 *   claude-tidy move react/core.md --to global
 */
export async function moveCommand(args: string[]): Promise<void> {
  const ruleId = args[0];
  const toIdx = args.indexOf('--to');
  const targetScope = toIdx !== -1 ? args[toIdx + 1] : undefined;

  if (!ruleId || !targetScope) {
    console.error('用法: claude-tidy move <rule-id> --to <global|project>');
    return;
  }

  if (targetScope !== 'global' && targetScope !== 'project') {
    console.error(`无效的 scope: ${targetScope}（应为 global 或 project）`);
    return;
  }

  // 确定源和目标路径
  const globalPath = path.join(getGlobalRulesDir(), ruleId);
  const projectPath = path.join(getProjectRulesDir(), ruleId);

  let sourcePath: string;
  let destPath: string;

  if (targetScope === 'project') {
    sourcePath = globalPath;
    destPath = projectPath;
  } else {
    sourcePath = projectPath;
    destPath = globalPath;
  }

  // 检查源文件是否存在
  if (!fs.existsSync(sourcePath)) {
    console.error(`未找到源文件: ${sourcePath}`);
    return;
  }

  // 检查冲突
  if (fs.existsSync(destPath)) {
    const sourceStat = fs.statSync(sourcePath);
    const destStat = fs.statSync(destPath);

    console.log(`\n${chalk.yellow('⚠')} 目标已存在 ${chalk.bold(ruleId)}`);
    console.log(`  源    ${formatDate(sourceStat.mtime)}`);
    console.log(`  目标  ${formatDate(destStat.mtime)}`);

    const action = await select({
      message: '如何处理？',
      choices: [
        { value: 'overwrite', name: '覆盖' },
        { value: 'cancel', name: '取消' },
      ],
    });

    if (action === 'cancel') {
      console.log('已取消');
      return;
    }
  }

  // 选择操作方式
  const mode = await select({
    message: '操作方式：',
    choices: [
      { value: 'copy', name: '复制（保留原件）' },
      { value: 'move', name: '移动（删除原件）' },
    ],
  });

  // 自动创建目标目录
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // 执行操作
  fs.copyFileSync(sourcePath, destPath);

  if (mode === 'move') {
    fs.unlinkSync(sourcePath);
    console.log(chalk.green(`✓ 已移动 ${ruleId} → ${targetScope}`));
  } else {
    console.log(chalk.green(`✓ 已复制 ${ruleId} → ${targetScope}`));
  }
}

function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}
