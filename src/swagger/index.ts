import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';

export const setupSwagger = (app: any): void => {
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve Swagger JSON
  app.get('/api-docs.json', (_req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger documentation available at: /api-docs');
};