import { createApp } from './app.factory';

async function bootstrap() {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen(port, host);
  console.log(`[bootstrap] listening on http://${host}:${port}`);
}
void bootstrap();
