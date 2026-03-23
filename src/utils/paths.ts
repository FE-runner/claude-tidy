import path from 'node:path';
import os from 'node:os';

/** 全局 rules 目录：~/.claude/rules/ */
export function getGlobalRulesDir(): string {
  return path.join(os.homedir(), '.claude', 'rules');
}

/** 项目 rules 目录：.claude/rules/ （基于 cwd） */
export function getProjectRulesDir(): string {
  return path.join(process.cwd(), '.claude', 'rules');
}

/** 全局 skills 目录：~/.claude/skills/ */
export function getGlobalSkillsDir(): string {
  return path.join(os.homedir(), '.claude', 'skills');
}

/**
 * 从绝对路径计算相对于 rules 根目录的标识符
 * 例如：~/.claude/rules/react/core.md → react/core.md
 */
export function toRuleId(absolutePath: string, rulesDir: string): string {
  // 统一使用正斜杠，保证跨平台一致性
  return path.relative(rulesDir, absolutePath).replace(/\\/g, '/');
}
