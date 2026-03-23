import { select } from '@inquirer/prompts';
import { getGlobalRulesDir, getProjectRulesDir, getGlobalSkillsDir, getProjectSkillsDir } from '../utils/paths.js';
import { scanRules, scanSkills } from '../utils/scanner.js';
import { printRules, printSkills } from '../utils/display.js';
import type { Rule, Skill } from '../types.js';

export async function listFlow(target: string): Promise<void> {
  if (target === 'rules') {
    await listRulesFlow();
  } else {
    await listSkillsFlow();
  }
}

async function listRulesFlow(): Promise<void> {
  const scope = await select({
    message: '查看哪些 rules？',
    choices: [
      { value: 'all', name: '全部' },
      { value: 'global', name: '全局' },
      { value: 'project', name: '项目' },
    ],
  });

  let rules: Rule[] = [];

  if (scope === 'global') {
    rules = scanRules(getGlobalRulesDir(), 'global');
    rules.sort((a, b) => a.id.localeCompare(b.id));
    console.log();
    printRules(rules, false);
  } else if (scope === 'project') {
    rules = scanRules(getProjectRulesDir(), 'project');
    rules.sort((a, b) => a.id.localeCompare(b.id));
    console.log();
    printRules(rules, false);
  } else {
    const globalRules = scanRules(getGlobalRulesDir(), 'global');
    const projectRules = scanRules(getProjectRulesDir(), 'project');
    globalRules.sort((a, b) => a.id.localeCompare(b.id));
    projectRules.sort((a, b) => a.id.localeCompare(b.id));
    console.log();
    console.log('  全局 rules');
    printRules(globalRules, false);
    console.log();
    console.log('  项目 rules');
    printRules(projectRules, false);
  }
}

async function listSkillsFlow(): Promise<void> {
  const scope = await select({
    message: '查看哪些 skills？',
    choices: [
      { value: 'all', name: '全部' },
      { value: 'global', name: '全局' },
      { value: 'project', name: '项目' },
    ],
  });

  let skills: Skill[] = [];

  if (scope === 'global') {
    skills = scanSkills(getGlobalSkillsDir(), 'global');
    skills.sort((a, b) => a.name.localeCompare(b.name));
    console.log();
    printSkills(skills, false);
  } else if (scope === 'project') {
    skills = scanSkills(getProjectSkillsDir(), 'project');
    skills.sort((a, b) => a.name.localeCompare(b.name));
    console.log();
    printSkills(skills, false);
  } else {
    const globalSkills = scanSkills(getGlobalSkillsDir(), 'global');
    const projectSkills = scanSkills(getProjectSkillsDir(), 'project');
    globalSkills.sort((a, b) => a.name.localeCompare(b.name));
    projectSkills.sort((a, b) => a.name.localeCompare(b.name));
    console.log();
    console.log('  全局 skills');
    printSkills(globalSkills, false);
    console.log();
    console.log('  项目 skills');
    printSkills(projectSkills, false);
  }
}
