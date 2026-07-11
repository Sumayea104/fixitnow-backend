import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string({ required_error: 'DATABASE_URL is required' }).url(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  
  JWT_SECRET: z.string({ required_error: 'JWT_SECRET is required' }),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  STRIPE_SECRET_KEY: z.string({ required_error: 'STRIPE_SECRET_KEY is required' }),
  STRIPE_WEBHOOK_SECRET: z.string({ required_error: 'STRIPE_WEBHOOK_SECRET is required' }),
  
  SSL_STORE_ID: z.string({ required_error: 'SSL_STORE_ID is required' }),
  SSL_STORE_PASSWORD: z.string({ required_error: 'SSL_STORE_PASSWORD is required' }),
  SSL_BASE_URL: z.string().url().default('https://sandbox.sslcommerz.com'),
  
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const config = {
  port: parsedEnv.data.PORT,
  nodeEnv: parsedEnv.data.NODE_ENV,
  bcryptSaltRounds: parsedEnv.data.BCRYPT_SALT_ROUNDS,
  database: {
    url: parsedEnv.data.DATABASE_URL,
  },
  jwt: {
    secret: parsedEnv.data.JWT_SECRET,
    expiresIn: parsedEnv.data.JWT_EXPIRES_IN,
  },
  stripe: {
    secretKey: parsedEnv.data.STRIPE_SECRET_KEY,
    webhookSecret: parsedEnv.data.STRIPE_WEBHOOK_SECRET,
  },
  sslCommerz: {
    storeId: parsedEnv.data.SSL_STORE_ID,
    storePassword: parsedEnv.data.SSL_STORE_PASSWORD,
    baseUrl: parsedEnv.data.SSL_BASE_URL,
  },
  frontend: {
    url: parsedEnv.data.FRONTEND_URL,
  },
};

export default config;