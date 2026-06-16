const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee Management System API',
      version: '1.0.0',
      description: 'A comprehensive Employee Management System API with role-based access control, attendance tracking, and leave management',
      contact: {
        name: 'API Support',
        email: 'support@ems.com',
        url: 'https://github.com/yourrepo/ems'
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
        url: 'https://api.yourdomain.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token with Bearer prefix'
        }
      },
      schemas: {
        // User Schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
            full_name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['admin', 'manager', 'employee'], example: 'employee' },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        
        // Employee Schemas
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            department_id: { type: 'string', format: 'uuid' },
            full_name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', example: '+1234567890' },
            position: { type: 'string', example: 'Software Engineer' },
            salary: { type: 'number', format: 'decimal', example: 75000.00 },
            employment_date: { type: 'string', format: 'date' },
            manager_id: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['active', 'inactive', 'on_leave', 'terminated'] },
            employee_code: { type: 'string', example: 'EMP0001' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        
        // Department Schemas
        Department: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Information Technology' },
            description: { type: 'string', example: 'IT Department' },
            manager_id: { type: 'string', format: 'uuid' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        
        // Attendance Schemas
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            employee_id: { type: 'string', format: 'uuid' },
            date: { type: 'string', format: 'date', example: '2024-01-15' },
            check_in: { type: 'string', format: 'date-time' },
            check_out: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['present', 'absent', 'late', 'half_day'] },
            working_hours: { type: 'number', format: 'float', example: 8.5 },
            overtime: { type: 'number', format: 'float', example: 0.5 },
            notes: { type: 'string' }
          }
        },
        
        // Leave Schemas
        Leave: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            employee_id: { type: 'string', format: 'uuid' },
            leave_type: { type: 'string', enum: ['sick', 'vacation', 'personal', 'unpaid', 'maternity', 'paternity', 'bereavement'] },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            total_days: { type: 'integer', example: 5 },
            reason: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'cancelled'] },
            approved_by: { type: 'string', format: 'uuid' },
            approved_date: { type: 'string', format: 'date-time' },
            rejection_reason: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        
        // Leave Balance Schemas
        LeaveBalance: {
          type: 'object',
          properties: {
            vacation_balance: { type: 'number', format: 'float', example: 15.5 },
            sick_balance: { type: 'number', format: 'float', example: 10 },
            personal_balance: { type: 'number', format: 'float', example: 5 },
            last_accrual_date: { type: 'string', format: 'date' },
            next_accrual_date: { type: 'string', format: 'date' }
          }
        },
        
        // Auth Schemas
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@example.com' },
            password: { type: 'string', format: 'password', example: 'admin123' }
          }
        },
        
        RegisterRequest: {
          type: 'object',
          required: ['full_name', 'email', 'password', 'employee_code'],
          properties: {
            full_name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
            employee_code: { type: 'string', example: 'EMP0001' },
            role: { type: 'string', enum: ['admin', 'manager', 'employee'], example: 'employee' }
          }
        },
        
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'fail' },
            message: { type: 'string', example: 'Error message here' }
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
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './docs/*.js'
  ]
};

const specs = swaggerJsdoc(options);
module.exports = specs;