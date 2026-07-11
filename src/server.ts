import app from './app';
import config from './config/env';
import prisma from './config/prisma';

const PORT = config.port;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 FixItNow server is running on http://localhost:${PORT}`);
      console.log(`📚 Environment: ${config.nodeEnv}`);
      console.log(`🔑 JWT Secret: ${config.jwt.secret ? '✅ Set' : '❌ Not set'}`);
      console.log(`💳 Stripe: ${config.stripe.secretKey ? '✅ Configured' : '❌ Not configured'}`);
      console.log(`🏷️  SSL Store: ${config.sslCommerz.storeId ? '✅ Configured' : '❌ Not configured'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;