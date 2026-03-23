import fs from 'node:fs';
import path from 'node:path';
import type { Rule, RuleScope, Skill } from '../types.js';
import { toRuleId } from './paths.js';
import { parseRuleFrontmatter } from './parser.js';

/**
 * 取文件的实际最新时间（创建时间和修改时间中较晚的）
 * 解决复制文件时 mtime 被保留但 birthtime 是新的问题
 */
export function getLatestTime(filePath: string): Date {
  const stat = fs.statSync(filePath);
  return stat.birthtime.getTime() > stat.mtime.getTime() ? stat.birthtime : stat.mtime;
}

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

    return {
      id: toRuleId(filePath, rulesDir),
      absolutePath: filePath,
      scope,
      description,
      trigger,
      mtime: getLatestTime(filePath),
    };
  });
}

/**
 * 递归扫描 skills 目录
 * 以 SKILL.md 存在作为 skill 根目录的标志
 */
export function scanSkills(skillsDir: string, scope: RuleScope): Skill[] {
  if (!fs.existsSync(skillsDir)) return [];

  const skills: Skill[] = [];
  scanSkillsRecursive(skillsDir, scope, skills);
  return skills;
}

function scanSkillsRecursive(dir: string, scope: RuleScope, results: Skill[]): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // 用 statSync 跟踪 symlink，判断目标是否是目录
    let isDir: boolean;
    try {
      isDir = fs.statSync(fullPath).isDirectory();
    } catch {
      continue;
    }
    if (!isDir) continue;
    const skillMdPath = path.join(fullPath, 'SKILL.md');

    if (fs.existsSync(skillMdPath)) {
      const fileCount = countFiles(fullPath);
      const isSymlink = fs.lstatSync(fullPath).isSymbolicLink();
      const symlinkTarget = isSymlink ? fs.readlinkSync(fullPath) : undefined;
      results.push({
        name: entry.name,
        absolutePath: fullPath,
        fileCount,
        scope,
        isSymlink,
        symlinkTarget,
      });
    } else {
      // 不是 skill 根目录，继续递归（处理 skills/skills/ 嵌套）
      scanSkillsRecursive(fullPath, scope, results);
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
    let stat: fs.Stats;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      count += countFiles(fullPath);
    } else if (stat.isFile()) {
      count++;
    }
  }

  return count;
}
