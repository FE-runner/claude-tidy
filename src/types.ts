/** rule 的作用域 */
export type RuleScope = 'global' | 'project';

/** rule frontmatter 中的触发方式 */
export type RuleTrigger =
  | { type: 'alwaysApply' }
  | { type: 'globs'; patterns: string }
  | { type: 'none' };

/** 解析后的 rule 信息 */
export interface Rule {
  /** 相对路径标识符，如 react/core.md */
  id: string;
  /** 文件绝对路径 */
  absolutePath: string;
  /** 作用域 */
  scope: RuleScope;
  /** frontmatter 中的 description */
  description: string | undefined;
  /** 触发方式 */
  trigger: RuleTrigger;
  /** 文件修改时间 */
  mtime: Date;
}

/** skill 信息 */
export interface Skill {
  /** skill 名称（目录名） */
  name: string;
  /** skill 根目录绝对路径 */
  absolutePath: string;
  /** 包含的文件总数 */
  fileCount: number;
  /** 作用域 */
  scope: RuleScope;
  /** 是否是 symlink */
  isSymlink: boolean;
  /** symlink 目标路径（仅 isSymlink 为 true 时有值） */
  symlinkTarget: string | undefined;
}

/** diff 总览表中的一行 */
export interface DiffSummaryItem {
  /** rule 相对路径标识符 */
  id: string;
  /** 全局版本修改时间（不存在则为 undefined） */
  globalMtime: Date | undefined;
  /** 项目版本修改时间（不存在则为 undefined） */
  projectMtime: Date | undefined;
  /** 状态描述 */
  status: '全局更新' | '项目更新' | '仅全局' | '仅项目' | '时间相同';
}
