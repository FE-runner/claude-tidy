#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listCommand } from './commands/list.js';
import { diffCommand } from './commands/diff.js';
import { moveCommand } from './commands/move.js';
import { removeCommand } from './commands/remove.js';

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
  claude-tidy <命令> [参数]

命令:
  list [rules|skills]           列出 rules 或 skills
  diff [rule-id]                比对全局和项目 rules 差异
  move <rule-id> --to <scope>   移动/复制 rule（scope: global | project）
  remove <rule-id|skill-name>   删除 rule 或 skill

选项:
  --help, -h      显示帮助信息
  --version, -v   显示版本号
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // 全局选项
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(HELP_TEXT.trim());
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(getVersion());
    return;
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  switch (command) {
    case 'list':
      await listCommand(commandArgs);
      break;
    case 'diff':
      await diffCommand(commandArgs);
      break;
    case 'move':
      await moveCommand(commandArgs);
      break;
    case 'remove':
      await removeCommand(commandArgs);
      break;
    default:
      console.error(`未知命令: ${command}`);
      console.log(HELP_TEXT.trim());
      process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error('执行出错:', error instanceof Error ? error.message : error);
  process.exit(1);
});
