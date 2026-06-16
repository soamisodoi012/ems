const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const errorMiddleware = require('./middleware/errorMiddleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'EMS API Documentation'
}));

// ============ SWAGGER DOWNLOAD ENDPOINTS ============

/**
 * Download OpenAPI specification as JSON
 */
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=openapi.json');
  res.send(swaggerSpec);
});

/**
 * Download formatted OpenAPI specification
 */
app.get('/api-docs/download', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=ems-api-spec.json');
  res.send(JSON.stringify(swaggerSpec, null, 2));
});

/**
 * Download Postman collection
 */
app.get('/api-docs/postman', (req, res) => {
  const postmanCollection = convertToPostman(swaggerSpec);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=ems-postman-collection.json');
  res.send(JSON.stringify(postmanCollection, null, 2));
});

// Helper function to convert OpenAPI to Postman collection
function convertToPostman(openapiSpec) {
  const collection = {
    info: {
      name: openapiSpec.info.title || 'EMS API',
      description: openapiSpec.info.description || '',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: [],
    variable: [
      {
        key: 'baseUrl',
        value: 'http://localhost:5000/api',
        type: 'string'
      },
      {
        key: 'token',
        value: '',
        type: 'string'
      }
    ]
  };

  const paths = openapiSpec.paths || {};
  const tags = {};

  Object.keys(paths).forEach(path => {
    const methods = paths[path];
    Object.keys(methods).forEach(method => {
      const operation = methods[method];
      const tag = operation.tags && operation.tags[0] ? operation.tags[0] : 'default';
      
      if (!tags[tag]) {
        tags[tag] = [];
      }
      
      tags[tag].push({
        path,
        method,
        operation,
        summary: operation.summary || '',
        description: operation.description || '',
        parameters: operation.parameters || [],
        requestBody: operation.requestBody,
        responses: operation.responses || {},
        security: operation.security || []
      });
    });
  });

  Object.keys(tags).forEach(tagName => {
    const folder = {
      name: tagName,
      item: []
    };

    tags[tagName].forEach(endpoint => {
      const url = `{{baseUrl}}${endpoint.path}`;
      const headers = [];
      
      if (endpoint.security && endpoint.security.length > 0) {
        headers.push({
          key: 'Authorization',
          value: 'Bearer {{token}}',
          type: 'string'
        });
      }

      if (['post', 'put', 'patch'].includes(endpoint.method)) {
        headers.push({
          key: 'Content-Type',
          value: 'application/json',
          type: 'string'
        });
      }

      let body = {};
      let rawBody = '';
      if (endpoint.requestBody) {
        const content = endpoint.requestBody.content;
        if (content && content['application/json']) {
          const schema = content['application/json'].schema;
          const example = generateExampleFromSchema(schema);
          rawBody = JSON.stringify(example, null, 2);
          body = {
            mode: 'raw',
            raw: rawBody,
            options: {
              raw: {
                language: 'json'
              }
            }
          };
        }
      }

      let queryParams = [];
      if (endpoint.parameters) {
        queryParams = endpoint.parameters
          .filter(p => p.in === 'query')
          .map(p => ({
            key: p.name,
            value: p.schema && p.schema.example ? p.schema.example : '',
            description: p.description || '',
            disabled: !p.required
          }));
      }

      let pathParams = [];
      if (endpoint.parameters) {
        pathParams = endpoint.parameters
          .filter(p => p.in === 'path')
          .map(p => ({
            key: p.name,
            value: p.schema && p.schema.example ? p.schema.example : '{{id}}',
            description: p.description || ''
          }));
      }

      const item = {
        name: `${endpoint.method.toUpperCase()} ${endpoint.path}`,
        request: {
          method: endpoint.method.toUpperCase(),
          header: headers,
          url: {
            raw: url,
            host: ['{{baseUrl}}'],
            path: endpoint.path.split('/').filter(p => p),
            query: queryParams,
            variable: pathParams
          },
          body: body,
          description: endpoint.summary || endpoint.description || ''
        },
        response: []
      };

      if (endpoint.responses) {
        Object.keys(endpoint.responses).forEach(statusCode => {
          const response = endpoint.responses[statusCode];
          const example = generateExampleFromResponse(response);
          item.response.push({
            name: `Response ${statusCode}`,
            status: statusCode,
            code: parseInt(statusCode),
            body: JSON.stringify(example, null, 2)
          });
        });
      }

      folder.item.push(item);
    });

    collection.item.push(folder);
  });

  return collection;
}

function generateExampleFromSchema(schema) {
  if (!schema) return {};
  if (schema.example) return schema.example;
  
  if (schema.properties) {
    const example = {};
    Object.keys(schema.properties).forEach(key => {
      const prop = schema.properties[key];
      if (prop.example) {
        example[key] = prop.example;
      } else if (prop.type === 'string') {
        example[key] = prop.format === 'email' ? 'user@example.com' : 'string';
      } else if (prop.type === 'number' || prop.type === 'integer') {
        example[key] = 0;
      } else if (prop.type === 'boolean') {
        example[key] = true;
      } else if (prop.type === 'array') {
        example[key] = [];
      } else if (prop.type === 'object') {
        example[key] = generateExampleFromSchema(prop);
      } else {
        example[key] = null;
      }
    });
    return example;
  }
  
  return {};
}

function generateExampleFromResponse(response) {
  if (!response) return {};
  const content = response.content;
  if (content && content['application/json']) {
    const schema = content['application/json'].schema;
    return generateExampleFromSchema(schema);
  }
  return {
    status: 'success',
    message: 'Operation successful'
  };
}

// ============ END SWAGGER DOWNLOAD ENDPOINTS ============

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('🚀 Database connected successfully via Migrations.');
    
    app.listen(PORT, () => {
      console.log(`Server is live and running on port ${PORT}`);
      console.log(` API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(` OpenAPI JSON:      http://localhost:${PORT}/api-docs.json`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;