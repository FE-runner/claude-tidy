import fs from 'node:fs';
import path from 'node:path';
import type { Rule, RuleScope, Skill } from '../types.js';
import { toRuleId } from './paths.js';
import { parseRuleFrontmatter } from './parser.js';

/**
 * 递归扫描目录下所有 .md 文件
 */
function walkMdFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMdFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * 扫描指定目录下的所有 rules
 */
export function scanRules(rulesDir: string, scope: RuleScope): Rule[] {
  const files = walkMdFiles(rulesDir);

  return files.map((filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { description, trigger } = parseRuleFrontmatter(content);
    const stat = fs.statSync(filePath);

    return {
      id: toRuleId(filePath, rulesDir),
      absolutePath: filePath,
      scope,
      description,
      trigger,
      mtime: stat.mtime,
    };
  });
}

/**
 * 递归扫描 skills 目录
 * 以 SKILL.md 存在作为 skill 根目录的标志
 */
export function scanSkills(skillsDir: string): Skill[] {
  if (!fs.existsSync(skillsDir)) return [];

  const skills: Skill[] = [];
  scanSkillsRecursive(skillsDir, skills);
  return skills;
}

function scanSkillsRecursive(dir: string, results: Skill[]): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const fullPath = path.join(dir, entry.name);
    const skillMdPath = path.join(fullPath, 'SKILL.md');

    if (fs.existsSync(skillMdPath)) {
      // 找到一个 skill，计算文件数量
      const fileCount = countFiles(fullPath);
      results.push({
        name: entry.name,
        absolutePath: fullPath,
        fileCount,
      });
    } else {
      // 不是 skill 根目录，继续递归（处理 skills/skills/ 嵌套）
      scanSkillsRecursive(fullPath, results);
    }
  }
}

/**
 * 递归计算目录下的文件总数
 */
function countFiles(dir: string): number {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(fullPath);
    } else if (entry.isFile()) {
      count++;
    }
  }

  return count;
}
