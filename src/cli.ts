#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import { listFlow } from './flows/list.js';
import { diffFlow } from './flows/diff.js';
import { moveFlow } from './flows/move.js';
import { deleteFlow } from './flows/delete.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 从 package.json 读取版本号 */
function getVersion(): string {
  const pkgPath = path.resolve(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  return pkg.version as string;
}

const HELP_TEXT = `
claude-tidy — Claude Code 的 skills 和 rules 管理工具

用法:
  claude-tidy              进入交互式管理流程
  claude-tidy --help       显示帮助信息
  claude-tidy --version    显示版本号
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(HELP_TEXT.trim());
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(getVersion());
    return;
  }

  if (args.length > 0) {
    console.log(HELP_TEXT.trim());
    return;
  }

  console.log(`
  ${chalk.bold.cyan('claude-tidy')}  ${chalk.dim('v' + getVersion())}
  ${chalk.dim('Claude Code skills & rules 管理工具')}
  `);

  const target = await select({
    message: '管理什么？',
    choices: [
      { value: 'skills', name: 'skills' },
      { value: 'rules', name: 'rules' },
    ],
  });

  const action = await select({
    message: '要做什么？',
    choices: [
      { value: 'list', name: 'list    — 查看' },
      { value: 'diff', name: 'diff    — 比对差异' },
      { value: 'move', name: 'move    — 移动' },
      { value: 'delete', name: 'delete  — 删除' },
    ],
  });

  switch (action) {
    case 'list':
      await listFlow(target);
      break;
    case 'diff':
      await diffFlow(target);
      break;
    case 'move':
      await moveFlow(target);
      break;
    case 'delete':
      await deleteFlow(target);
      break;
  }

  console.log(chalk.green('\n  完成\n'));
}

main().catch((error: unknown) => {
  console.error('执行出错:', error instanceof Error ? error.message : error);
  process.exit(1);
});
