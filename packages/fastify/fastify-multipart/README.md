# @repo/fastify-multipart

File upload support for Fastify via `@fastify/multipart`. Registers multipart form handling with `attachFieldsToBody: true` so form fields are accessible alongside files.

## Installation

This package is part of the monorepo. Add it as a workspace dependency:

```json
{
  "dependencies": {
    "@repo/fastify-multipart": "workspace:*"
  }
}
```

## Usage

### Setup

```typescript
import { registerMultipart } from '@repo/fastify-multipart';

registerMultipart(app, {
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
```

> When using `@repo/fastify-base`, multipart is registered automatically with a 100MB limit. You can enforce tighter limits per-route via validation.

### Single file upload

```typescript
app.post('/upload', async (request, reply) => {
  const file = await request.file();

  if (!file) {
    return reply.code(400).send({ error: 'No file provided' });
  }

  const buffer = await file.toBuffer();

  return {
    filename: file.filename,
    mimetype: file.mimetype,
    size: buffer.length
  };
});
```

### Multiple file uploads

```typescript
app.post('/upload-many', async (request) => {
  const results = [];

  for await (const file of request.files()) {
    const buffer = await file.toBuffer();
    results.push({ name: file.filename, size: buffer.length });
  }

  return results;
});
```

### Streaming large files

```typescript
const file = await request.file();
const stream = file.file; // Node.js Readable
stream.pipe(destinationStream);
```

### Form fields alongside files

```typescript
const data = await request.file();
const fields = data.fields; // Non-file form fields
```

## API

### `registerMultipart(app, options?)`

Registers `@fastify/multipart` on the Fastify instance.

| Parameter | Type               | Description                                             |
| --------- | ------------------ | ------------------------------------------------------- |
| `app`     | `FastifyInstance`  | The Fastify instance to register multipart on           |
| `options` | `MultipartOptions` | Optional limits and settings (see `@fastify/multipart`) |

`MultipartOptions` is `@fastify/multipart`'s options type minus `attachFieldsToBody` (always set to `true`).

### Exported types

```typescript
import type { MultipartFile, MultipartValue, MultipartOptions } from '@repo/fastify-multipart';
```
