import type { RuleTrigger } from '../types.js';

export interface ParsedFrontmatter {
  description: string | undefined;
  trigger: RuleTrigger;
}

/**
 * 解析 rule 文件的 YAML frontmatter
 * 手写解析避免 js-yaml 对 glob 模式（*）的 alias 误判
 */
export function parseRuleFrontmatter(content: string): ParsedFrontmatter {
  // 检查是否有 frontmatter
  if (!content.startsWith('---')) {
    return { description: undefined, trigger: { type: 'none' } };
  }

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) {
    return { description: undefined, trigger: { type: 'none' } };
  }

  const frontmatterBlock = content.slice(3, endIdx).trim();
  const fields = parseFrontmatterFields(frontmatterBlock);

  const description = fields.get('description');

  let trigger: RuleTrigger;
  if (fields.get('alwaysApply') === 'true') {
    trigger = { type: 'alwaysApply' };
  } else if (fields.has('globs') && fields.get('globs')!.length > 0) {
    trigger = { type: 'globs', patterns: fields.get('globs')! };
  } else {
    trigger = { type: 'none' };
  }

  return { description, trigger };
}

/**
 * 简单解析 frontmatter 字段（key: value 行）
 * 不处理多行值、嵌套对象等复杂 YAML 特性
 */
function parseFrontmatterFields(block: string): Map<string, string> {
  const fields = new Map<string, string>();

  for (const line of block.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    if (key.length > 0) {
      fields.set(key, value);
    }
  }

  return fields;
}
