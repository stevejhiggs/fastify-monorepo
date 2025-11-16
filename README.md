# Fastify Monorepo

A Fastify monorepo template with all the essential features you need to build scalable, type-safe APIs. This monorepo provides a modular architecture with reusable packages, buildless TypeScript support, and comprehensive tooling.

## 🚀 Features

### Core Features

- **Buildless Package Support** - Use TypeScript packages directly without build steps during development
- **Modular Architecture** - Reusable packages that can be used independently or together
- **Type-Safe APIs** - Full TypeScript support with Zod schema validation
- **Automatic API Documentation** - Swagger/OpenAPI docs generated at `/documentation`
- **Production-Ready Logging** - Structured logging with optional GCP formatting
- **Flexible Caching** - In-memory caching with optional Redis secondary cache
- **Request-Scoped Logging** - Persistent logger available throughout the request lifecycle
- **Turborepo** - Fast, efficient monorepo builds and task orchestration

### Technical Stack

- **Fastify** - Fast and low overhead web framework
- **TypeScript** - Type-safe development
- **Zod** - Schema validation and type inference
- **pnpm** - Fast, disk space efficient package manager
- **Turborepo** - Monorepo build system
- **Vitest** - Fast unit testing framework
- **Biome** - Fast formatter and linter

## 📁 Project Structure

```
fastify-monorepo/
├── apps/
│   └── example-api/          # Example Fastify API application
├── packages/
│   ├── caching/              # Caching utilities with Redis support
│   ├── logging/              # Logging utilities
│   └── fastify/
│       ├── fastify-base/     # Base Fastify setup with all plugins
│       ├── fastify-common-types/  # Shared TypeScript types
│       ├── fastify-observability/ # Observability plugin
│       ├── fastify-security/ # Security headers plugin
│       ├── fastify-swagger/  # Swagger/OpenAPI plugin
│       └── fastify-zod/      # Zod schema validation plugin
└── tooling/
    ├── templates/            # Package templates for code generation
    ├── typescript-config/    # Shared TypeScript configuration
    └── vitest/               # Shared Vitest configuration
```

## 🏁 Getting Started

### Prerequisites

- **Node.js** (v24 or higher)
- **pnpm** (v10.22.0 or higher) - Install via `npm install -g pnpm@10.22.0`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fastify-monorepo

# Install dependencies
pnpm install

# Setup git hooks (optional)
pnpm setup-commit-hooks
```

### Running the Example API

```bash
# Start the development server
pnpm dev

# The API will be available at http://localhost:3000
# API documentation at http://localhost:3000/documentation
```

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | Type check all packages |
| `pnpm lint` | Lint all packages |
| `pnpm generate:package` | Generate a new package from template |

### Package Generation

Create a new package using the template:

```bash
pnpm generate:package
```

This will prompt you for a package name and create a new package in the `packages/` directory with:
- TypeScript configuration
- Basic package structure
- Linting setup
- Test configuration

### Environment Variables

For the example API:

- `LOG_LEVEL` - Logging level (`debug`, `info`, `warn`, `error`). Defaults to `info`
- `DISABLE_DOCS` - Set to `true` to disable the `/documentation` endpoint. Defaults to `false`
- `REDIS_URL` - Optional Redis connection URL for caching

## 📦 Available Packages

### `@repo/fastify-base`

The main package that sets up a production-ready Fastify instance with all plugins configured. Use this for a quick start, or use individual packages for more control.

**Features:**
- Zod schema validation
- Swagger documentation
- Security headers
- Request-scoped logging
- Caching support

**Usage:**

```typescript
import { setupBaseApp } from '@repo/fastify-base';

const { app } = await setupBaseApp({
  port: 3000,
  logger: { logLevel: 'info' },
  swagger: {
    enable: true,
    title: 'My API',
    version: '1.0.0'
  }
});
```

- `@repo/fastify-zod` Zod schema validation for Fastify requests and responses. Automatically integrates with Swagger documentation.
- `@repo/fastify-swagger` Automatic OpenAPI/Swagger documentation generation.
- `@repo/fastify-observability` Request-scoped logging that persists throughout the request lifecycle.
- `@repo/fastify-security` Security headers plugin (Helmet integration).
- `@repo/caching` Flexible caching solution with:
  - In-memory caching
  - Optional Redis secondary cache
  - SuperJSON serialization for proper date/object handling
- `@repo/logging` Core logging utilities with optional GCP formatting.

## 🧪 Testing

Tests are co-located with source files using Vitest:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

## 📝 Code Quality

This monorepo uses:

- **Biome** - Fast formatter and linter (replaces ESLint + Prettier)
- **TypeScript** - Strict type checking
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting

Code is automatically formatted and linted on commit.

## 🏗️ Architecture

### Buildless Development

Packages use TypeScript directly without a build step during development. This means:
- Faster iteration
- Better debugging experience
- Direct TypeScript imports

Production builds use `tsdown` for optimized output.

## 🗺️ Roadmap

### Planned Features

- [ ] OpenTelemetry support
- [ ] Docker buildfile
- [ ] Authentication/Authorization
- [ ] GitHub Actions CI/CD
- [ ] API generation from templates
- [ ] Rate limiting

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Note:** This is a template/starter monorepo. Feel free to customize it for your needs!
