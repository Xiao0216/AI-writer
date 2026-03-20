/**
 * 用户角色枚举
 */
export enum UserRole {
  USER = 'user',           // 普通用户
  VIP = 'vip',             // VIP会员
  PROFESSIONAL = 'professional', // 专业会员
  STUDIO = 'studio',       // 工作室账号
  STUDIO_MEMBER = 'studio_member', // 工作室成员
  ADMIN = 'admin',         // 管理员
}

/**
 * 作品状态枚举
 */
export enum WorkStatus {
  DRAFT = 'draft',         // 草稿
  ONGOING = 'ongoing',     // 连载中
  COMPLETED = 'completed', // 已完结
  ARCHIVED = 'archived',   // 已归档
}

/**
 * 章节状态枚举
 */
export enum ChapterStatus {
  DRAFT = 'draft',         // 草稿
  PUBLISHED = 'published', // 已发布
  ARCHIVED = 'archived',   // 已归档
}

/**
 * 作品品类枚举
 */
export enum WorkCategory {
  XUANHUAN = 'xuanhuan',   // 玄幻
  QIHUAN = 'qihuan',       // 奇幻
  WUXIA = 'wuxia',         // 武侠
  XIANXIA = 'xianxia',     // 仙侠
  DUSHI = 'dushi',         // 都市
  YANQING = 'yanqing',     // 言情
  XUANYI = 'xuanyi',       // 悬疑
  KEHUAN = 'kehuan',       // 科幻
  LISHI = 'lishi',         // 历史
  JUNSHI = 'junshi',       // 军事
  YOUXI = 'youxi',         // 游戏
  TIYU = 'tiyu',           // 体育
  LINGYI = 'lingyi',       // 灵异
  QITA = 'qita',           // 其他
}

/**
 * 目标平台枚举
 */
export enum TargetPlatform {
  FANQIE = 'fanqie',       // 番茄小说
  QIDIAN = 'qidian',       // 起点
  JINJIANG = 'jinjiang',   // 晋江
  QIMAO = 'qimao',         // 七猫
  ZONGHENG = 'zongheng',   // 纵横
  OTHER = 'other',         // 其他
}

/**
 * 节点类型枚举
 */
export enum NodeType {
  REQUIRED = 'required',   // 必选节点
  OPTIONAL = 'optional',   // 可选节点
}

/**
 * 节点状态枚举
 */
export enum NodeStatus {
  PENDING = 'pending',     // 待执行
  IN_PROGRESS = 'in_progress', // 执行中
  COMPLETED = 'completed', // 已完成
  SKIPPED = 'skipped',     // 已跳过
}

/**
 * 伏笔状态枚举
 */
export enum ForeshadowingStatus {
  PLANTED = 'planted',     // 已埋设
  RECALLED = 'recalled',   // 已回收
  ABANDONED = 'abandoned', // 已废弃
}

/**
 * 会员套餐枚举
 */
export enum MembershipPlan {
  FREE = 'free',
  VIP_MONTHLY = 'vip_monthly',
  VIP_QUARTERLY = 'vip_quarterly',
  VIP_YEARLY = 'vip_yearly',
  PRO_MONTHLY = 'pro_monthly',
  PRO_QUARTERLY = 'pro_quarterly',
  PRO_YEARLY = 'pro_yearly',
  STUDIO_CUSTOM = 'studio_custom',
}

/**
 * 支付状态枚举
 */
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * 敏感词风险等级
 */
export enum SensitiveLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * 工作室成员角色
 */
export enum StudioRole {
  OWNER = 'owner',         // 主账号
  ADMIN = 'admin',         // 管理员
  EDITOR = 'editor',       // 编辑
  CREATOR = 'creator',     // 创作者
  REVIEWER = 'reviewer',   // 审核员
}
