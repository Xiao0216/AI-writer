export function isPreviewMode(): boolean {
  return process.env.SKIP_DB_CONNECT === 'true';
}
