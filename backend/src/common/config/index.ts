import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:3000',
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  name: process.env.DB_DATABASE || 'wenshu_ai',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'wenshu-ai-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB, 10) || 0,
}));

export const aiConfig = registerAs('ai', () => ({
  // AI模型配置
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  
  // 向量数据库
  milvusHost: process.env.MILVUS_HOST || 'localhost',
  milvusPort: parseInt(process.env.MILVUS_PORT, 10) || 19530,
  
  // 知识图谱
  neo4jUri: process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4jUsername: process.env.NEO4J_USERNAME || 'neo4j',
  neo4jPassword: process.env.NEO4J_PASSWORD || '',
  
  // 模型存储
  modelsPath: process.env.MODELS_PATH || './engine/models',
}));

export const storageConfig = registerAs('storage', () => ({
  // MinIO 对象存储
  minioEndpoint: process.env.MINIO_ENDPOINT || 'localhost',
  minioPort: parseInt(process.env.MINIO_PORT, 10) || 9000,
  minioAccessKey: process.env.MINIO_ACCESS_KEY || '',
  minioSecretKey: process.env.MINIO_SECRET_KEY || '',
  minioBucket: process.env.MINIO_BUCKET || 'wenshu-ai',
  minioUseSSL: process.env.MINIO_USE_SSL === 'true',
}));

export const thirdPartyConfig = registerAs('thirdParty', () => ({
  // 微信登录
  wechatAppId: process.env.WECHAT_APP_ID || '',
  wechatAppSecret: process.env.WECHAT_APP_SECRET || '',
  
  // 短信服务
  smsAccessKeyId: process.env.SMS_ACCESS_KEY_ID || '',
  smsAccessKeySecret: process.env.SMS_ACCESS_KEY_SECRET || '',
  smsSignName: process.env.SMS_SIGN_NAME || '',
  smsTemplateCode: process.env.SMS_TEMPLATE_CODE || '',
  
  // 支付
  wechatPayMchId: process.env.WECHAT_PAY_MCH_ID || '',
  wechatPayApiKey: process.env.WECHAT_PAY_API_KEY || '',
  alipayAppId: process.env.ALIPAY_APP_ID || '',
  alipayPrivateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  
  // 区块链存证
  blockchainApiKey: process.env.BLOCKCHAIN_API_KEY || '',
  blockchainApiUrl: process.env.BLOCKCHAIN_API_URL || '',
}));
