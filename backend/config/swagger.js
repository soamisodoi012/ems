const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Management System API',
      version: '1.0.0',
      description: 'API documentation for Employee Management System',
      contact: {
        name: 'API Support',
        email: 'support@ems.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.ems.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            full_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'manager', 'employee'] },
            is_active: { type: 'boolean' },
            employee_id: { type: 'string', format: 'uuid', nullable: true },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            full_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            position: { type: 'string' },
            salary: { type: 'number', format: 'decimal' },
            employment_date: { type: 'string', format: 'date' },
            department_id: { type: 'string', format: 'uuid', nullable: true },
            manager_id: { type: 'string', format: 'uuid', nullable: true },
            status: { type: 'string', enum: ['active', 'inactive', 'on_leave', 'terminated'] },
            employee_code: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Department: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            manager_id: { type: 'string', format: 'uuid', nullable: true },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            employee_id: { type: 'string', format: 'uuid' },
            date: { type: 'string', format: 'date' },
            check_in: { type: 'string', format: 'date-time', nullable: true },
            check_out: { type: 'string', format: 'date-time', nullable: true },
            status: { type: 'string', enum: ['present', 'absent', 'late', 'half_day'] },
            working_hours: { type: 'number', format: 'float' },
            overtime: { type: 'number', format: 'float' },
            notes: { type: 'string' }
          }
        },
        Leave: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            employee_id: { type: 'string', format: 'uuid' },
            leave_type: { type: 'string', enum: ['sick', 'vacation', 'personal', 'unpaid', 'maternity', 'paternity', 'bereavement'] },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            total_days: { type: 'integer' },
            reason: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'cancelled'] },
            approved_by: { type: 'string', format: 'uuid', nullable: true },
            rejection_reason: { type: 'string', nullable: true }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js'] // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;