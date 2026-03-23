import fs from 'node:fs';
import { select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { getGlobalRulesDir, getProjectRulesDir, getGlobalSkillsDir, getProjectSkillsDir } from '../utils/paths.js';
import { scanRules, scanSkills } from '../utils/scanner.js';
import { formatDate } from '../utils/display.js';

/**
 * delete 交互流程（多选，a 键全选）
 */
export async function deleteFlow(target: string): Promise<void> {
  if (target === 'rules') {
    await deleteRulesFlow();
  } else {
    await deleteSkillsFlow();
  }
}

async function deleteRulesFlow(): Promise<void> {
  const scope = await select({
    message: '从哪里删除？',
    choices: [
      { value: 'global', name: '全局' },
      { value: 'project', name: '项目' },
    ],
  });

  const rulesDir = scope === 'global' ? getGlobalRulesDir() : getProjectRulesDir();
  const rules = scanRules(rulesDir, scope as 'global' | 'project');

  if (rules.length === 0) {
    console.log(chalk.dim(`  ${scope === 'global' ? '全局' : '项目'}中没有 rules`));
    return;
  }

  const selected = await checkbox({
    message: '选择要删除的 rules（a 全选，空格选择，回车确认）：',
    choices: rules
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((rule) => ({
        value: rule.absolutePath,
        name: `${rule.id}  ${chalk.dim(formatDate(rule.mtime))}`,
      })),
  });

  if (selected.length === 0) return;

  console.log(chalk.yellow('\n  将删除以下 rules：'));
  for (const filePath of selected) {
    const rule = rules.find((r) => r.absolutePath === filePath)!;
    console.log(`    ${chalk.bold(rule.id)}  ${chalk.dim(filePath)}`);
  }

  const confirmed = await confirm({
    message: `确认删除 ${selected.length} 条 rules？`,
    default: false,
  });

  if (!confirmed) {
    console.log(chalk.dim('  已取消'));
    return;
  }

  for (const filePath of selected) {
    fs.unlinkSync(filePath);
  }

  console.log(chalk.green(`  ✓ 已删除 ${selected.length} 条 rules`));
}

async function deleteSkillsFlow(): Promise<void> {
  const scope = await select({
    message: '从哪里删除？',
    choices: [
      { value: 'global', name: '全局' },
      { value: 'project', name: '项目' },
    ],
  });

  const skillsDir = scope === 'global' ? getGlobalSkillsDir() : getProjectSkillsDir();
  const skills = scanSkills(skillsDir, scope as 'global' | 'project');

  if (skills.length === 0) {
    console.log(chalk.dim(`  ${scope === 'global' ? '全局' : '项目'}中没有 skills`));
    return;
  }

  const selected = await checkbox({
    message: '选择要删除的 skills（a 全选，空格选择，回车确认）：',
    choices: skills
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((skill) => ({
        value: skill.absolutePath,
        name: `${skill.name}  ${chalk.dim(`${skill.fileCount} 个文件`)}`,
      })),
  });

  if (selected.length === 0) return;

  const selectedSkills = selected.map(
    (sp) => skills.find((s) => s.absolutePath === sp)!,
  );

  console.log(chalk.yellow('\n  将删除以下 skills：'));
  for (const skill of selectedSkills) {
    console.log(`    ${chalk.bold(skill.name)}  ${chalk.dim(skill.absolutePath)}  (${skill.fileCount} 个文件)`);
  }

  const confirmed = await confirm({
    message: `确认删除 ${selectedSkills.length} 个 skills？`,
    default: false,
  });

  if (!confirmed) {
    console.log(chalk.dim('  已取消'));
    return;
  }

  for (const skillPath of selected) {
    fs.rmSync(skillPath, { recursive: true, force: true });
  }

  console.log(chalk.green(`  ✓ 已删除 ${selected.length} 个 skills`));
}
