import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FixItNow API',
      version: '1.0.0',
      description: 'FixItNow - Your Trusted Home Service Platform',
      contact: {
        name: 'FixItNow Team',
        email: 'support@fixitnow.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
      {
        url: 'https://fixitnow-backend-m1ur.onrender.com', // 🌟 লাইভ রেন্ডার ইউআরএল আপডেট করা হয়েছে
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    './src/modules/**/*.route.ts',
    './dist/modules/**/*.route.js',
    './src/app.ts',
    './dist/app.js'
  ],
};

export const swaggerSpec = swaggerJsdoc(options);