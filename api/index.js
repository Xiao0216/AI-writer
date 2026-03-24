const { createApp } = require('../apps/api/dist/app.factory');

let cachedHandler = null;

async function getHandler() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const app = await createApp();
  const adapter = app.getHttpAdapter();
  cachedHandler = adapter.getInstance();
  return cachedHandler;
}

module.exports = async (req, res) => {
  const handler = await getHandler();
  return handler(req, res);
};
