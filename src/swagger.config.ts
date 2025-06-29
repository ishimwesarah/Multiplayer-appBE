// swagger.config.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kahoot-Clone API with Swagger',
      version: '1.0.0',
      description:
        'This is the API documentation for a Kahoot-like application, built with Express and documented with Swagger.',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'Your Name',
        url: 'https://your-website.com',
        email: 'info@email.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api', // Your base URL
      },
    ],
    // Add components for security, like Bearer Auth
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
  // Path to the API docs
  // Use .ts files for development, .js for production if you compile
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);