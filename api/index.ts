import type { VercelRequest, VercelResponse } from '@vercel/node';

import { createApp } from '../apps/api/src/app.factory';

let cachedHandler:
  | ((req: VercelRequest, res: VercelResponse) => void)
  | null = null;

async function getHandler() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const app = await createApp();
  const adapter = app.getHttpAdapter();
  const instance = adapter.getInstance();

  cachedHandler = instance;
  return cachedHandler;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const expressHandler = await getHandler();
  return expressHandler(req, res);
}
