# @repo/fastify-observability

Fastify plugin for observability features including request-scoped logging. Provides a persistent logger instance that's available throughout the entire request lifecycle, accessible from anywhere in your application.

## Features

- **Request-Scoped Logging** - Logger persists throughout the request lifecycle
- **Context Isolation** - Each request gets its own logger instance
- **Global Access** - Access logger from anywhere, not just route handlers
- **Child Loggers** - Automatically creates child loggers for each request
- **Type-Safe** - Full TypeScript support

## Installation

```bash
pnpm add @repo/fastify-observability fastify @repo/logging
```

## Usage

### Basic Setup

```typescript
import { registerPerRequestLogger } from '@repo/fastify-observability/logging';
import { initLogger } from '@repo/logging';
import fastify from 'fastify';

const app = fastify();
const baseLogger = initLogger({ logLevel: 'info' });

// Register per-request logger
registerPerRequestLogger(app, baseLogger);

app.get('/users/:id', async (request) => {
  // Use the request logger
  request.log.info({ userId: request.params.id }, 'Fetching user');
  
  return { id: request.params.id, name: 'John' };
});
```

### Accessing Logger from Anywhere

The key feature is accessing the logger from anywhere in your code, not just route handlers:

```typescript
import { getPerRequestLogger } from '@repo/fastify-observability/logging';

// In a service file, utility function, or anywhere else
export async function fetchUserData(userId: string) {
  const logger = getPerRequestLogger();
  
  logger.info({ userId }, 'Fetching user data from database');
  
  // Your logic here
  const user = await db.users.findById(userId);
  
  logger.debug({ userId, found: !!user }, 'User fetch completed');
  
  return user;
}
```

### Example: Service Layer Logging

```typescript
import { getPerRequestLogger } from '@repo/fastify-observability/logging';

export class UserService {
  async getUserById(id: string) {
    const logger = getPerRequestLogger();
    
    logger.info({ userId: id }, 'Fetching user');
    
    try {
      const user = await db.users.findById(id);
      
      if (!user) {
        logger.warn({ userId: id }, 'User not found');
        throw new Error('User not found');
      }
      
      logger.debug({ userId: id, found: true }, 'User retrieved successfully');
      return user;
    } catch (error) {
      logger.error({ err: error, userId: id }, 'Failed to fetch user');
      throw error;
    }
  }
}
```

### Example: Middleware Logging

```typescript
import { getPerRequestLogger } from '@repo/fastify-observability/logging';

app.addHook('onRequest', async (request, reply) => {
  const logger = getPerRequestLogger();
  logger.info({ 
    method: request.method, 
    url: request.url,
    ip: request.ip 
  }, 'Incoming request');
});

app.addHook('onResponse', async (request, reply) => {
  const logger = getPerRequestLogger();
  logger.info({ 
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    responseTime: reply.getResponseTime()
  }, 'Request completed');
});
```

## API

### `registerPerRequestLogger(app, logger)`

Registers the per-request logger plugin on a Fastify instance.

**Parameters:**
- `app: FastifyInstanceForRegistration` - Fastify instance
- `logger: Logger` - Base Pino logger instance

### `getPerRequestLogger()`

Retrieves the current request's logger instance. Returns the base logger if called outside of a request context.

**Returns:** `FastifyBaseLogger` - The request-scoped logger

## How It Works

1. On each request, a child logger is created from the base logger
2. The child logger is stored in the request context using `@fastify/request-context`
3. `getPerRequestLogger()` retrieves the logger from the request context
4. If called outside a request context, it falls back to the base logger

## Benefits

- **Consistent Logging** - Same logger instance throughout the request
- **Request Correlation** - All logs from a single request share context
- **Flexible Access** - No need to pass logger instances around
- **Type Safety** - Full TypeScript support with proper types

## Testing

```bash
pnpm typecheck
```

## License

ISC
