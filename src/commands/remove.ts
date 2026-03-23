import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { select, confirm } from '@inquirer/prompts';
import { getGlobalRulesDir, getProjectRulesDir, getGlobalSkillsDir } from '../utils/paths.js';
import { scanSkills } from '../utils/scanner.js';

/**
 * remove 命令：删除 rule 或 skill
 *
 * 用法:
 *   claude-tidy remove react/core.md             删除 rule（自动定位）
 *   claude-tidy remove react/core.md --scope global  指定删除全局版本
 *   claude-tidy remove prisma-database-setup      删除 skill（需确认）
 */
export async function removeCommand(args: string[]): Promise<void> {
  const target = args[0];

  if (!target) {
    console.error('用法: claude-tidy remove <rule-id|skill-name>');
    return;
  }

  const scopeIdx = args.indexOf('--scope');
  const scope = scopeIdx !== -1 ? args[scopeIdx + 1] : undefined;

  // 判断目标是 rule 还是 skill
  if (isRuleIdentifier(target)) {
    await removeRule(target, scope);
  } else {
    await removeSkill(target);
  }
}

/**
 * 判断标识符是否为 rule
 * 包含路径分隔符或 .md 后缀 → rule
 */
function isRuleIdentifier(target: string): boolean {
  return target.includes('/') || target.endsWith('.md');
}

/** 删除 rule */
async function removeRule(ruleId: string, scope: string | undefined): Promise<void> {
  const globalPath = path.join(getGlobalRulesDir(), ruleId);
  const projectPath = path.join(getProjectRulesDir(), ruleId);
  const globalExists = fs.existsSync(globalPath);
  const projectExists = fs.existsSync(projectPath);

  if (!globalExists && !projectExists) {
    console.error(`未找到 rule: ${ruleId}`);
    return;
  }

  let targetPath: string;

  if (scope === 'global') {
    if (!globalExists) {
      console.error(`全局中未找到 rule: ${ruleId}`);
      return;
    }
    targetPath = globalPath;
  } else if (scope === 'project') {
    if (!projectExists) {
      console.error(`项目中未找到 rule: ${ruleId}`);
      return;
    }
    targetPath = projectPath;
  } else if (globalExists && projectExists) {
    // 两侧都存在，提示选择
    const chosen = await select({
      message: `${ruleId} 同时存在于全局和项目，删除哪个？`,
      choices: [
        { value: 'global', name: `全局 (${globalPath})` },
        { value: 'project', name: `项目 (${projectPath})` },
      ],
    });
    targetPath = chosen === 'global' ? globalPath : projectPath;
  } else {
    // 仅一侧存在，直接定位
    targetPath = globalExists ? globalPath : projectPath;
  }

  fs.unlinkSync(targetPath);
  console.log(chalk.green(`✓ 已删除 ${ruleId} (${targetPath})`));
}

/** 删除 skill（需要二次确认） */
async function removeSkill(skillName: string): Promise<void> {
  const skills = scanSkills(getGlobalSkillsDir());
  const skill = skills.find((s) => s.name === skillName);

  if (!skill) {
    console.error(`未找到 skill: ${skillName}`);
    return;
  }

  console.log(`\n${chalk.yellow('⚠')} 将删除 skill: ${chalk.bold(skill.name)}`);
  console.log(`  路径: ${skill.absolutePath}`);
  console.log(`  包含 ${skill.fileCount} 个文件`);

  const confirmed = await confirm({
    message: '确认删除？',
    default: false,
  });

  if (!confirmed) {
    console.log('已取消');
    return;
  }

  fs.rmSync(skill.absolutePath, { recursive: true, force: true });
  console.log(chalk.green(`✓ 已删除 skill: ${skill.name}`));
}
