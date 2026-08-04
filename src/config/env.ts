import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const requiredMsg = (field: string) => `${field} is required. Please set it in your .env file.`;

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string({ required_error: requiredMsg('DATABASE_URL') }).url(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  
  // ===== JWT =====
  JWT_SECRET: z.string({ required_error: requiredMsg('JWT_SECRET') }),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // ===== Security & CORS =====
  CORS_ORIGIN: z.string().default('http://localhost:3000,https://fixitnow-frontend-52tc.vercel.app'),
  RATE_LIMIT_WINDOW: z.coerce.number().default(15),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  CSRF_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),
  
  // ===== Stripe =====
  STRIPE_SECRET_KEY: z.string().optional().default(''), 
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''), 
  STRIPE_PUBLISHABLE_KEY: z.string().optional().default(''),
  STRIPE_SUCCESS_URL: z.string().url().default('http://localhost:3000/payment/success'),
  STRIPE_CANCEL_URL: z.string().url().default('http://localhost:3000/payment/cancel'),
  
  // ===== SSLCommerz =====
  SSL_STORE_ID: z.string().optional().default(''),
  SSL_STORE_PASSWORD: z.string().optional().default(''),
  SSL_BASE_URL: z.string().url().default('https://sandbox.sslcommerz.com'),
  
  // ===== Frontend =====
  FRONTEND_URL: z.string().default('https://fixitnow-frontend-52tc.vercel.app'),
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
  cors: {

    origin: parsedEnv.data.CORS_ORIGIN.split(',').map((o) => o.trim()),
  },
  rateLimit: {
    window: parsedEnv.data.RATE_LIMIT_WINDOW,
    max: parsedEnv.data.RATE_LIMIT_MAX,
  },
  csrf: parsedEnv.data.CSRF_ENABLED,

  stripe: {
    secretKey: parsedEnv.data.STRIPE_SECRET_KEY,
    webhookSecret: parsedEnv.data.STRIPE_WEBHOOK_SECRET,
    publishableKey: parsedEnv.data.STRIPE_PUBLISHABLE_KEY,
    successUrl: parsedEnv.data.STRIPE_SUCCESS_URL,
    cancelUrl: parsedEnv.data.STRIPE_CANCEL_URL,
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