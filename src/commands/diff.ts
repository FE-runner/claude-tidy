import fs from 'node:fs';
import chalk from 'chalk';
import { createTwoFilesPatch } from 'diff';
import { getGlobalRulesDir, getProjectRulesDir } from '../utils/paths.js';
import { scanRules } from '../utils/scanner.js';
import { printDiffSummary } from '../utils/display.js';
import type { Rule, DiffSummaryItem } from '../types.js';

/**
 * diff 命令：比对全局和项目 rules
 *
 * 用法:
 *   claude-tidy diff                  总览表（时间对比）
 *   claude-tidy diff react/core.md    详细对比（时间 + unified diff）
 */
export async function diffCommand(args: string[]): Promise<void> {
  const ruleId = args[0];

  if (ruleId && !ruleId.startsWith('-')) {
    await diffDetail(ruleId);
  } else {
    diffOverview();
  }
}

/** 构建全局和项目 rules 的映射 */
function buildRuleMaps(): {
  globalMap: Map<string, Rule>;
  projectMap: Map<string, Rule>;
} {
  const globalRules = scanRules(getGlobalRulesDir(), 'global');
  const projectRules = scanRules(getProjectRulesDir(), 'project');

  const globalMap = new Map(globalRules.map((r) => [r.id, r]));
  const projectMap = new Map(projectRules.map((r) => [r.id, r]));

  return { globalMap, projectMap };
}

/** 总览表：列出所有同标识符 rules 的时间对比 */
function diffOverview(): void {
  const { globalMap, projectMap } = buildRuleMaps();

  // 收集所有出现过的标识符
  const allIds = new Set([...globalMap.keys(), ...projectMap.keys()]);
  const items: DiffSummaryItem[] = [];

  for (const id of allIds) {
    const globalRule = globalMap.get(id);
    const projectRule = projectMap.get(id);

    let status: DiffSummaryItem['status'];
    if (globalRule && projectRule) {
      if (globalRule.mtime.getTime() > projectRule.mtime.getTime()) {
        status = '全局更新';
      } else if (projectRule.mtime.getTime() > globalRule.mtime.getTime()) {
        status = '项目更新';
      } else {
        status = '时间相同';
      }
    } else if (globalRule) {
      status = '仅全局';
    } else {
      status = '仅项目';
    }

    items.push({
      id,
      globalMtime: globalRule?.mtime,
      projectMtime: projectRule?.mtime,
      status,
    });
  }

  // 按标识符排序
  items.sort((a, b) => a.id.localeCompare(b.id));
  printDiffSummary(items);
}

/** 格式化日期 */
function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

/** 详细对比：时间 + unified diff */
async function diffDetail(ruleId: string): Promise<void> {
  const { globalMap, projectMap } = buildRuleMaps();

  const globalRule = globalMap.get(ruleId);
  const projectRule = projectMap.get(ruleId);

  if (!globalRule && !projectRule) {
    console.error(`未找到 rule: ${ruleId}`);
    return;
  }

  if (!globalRule) {
    console.log(`${chalk.bold(ruleId)} 仅存在于项目，无法对比`);
    return;
  }

  if (!projectRule) {
    console.log(`${chalk.bold(ruleId)} 仅存在于全局，无法对比`);
    return;
  }

  // 显示时间对比
  console.log(`\n  ${chalk.bold(ruleId)}`);
  console.log(`  全局  ${globalRule.absolutePath}  ${formatDate(globalRule.mtime)}`);
  console.log(`  项目  ${projectRule.absolutePath}  ${formatDate(projectRule.mtime)}`);

  if (globalRule.mtime.getTime() > projectRule.mtime.getTime()) {
    console.log(`  状态  ${chalk.blue('全局更新 ↑')}`);
  } else if (projectRule.mtime.getTime() > globalRule.mtime.getTime()) {
    console.log(`  状态  ${chalk.magenta('项目更新 ↑')}`);
  } else {
    console.log(`  状态  ${chalk.green('时间相同')}`);
  }

  // 读取内容并对比
  const globalContent = fs.readFileSync(globalRule.absolutePath, 'utf-8');
  const projectContent = fs.readFileSync(projectRule.absolutePath, 'utf-8');

  if (globalContent === projectContent) {
    console.log(chalk.green('\n  内容相同'));
    return;
  }

  // 输出 unified diff
  const patch = createTwoFilesPatch(
    '全局',
    '项目',
    globalContent,
    projectContent,
    undefined,
    undefined,
    { context: 3 },
  );

  console.log();

  // 着色输出 diff
  for (const line of patch.split('\n')) {
    if (line.startsWith('+++') || line.startsWith('---')) {
      console.log(chalk.bold(line));
    } else if (line.startsWith('+')) {
      console.log(chalk.green(line));
    } else if (line.startsWith('-')) {
      console.log(chalk.red(line));
    } else if (line.startsWith('@@')) {
      console.log(chalk.cyan(line));
    } else {
      console.log(line);
    }
  }
}
