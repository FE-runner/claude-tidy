import { select } from '@inquirer/prompts';
import { getGlobalRulesDir, getProjectRulesDir, getGlobalSkillsDir } from '../utils/paths.js';
import { scanRules, scanSkills } from '../utils/scanner.js';
import { printRules, printSkills } from '../utils/display.js';
import type { Rule } from '../types.js';

/**
 * list 命令：列出 rules 或 skills
 *
 * 用法:
 *   claude-tidy list                      交互选择 rules 或 skills
 *   claude-tidy list rules                列出所有 rules
 *   claude-tidy list rules --scope global 只看全局 rules
 *   claude-tidy list skills               列出所有 skills
 */
export async function listCommand(args: string[]): Promise<void> {
  let target = args[0];

  // 无参数时交互选择
  if (!target) {
    target = await select({
      message: '查看什么？',
      choices: [
        { value: 'rules', name: 'rules' },
        { value: 'skills', name: 'skills' },
      ],
    });
  }

  if (target === 'rules') {
    await listRules(args.slice(1));
  } else if (target === 'skills') {
    listSkillsCmd();
  } else {
    console.error(`未知的 list 目标: ${target}`);
    console.log('用法: claude-tidy list [rules|skills]');
  }
}

/** 列出 rules */
async function listRules(args: string[]): Promise<void> {
  const scopeIdx = args.indexOf('--scope');
  const scope = scopeIdx !== -1 ? args[scopeIdx + 1] : undefined;

  let rules: Rule[] = [];
  let showScope = true;

  if (scope === 'global') {
    rules = scanRules(getGlobalRulesDir(), 'global');
    showScope = false;
  } else if (scope === 'project') {
    rules = scanRules(getProjectRulesDir(), 'project');
    showScope = false;
  } else {
    // 默认：列出全局 + 项目
    const globalRules = scanRules(getGlobalRulesDir(), 'global');
    const projectRules = scanRules(getProjectRulesDir(), 'project');
    rules = [...globalRules, ...projectRules];
  }

  // 按标识符排序
  rules.sort((a, b) => a.id.localeCompare(b.id));
  printRules(rules, showScope);
}

/** 列出 skills */
function listSkillsCmd(): void {
  const skills = scanSkills(getGlobalSkillsDir());
  // 按名称排序
  skills.sort((a, b) => a.name.localeCompare(b.name));
  printSkills(skills);
}
