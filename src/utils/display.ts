import chalk from 'chalk';
import type { Rule, Skill, DiffSummaryItem } from '../types.js';

/**
 * 格式化日期为简短格式
 */
function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

/**
 * 格式化触发方式
 */
function formatTrigger(rule: Rule): string {
  switch (rule.trigger.type) {
    case 'alwaysApply':
      return chalk.green('alwaysApply');
    case 'globs':
      return chalk.yellow(`globs: ${rule.trigger.patterns}`);
    case 'none':
      return chalk.dim('无');
  }
}

/**
 * 格式化作用域标签
 */
function formatScope(scope: 'global' | 'project'): string {
  return scope === 'global'
    ? chalk.blue('全局')
    : chalk.magenta('项目');
}

/**
 * 打印 rules 列表
 */
export function printRules(rules: Rule[], showScope: boolean): void {
  if (rules.length === 0) {
    console.log(chalk.dim('未找到 rules'));
    return;
  }

  // 表头
  const headers = showScope
    ? ['标识符', '作用域', '触发方式', '修改时间']
    : ['标识符', '触发方式', '修改时间'];

  console.log(chalk.bold(headers.join('\t')));
  console.log(chalk.dim('─'.repeat(80)));

  for (const rule of rules) {
    const cols = showScope
      ? [rule.id, formatScope(rule.scope), formatTrigger(rule), formatDate(rule.mtime)]
      : [rule.id, formatTrigger(rule), formatDate(rule.mtime)];
    console.log(cols.join('\t'));
  }

  console.log(chalk.dim(`\n共 ${rules.length} 条 rules`));
}

/**
 * 打印 skills 列表
 */
export function printSkills(skills: Skill[]): void {
  if (skills.length === 0) {
    console.log(chalk.dim('未找到 skills'));
    return;
  }

  console.log(chalk.bold('名称\t路径\t文件数'));
  console.log(chalk.dim('─'.repeat(80)));

  for (const skill of skills) {
    console.log(`${skill.name}\t${chalk.dim(skill.absolutePath)}\t${skill.fileCount}`);
  }

  console.log(chalk.dim(`\n共 ${skills.length} 个 skills`));
}

/**
 * 打印 diff 总览表
 */
export function printDiffSummary(items: DiffSummaryItem[]): void {
  if (items.length === 0) {
    console.log(chalk.dim('全局和项目之间没有同名 rules'));
    return;
  }

  console.log(chalk.bold('标识符\t全局 mtime\t项目 mtime\t状态'));
  console.log(chalk.dim('─'.repeat(80)));

  for (const item of items) {
    const globalTime = item.globalMtime ? formatDate(item.globalMtime) : chalk.dim('—');
    const projectTime = item.projectMtime ? formatDate(item.projectMtime) : chalk.dim('—');

    let statusText: string;
    switch (item.status) {
      case '全局更新':
        statusText = chalk.blue('全局更新 ↑');
        break;
      case '项目更新':
        statusText = chalk.magenta('项目更新 ↑');
        break;
      case '仅全局':
        statusText = chalk.dim('仅全局');
        break;
      case '仅项目':
        statusText = chalk.dim('仅项目');
        break;
      case '时间相同':
        statusText = chalk.green('时间相同');
        break;
    }

    console.log(`${item.id}\t${globalTime}\t${projectTime}\t${statusText}`);
  }
}
