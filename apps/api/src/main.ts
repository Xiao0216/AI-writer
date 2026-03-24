import { createApp } from './app.factory';

async function bootstrap() {
  const app = await createApp();

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
