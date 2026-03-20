/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 格式化日期
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 计算阅读时间（分钟）
 */
export function calculateReadingTime(wordCount: number, wordsPerMinute: number = 300): number {
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 验证手机号（中国大陆）
 */
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证邮箱
 */
export function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * 延迟执行
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(delay * (i + 1));
      }
    }
  }
  throw lastError;
}

/**
 * 分页计算
 */
export function calculatePagination(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  return { skip, take };
}

/**
 * 统计中文字数
 */
export function countChineseWords(text: string): number {
  // 移除空白字符
  const cleaned = text.replace(/\s/g, '');
  // 统计中文字符
  const chinese = (cleaned.match(/[\u4e00-\u9fa5]/g) || []).length;
  // 统计英文单词（按空格分割）
  const english = (cleaned.match(/[a-zA-Z]+/g) || []).length;
  // 统计数字
  const numbers = (cleaned.match(/\d+/g) || []).length;
  return chinese + english + numbers;
}

/**
 * 敏感词替换
 */
export function maskSensitiveWord(text: string, word: string, mask: string = '*'): string {
  const regex = new RegExp(word, 'gi');
  return text.replace(regex, mask.repeat(word.length));
}

/**
 * 生成随机字符串
 */
export function randomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 移除对象中的空值
 */
export function removeEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      result[key] = obj[key];
    }
  }
  return result;
}
