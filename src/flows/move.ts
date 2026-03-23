import fs from 'node:fs';
import path from 'node:path';
import { select, checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { getGlobalRulesDir, getProjectRulesDir, getGlobalSkillsDir, getProjectSkillsDir } from '../utils/paths.js';
import { scanRules, scanSkills } from '../utils/scanner.js';
import { formatDate } from '../utils/display.js';

/**
 * move 交互流程（多选，a 键全选）
 */
export async function moveFlow(target: string): Promise<void> {
  if (target === 'rules') {
    await moveRulesFlow();
  } else {
    await moveSkillsFlow();
  }
}

async function moveRulesFlow(): Promise<void> {
  const direction = await select({
    message: '移动方向：',
    choices: [
      { value: 'to-project', name: '全局 → 项目' },
      { value: 'to-global', name: '项目 → 全局' },
    ],
  });

  const isToProject = direction === 'to-project';
  const sourceDir = isToProject ? getGlobalRulesDir() : getProjectRulesDir();
  const destDir = isToProject ? getProjectRulesDir() : getGlobalRulesDir();
  const sourceScope = isToProject ? 'global' : 'project';

  const rules = scanRules(sourceDir, sourceScope as 'global' | 'project');

  if (rules.length === 0) {
    console.log(chalk.dim(`  ${isToProject ? '全局' : '项目'}中没有 rules`));
    return;
  }

  const selected = await checkbox({
    message: '选择要移动的 rules（a 全选，空格选择，回车确认）：',
    choices: rules
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((rule) => ({
        value: rule.id,
        name: `${rule.id}  ${chalk.dim(formatDate(rule.mtime))}`,
      })),
  });

  if (selected.length === 0) return;

  for (const ruleId of selected) {
    const sourcePath = path.join(sourceDir, ruleId);
    const destPath = path.join(destDir, ruleId);

    if (fs.existsSync(destPath)) {
      const sourceStat = fs.statSync(sourcePath);
      const destStat = fs.statSync(destPath);

      console.log(chalk.yellow(`\n  ⚠ 目标已存在 ${chalk.bold(ruleId)}`));
      console.log(`    源    ${formatDate(sourceStat.mtime)}`);
      console.log(`    目标  ${formatDate(destStat.mtime)}`);

      const action = await select({
        message: `${ruleId} 如何处理？`,
        choices: [
          { value: 'overwrite', name: '覆盖' },
          { value: 'skip', name: '跳过' },
        ],
      });

      if (action === 'skip') continue;
    }

    const destDirPath = path.dirname(destPath);
    if (!fs.existsSync(destDirPath)) {
      fs.mkdirSync(destDirPath, { recursive: true });
    }

    fs.copyFileSync(sourcePath, destPath);
    console.log(chalk.green(`  ✓ 已复制 ${ruleId} → ${isToProject ? '项目' : '全局'}`));
  }

  const shouldDelete = await confirm({
    message: '是否删除源文件？',
    default: false,
  });

  if (shouldDelete) {
    for (const ruleId of selected) {
      const sourcePath = path.join(sourceDir, ruleId);
      if (fs.existsSync(sourcePath)) {
        fs.unlinkSync(sourcePath);
      }
    }
    console.log(chalk.green(`  ✓ 已删除 ${selected.length} 个源文件`));
  }
}

async function moveSkillsFlow(): Promise<void> {
  const direction = await select({
    message: '移动方向：',
    choices: [
      { value: 'to-project', name: '全局 → 项目' },
      { value: 'to-global', name: '项目 → 全局' },
    ],
  });

  const isToProject = direction === 'to-project';
  const sourceDir = isToProject ? getGlobalSkillsDir() : getProjectSkillsDir();
  const destBaseDir = isToProject ? getProjectSkillsDir() : getGlobalSkillsDir();
  const sourceScope = isToProject ? 'global' : 'project';

  const skills = scanSkills(sourceDir, sourceScope as 'global' | 'project');

  if (skills.length === 0) {
    console.log(chalk.dim(`  ${isToProject ? '全局' : '项目'}中没有 skills`));
    return;
  }

  const selected = await checkbox({
    message: '选择要移动的 skills（a 全选，空格选择，回车确认）：',
    choices: skills
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((skill) => ({
        value: skill.absolutePath,
        name: `${skill.name}  ${chalk.dim(`${skill.fileCount} 个文件`)}`,
      })),
  });

  if (selected.length === 0) return;

  for (const sourcePath of selected) {
    const skill = skills.find((s) => s.absolutePath === sourcePath)!;
    const destPath = path.join(destBaseDir, skill.name);

    if (fs.existsSync(destPath)) {
      console.log(chalk.yellow(`\n  ⚠ 目标已存在 ${chalk.bold(skill.name)}`));

      const action = await select({
        message: `${skill.name} 如何处理？`,
        choices: [
          { value: 'overwrite', name: '覆盖' },
          { value: 'skip', name: '跳过' },
        ],
      });

      if (action === 'skip') continue;
      fs.rmSync(destPath, { recursive: true, force: true });
    }

    if (!fs.existsSync(destBaseDir)) {
      fs.mkdirSync(destBaseDir, { recursive: true });
    }

    // symlink 源创建 symlink 目标，普通目录复制
    if (skill.isSymlink && skill.symlinkTarget) {
      fs.symlinkSync(skill.symlinkTarget, destPath, 'junction');
      console.log(chalk.green(`  ✓ 已创建软链 ${skill.name} → ${isToProject ? '项目' : '全局'}`));
    } else {
      fs.cpSync(sourcePath, destPath, { recursive: true });
      console.log(chalk.green(`  ✓ 已复制 ${skill.name} → ${isToProject ? '项目' : '全局'}`));
    }
  }

  const shouldDelete = await confirm({
    message: '是否删除源目录？',
    default: false,
  });

  if (shouldDelete) {
    for (const sourcePath of selected) {
      if (fs.existsSync(sourcePath)) {
        fs.rmSync(sourcePath, { recursive: true, force: true });
      }
    }
    console.log(chalk.green(`  ✓ 已删除 ${selected.length} 个源目录`));
  }
}
