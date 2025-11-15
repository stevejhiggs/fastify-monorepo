# @repo/logging

Core logging utilities built on Pino with optional Google Cloud Platform (GCP) formatting support.

## Features

- **Pino-based** - Fast, low-overhead structured logging
- **GCP Support** - Optional GCP-compatible log formatting
- **Configurable Log Levels** - Control verbosity with standard log levels
- **Type-Safe** - Full TypeScript support

## Installation

```bash
pnpm add @repo/logging
```

## Usage

### Basic Usage

```typescript
import { initLogger } from '@repo/logging';

const logger = initLogger({
  logLevel: 'info' // 'debug' | 'info' | 'warn' | 'error' | 'silent'
});

logger.info('Application started');
logger.error({ err: error }, 'Something went wrong');
logger.debug({ userId: 123 }, 'User action');
```

### GCP Formatting

For applications deployed on Google Cloud Platform, use GCP-compatible formatting:

```typescript
import { initLogger } from '@repo/logging';

const logger = initLogger({
  outputFormat: 'GCP',
  logLevel: 'info'
});

// Logs will be formatted for GCP Cloud Logging
logger.info({ message: 'Request processed', statusCode: 200 });
```

### Default Formatting

For local development or other platforms:

```typescript
import { initLogger } from '@repo/logging';

const logger = initLogger({
  outputFormat: 'DEFAULT', // or omit for default
  logLevel: 'info'
});
```

## API

### `initLogger(config?)`

Initializes and returns a Pino logger instance.

**Config Options:**
- `outputFormat?: 'DEFAULT' | 'GCP'` - Output format (defaults to 'DEFAULT')
- `logLevel?: LevelWithSilentOrString` - Log level (defaults to 'info')

**Returns:** A Pino `Logger` instance

### Logger Methods

The returned logger supports all standard Pino methods:

- `logger.debug(obj?, msg?)` - Debug level logging
- `logger.info(obj?, msg?)` - Info level logging
- `logger.warn(obj?, msg?)` - Warning level logging
- `logger.error(obj?, msg?)` - Error level logging
- `logger.fatal(obj?, msg?)` - Fatal level logging
- `logger.trace(obj?, msg?)` - Trace level logging

## Example: Structured Logging

```typescript
import { initLogger } from '@repo/logging';

const logger = initLogger({ logLevel: 'info' });

// Simple message
logger.info('Server started on port 3000');

// Structured logging with context
logger.info(
  { 
    userId: 123, 
    action: 'login', 
    ip: '192.168.1.1' 
  },
  'User logged in'
);

// Error logging
logger.error(
  { 
    err: error, 
    userId: 123,
    endpoint: '/api/users' 
  },
  'Failed to fetch user'
);
```

## Example: Environment-Based Configuration

```typescript
import { initLogger } from '@repo/logging';

const logger = initLogger({
  outputFormat: process.env.NODE_ENV === 'production' ? 'GCP' : 'DEFAULT',
  logLevel: process.env.LOG_LEVEL || 'info'
});
```

## Integration with Fastify

This logger is designed to work seamlessly with Fastify. See `@repo/fastify-base` for a complete setup example.

## Testing

```bash
pnpm typecheck
```

## License

ISC
