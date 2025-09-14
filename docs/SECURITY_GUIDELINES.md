# Security Guidelines

This document outlines security best practices and guidelines for the Evently application.

## Authentication & Authorization

### JSON Web Tokens (JWT)

Evently uses JWT for stateless authentication with the following security measures:

1. **Token Structure**:
   - `Header`: Algorithm information
   - `Payload`: User ID, role, and expiration time
   - `Signature`: HMAC-SHA256 signature using a secret key

2. **JWT Best Practices**:
   - Set appropriate expiration times (default: 24 hours)
   - Use HTTPS to transmit tokens
   - Store tokens securely on the client-side (HTTP-only cookies when possible)
   - Implement token refresh mechanism for extended sessions
   - Don't store sensitive information in the token payload

Example JWT configuration:

```typescript
// src/utils/jwt.util.ts
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IUser } from '../interfaces/user.interface';

export const generateToken = (user: IUser): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiration
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwtSecret);
};
```

### Role-Based Access Control (RBAC)

Evently implements RBAC to control access to resources:

1. **User Roles**:
   - `user`: Regular user with limited permissions
   - `admin`: Administrator with full access

2. **Authorization Middleware**:

```typescript
// src/middleware/authorization.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError();
    }

    next();
  };
};
```

3. **Usage in Routes**:

```typescript
// Apply role-based authorization
router.post('/events', authenticate, authorize(['admin']), eventController.createEvent);
router.get('/bookings', authenticate, authorize(['user', 'admin']), bookingController.getUserBookings);
```

## Password Security

### Password Hashing

1. **Bcrypt Implementation**:

```typescript
// src/utils/password.util.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

2. **User Registration Flow**:

```typescript
// src/services/auth.service.ts
import { UserRepository } from '../repositories/user.repository';
import { hashPassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(userData: RegisterUserDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: 'user' // Default role
    });

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Generate token
    const token = generateToken(savedUser);

    return { user: savedUser, token };
  }
}
```

### Password Policies

Enforce strong password requirements:

```typescript
// src/validators/auth.validator.ts
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
});
```

## Data Validation & Sanitization

### Input Validation

Validate all user inputs before processing:

```typescript
// src/validators/event.validator.ts
import Joi from 'joi';

export const validateEvent = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().allow('', null),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    venueId: Joi.string().uuid().required(),
    capacity: Joi.number().integer().min(1).required(),
    ticketPrice: Joi.number().precision(2).min(0).required(),
    isPublished: Joi.boolean().default(false)
  });

  return schema.validate(data);
};
```

### SQL Injection Prevention

Use parameterized queries with TypeORM:

```typescript
// Example of safe query with TypeORM
const users = await this.userRepository
  .createQueryBuilder('user')
  .where('user.email = :email', { email: userEmail })
  .getOne();

// Instead of string concatenation (UNSAFE):
// const users = await this.userRepository.query(`SELECT * FROM users WHERE email = '${userEmail}'`);
```

## API Security

### Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// src/middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

// More strict limit for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  }
});
```

### CORS Configuration

Restrict cross-origin requests:

```typescript
// src/app.ts
import cors from 'cors';
import { config } from './config';

// CORS configuration
const corsOptions = {
  origin: config.allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

### Content Security Policy

Implement Content Security Policy headers:

```typescript
// src/middleware/security-headers.middleware.ts
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Set CSP headers
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; object-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'none'; connect-src 'self'"
  );
  
  next();
};

// In app.ts
app.use(helmet());
app.use(securityHeaders);
```

## Data Protection

### Personally Identifiable Information (PII)

Protect PII with the following measures:

1. **Data Minimization**: Only collect necessary information
2. **Data Encryption**: Encrypt sensitive data at rest
3. **Access Control**: Restrict access to PII to authorized personnel
4. **Data Masking**: Mask sensitive data in logs and responses

Example of sensitive data handling:

```typescript
// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { logger } from '../logger';

export class UserController {
  constructor(private userService: UserService) {}

  async getUser(req: Request, res: Response) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      
      // Remove sensitive data before sending response
      const sanitizedUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      };
      
      return res.json({ success: true, data: sanitizedUser });
    } catch (error) {
      // Log without sensitive data
      logger.error('Error getting user', { 
        userId: req.params.id,
        error: error.message 
      });
      
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
```

### Payment Information

Handle payment information securely:

1. **Never store full card numbers**
2. **Use a trusted payment processor**
3. **Implement PCI DSS compliance measures**
4. **Tokenize payment details**

Example payment handling:

```typescript
// src/services/payment.service.ts
import Stripe from 'stripe';
import { config } from '../config';
import { logger } from '../logger';

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2023-10-16'
});

export class PaymentService {
  async processPayment(paymentDetails: PaymentDetailsDto, amount: number) {
    try {
      // Create payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: paymentDetails.cardNumber,
          exp_month: paymentDetails.expiryMonth,
          exp_year: paymentDetails.expiryYear,
          cvc: paymentDetails.cvv
        }
      });
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        payment_method: paymentMethod.id,
        confirm: true,
        return_url: config.paymentReturnUrl
      });
      
      // Never log full card details
      logger.info('Payment processed', {
        paymentIntentId: paymentIntent.id,
        amount,
        last4: paymentDetails.cardNumber.slice(-4)
      });
      
      return {
        paymentId: paymentIntent.id,
        status: paymentIntent.status
      };
    } catch (error) {
      logger.error('Payment processing error', {
        error: error.message,
        last4: paymentDetails.cardNumber.slice(-4)
      });
      
      throw new Error('Payment processing failed');
    }
  }
}
```

## Error Handling & Logging

### Secure Error Handling

Implement secure error handling to prevent information leakage:

```typescript
// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log the error (with sensitive data removed)
  logger.error('Application error', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Don't expose error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong' 
    : err.message;
  
  // Don't expose stack traces in response
  return res.status(500).json({
    success: false,
    message
  });
};
```

### Secure Logging

Implement secure logging practices:

```typescript
// src/logger.ts
import winston from 'winston';
import { config } from './config';

// Sanitize sensitive data before logging
const sanitizeData = (info: any) => {
  if (info.meta) {
    // Remove sensitive fields
    if (info.meta.password) info.meta.password = '[REDACTED]';
    if (info.meta.cardNumber) info.meta.cardNumber = '[REDACTED]';
    if (info.meta.cvv) info.meta.cvv = '[REDACTED]';
    
    // Only keep last 4 digits of card number if it exists as last4
    if (info.meta.last4 && info.meta.last4.length > 4) {
      info.meta.last4 = info.meta.last4.slice(-4);
    }
  }
  
  return info;
};

const logger = winston.createLogger({
  level: config.logLevel || 'info',
  format: winston.format.combine(
    winston.format(sanitizeData)(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'evently-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    }),
  ],
});

export { logger };
```

## Environment & Configuration Security

### Environment Variables

Secure your environment variables:

1. **Use .env file for local development**
2. **Use secrets management for production**
3. **Never commit .env files to version control**
4. **Validate environment variables at startup**

Example configuration validation:

```typescript
// src/config.ts
import dotenv from 'dotenv';
import Joi from 'joi';
import fs from 'fs';
import path from 'path';

// Load environment variables
if (fs.existsSync('.env')) {
  dotenv.config();
}

// Define validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(3306),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRATION: Joi.string().default('24h')
})
  .unknown()
  .required();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export configuration
export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  database: {
    host: envVars.DATABASE_HOST,
    port: envVars.DATABASE_PORT,
    username: envVars.DATABASE_USERNAME,
    password: envVars.DATABASE_PASSWORD,
    name: envVars.DATABASE_NAME
  },
  jwtSecret: envVars.JWT_SECRET,
  jwtExpiration: envVars.JWT_EXPIRATION,
  allowedOrigins: envVars.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  logLevel: envVars.LOG_LEVEL || 'info'
};
```

## Dependency Security

### Dependency Scanning

Regularly scan dependencies for vulnerabilities:

```bash
# Run npm audit to check for vulnerabilities
npm audit

# Fix vulnerabilities when possible
npm audit fix

# For more detailed reporting
npm audit --json
```

### Lock Files

Use lock files to ensure dependency integrity:

- Commit `package-lock.json` or `yarn.lock` to version control
- Regularly update dependencies with security patches

## Security Testing

### Automated Security Testing

Implement automated security testing:

1. **Static Application Security Testing (SAST)**:
   - Use tools like ESLint with security plugins
   - Scan for common security issues

   ```bash
   # Install ESLint security plugin
   npm install eslint-plugin-security

   # Configure ESLint to use security plugin
   # .eslintrc.js
   module.exports = {
     plugins: ['security'],
     extends: ['plugin:security/recommended']
   };
   ```

2. **Dependency Vulnerability Scanning**:
   - Include in CI/CD pipeline

   ```yaml
   # .github/workflows/security.yml
   name: Security Checks

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]
     schedule:
       - cron: '0 0 * * 0'  # Run weekly

   jobs:
     security:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '14'
             
         - name: Install dependencies
           run: npm ci
           
         - name: Run security linting
           run: npm run lint
           
         - name: Check for vulnerabilities
           run: npm audit --audit-level=high
   ```

3. **Penetration Testing**:
   - Conduct regular penetration testing
   - Use tools like OWASP ZAP for automated scanning

## Incident Response

### Security Incident Response Plan

Develop a security incident response plan:

1. **Preparation**:
   - Define roles and responsibilities
   - Establish communication channels
   - Document systems and assets

2. **Detection and Analysis**:
   - Monitor logs and alerts
   - Investigate suspicious activities
   - Determine scope and impact

3. **Containment**:
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IP addresses

4. **Eradication**:
   - Remove malware or vulnerabilities
   - Patch affected systems
   - Reset compromised credentials

5. **Recovery**:
   - Restore systems from clean backups
   - Verify system integrity
   - Monitor for additional issues

6. **Post-Incident Activities**:
   - Document the incident
   - Perform root cause analysis
   - Improve security controls

## Compliance

### GDPR Compliance

Implement GDPR compliance measures:

1. **Data Subject Rights**:
   - Right to access
   - Right to be forgotten
   - Right to data portability

   ```typescript
   // src/services/user.service.ts
   export class UserService {
     // User data export (data portability)
     async exportUserData(userId: string) {
       const user = await this.userRepository.findOne({
         where: { id: userId },
         relations: ['bookings', 'waitlistEntries']
       });
       
       if (!user) {
         throw new Error('User not found');
       }
       
       // Return user data in portable format
       return {
         personalInfo: {
           email: user.email,
           firstName: user.firstName,
           lastName: user.lastName
         },
         bookings: user.bookings.map(booking => ({
           eventId: booking.eventId,
           status: booking.status,
           createdAt: booking.createdAt
         })),
         waitlistEntries: user.waitlistEntries.map(entry => ({
           eventId: entry.eventId,
           numberOfTickets: entry.numberOfTickets,
           position: entry.position,
           createdAt: entry.createdAt
         }))
       };
     }
     
     // Right to be forgotten
     async deleteUserData(userId: string) {
       const user = await this.userRepository.findOne({
         where: { id: userId }
       });
       
       if (!user) {
         throw new Error('User not found');
       }
       
       // Anonymize user data instead of hard delete
       user.email = `deleted-${uuidv4()}@example.com`;
       user.firstName = 'Deleted';
       user.lastName = 'User';
       user.password = await hashPassword(crypto.randomBytes(16).toString('hex'));
       
       return this.userRepository.save(user);
     }
   }
   ```

2. **Privacy Policy**:
   - Transparent data collection
   - Clear purpose for data usage
   - Data retention policies

3. **Data Breach Notification**:
   - Process for notifying authorities
   - Process for notifying affected users

### PCI DSS Compliance

If handling payment card data:

1. **Minimize PCI Scope**:
   - Use third-party payment processors
   - Never store full card details

2. **Network Security**:
   - Implement firewalls
   - Segment cardholder data environment

3. **Secure Transmission**:
   - Use TLS for all payment data
   - Validate certificates

## Security Hardening

### Server Hardening

1. **OS Hardening**:
   - Keep OS updated
   - Minimize installed packages
   - Configure firewall rules

2. **Application Hardening**:
   - Run as non-root user
   - Use container security features
   - Implement proper file permissions

Example Docker configuration:

```dockerfile
FROM node:14-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:14-alpine

WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Set proper permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Database Hardening

1. **Access Control**:
   - Use least privilege principle
   - Create application-specific database user
   - Restrict database user permissions

2. **Connection Security**:
   - Use TLS for database connections
   - Implement connection pooling
   - Set connection timeouts

Example database configuration:

```typescript
// src/database/connection.ts
import { createConnection, ConnectionOptions } from 'typeorm';
import { config } from '../config';

const connectionOptions: ConnectionOptions = {
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: [__dirname + '/../models/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: config.env === 'development',
  ssl: config.env === 'production' ? {
    rejectUnauthorized: true,
    ca: [fs.readFileSync(path.join(__dirname, '../certs/ca.pem')).toString()]
  } : undefined,
  extra: {
    connectionLimit: 10,
    connectTimeout: 30000,
    acquireTimeout: 30000
  }
};

export const initializeDatabase = async () => {
  try {
    const connection = await createConnection(connectionOptions);
    console.log('Database connection established');
    return connection;
  } catch (error) {
    console.error('Database connection failed', error);
    throw error;
  }
};
```
