import fs from 'node:fs';
import path from 'node:path';
import { select, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import {
  getGlobalRulesDir,
  getProjectRulesDir,
  getGlobalSkillsDir,
  getProjectSkillsDir,
} from '../utils/paths.js';
import { scanRules, scanSkills, getLatestTime } from '../utils/scanner.js';
import { formatDate } from '../utils/display.js';
import type { Rule, Skill } from '../types.js';

/**
 * diff 交互流程
 * 多选要处理的（a 键全选）→ 逐个选保留哪个
 */
export async function diffFlow(target: string): Promise<void> {
  if (target === 'rules') {
    await diffRulesFlow();
  } else {
    await diffSkillsFlow();
  }
}

// ─── Rules diff ───

async function diffRulesFlow(): Promise<void> {
  const globalRules = scanRules(getGlobalRulesDir(), 'global');
  const projectRules = scanRules(getProjectRulesDir(), 'project');

  const globalMap = new Map(globalRules.map((r) => [r.id, r]));
  const projectMap = new Map(projectRules.map((r) => [r.id, r]));

  const duplicates: { id: string; global: Rule; project: Rule }[] = [];
  for (const [id, globalRule] of globalMap) {
    const projectRule = projectMap.get(id);
    if (projectRule) {
      duplicates.push({ id, global: globalRule, project: projectRule });
    }
  }

  if (duplicates.length === 0) {
    console.log(chalk.dim('  全局和项目没有同名 rules'));
    return;
  }

  console.log(chalk.bold(`\n  发现 ${duplicates.length} 条同名 rules\n`));

  const selected = await checkbox({
    message: '选择要处理的 rules（a 全选，空格选择，回车确认）：',
    choices: duplicates.map(({ id, global: globalRule, project: projectRule }) => {
      const globalNewer = globalRule.mtime.getTime() > projectRule.mtime.getTime();
      const projectNewer = projectRule.mtime.getTime() > globalRule.mtime.getTime();
      const hint = globalNewer ? ' (全局最新)' : projectNewer ? ' (项目最新)' : '';
      return { value: id, name: `${id}${chalk.dim(hint)}` };
    }),
  });

  if (selected.length === 0) return;

  for (const id of selected) {
    const dup = duplicates.find((d) => d.id === id)!;
    const globalNewer = dup.global.mtime.getTime() > dup.project.mtime.getTime();
    const projectNewer = dup.project.mtime.getTime() > dup.global.mtime.getTime();

    const choice = await select({
      message: `${id} — 保留哪个？`,
      choices: [
        {
          value: 'global',
          name: `全局 (${formatDate(dup.global.mtime)})${globalNewer ? ' ← 最新' : ''}`,
        },
        {
          value: 'project',
          name: `项目 (${formatDate(dup.project.mtime)})${projectNewer ? ' ← 最新' : ''}`,
        },
        { value: 'skip', name: '跳过' },
      ],
    });

    if (choice === 'global') {
      fs.unlinkSync(dup.project.absolutePath);
      console.log(chalk.green(`  ✓ ${id} → 已删除项目版本`));
    } else if (choice === 'project') {
      fs.unlinkSync(dup.global.absolutePath);
      console.log(chalk.green(`  ✓ ${id} → 已删除全局版本`));
    }
  }
}

// ─── Skills diff ───

async function diffSkillsFlow(): Promise<void> {
  const globalSkills = scanSkills(getGlobalSkillsDir(), 'global');
  const projectSkills = scanSkills(getProjectSkillsDir(), 'project');

  const globalMap = new Map(globalSkills.map((s) => [s.name, s]));
  const projectMap = new Map(projectSkills.map((s) => [s.name, s]));

  const duplicates: { name: string; global: Skill; project: Skill }[] = [];
  for (const [name, globalSkill] of globalMap) {
    const projectSkill = projectMap.get(name);
    if (projectSkill) {
      duplicates.push({ name, global: globalSkill, project: projectSkill });
    }
  }

  if (duplicates.length === 0) {
    console.log(chalk.dim('  全局和项目没有同名 skills'));
    return;
  }

  console.log(chalk.bold(`\n  发现 ${duplicates.length} 个同名 skills\n`));

  const selected = await checkbox({
    message: '选择要处理的 skills（a 全选，空格选择，回车确认）：',
    choices: duplicates.map(({ name, global: globalSkill, project: projectSkill }) => {
      const globalMtime = getLatestTime(path.join(globalSkill.absolutePath, 'SKILL.md'));
      const projectMtime = getLatestTime(path.join(projectSkill.absolutePath, 'SKILL.md'));
      const globalNewer = globalMtime.getTime() > projectMtime.getTime();
      const projectNewer = projectMtime.getTime() > globalMtime.getTime();
      const hint = globalNewer ? ' (全局最新)' : projectNewer ? ' (项目最新)' : '';
      return { value: name, name: `${name}${chalk.dim(hint)}` };
    }),
  });

  if (selected.length === 0) return;

  for (const name of selected) {
    const dup = duplicates.find((d) => d.name === name)!;
    const globalMtime = getLatestTime(path.join(dup.global.absolutePath, 'SKILL.md'));
    const projectMtime = getLatestTime(path.join(dup.project.absolutePath, 'SKILL.md'));
    const globalNewer = globalMtime.getTime() > projectMtime.getTime();
    const projectNewer = projectMtime.getTime() > globalMtime.getTime();

    const choice = await select({
      message: `${name} — 保留哪个？`,
      choices: [
        {
          value: 'global',
          name: `全局 (${formatDate(globalMtime)})${globalNewer ? ' ← 最新' : ''}`,
        },
        {
          value: 'project',
          name: `项目 (${formatDate(projectMtime)})${projectNewer ? ' ← 最新' : ''}`,
        },
        { value: 'skip', name: '跳过' },
      ],
    });

    if (choice === 'global') {
      fs.rmSync(dup.project.absolutePath, { recursive: true, force: true });
      console.log(chalk.green(`  ✓ ${name} → 已删除项目版本`));
    } else if (choice === 'project') {
      fs.rmSync(dup.global.absolutePath, { recursive: true, force: true });
      console.log(chalk.green(`  ✓ ${name} → 已删除全局版本`));
    }
  }
}
