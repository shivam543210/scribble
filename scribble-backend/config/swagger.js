const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scribble API',
      version: '1.0.0',
      description: 'API documentation for the Scribble backend',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Server',
      },
    ],
  },
  apis: ['./routes/*.js', './server.js'], // Files containing annotations
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger Docs available at ${process.env.API_URL || 'http://localhost:5000'}/api-docs`);
};

module.exports = setupSwagger;
