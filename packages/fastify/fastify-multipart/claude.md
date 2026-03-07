# @repo/fastify-multipart

File upload support for Fastify via multipart form handling.

## Exports

```typescript
import { registerMultipart } from '@repo/fastify-multipart';
import type { MultipartConfig } from '@repo/fastify-multipart';
```

## Usage

```typescript
import { registerMultipart } from '@repo/fastify-multipart';

const app = await registerMultipart(fastifyInstance, {
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB (default)
  }
});
```

## Handling Uploads

After registration, use `request.file()` or `request.files()`:

```typescript
app.post('/upload', async (request, reply) => {
  const file = await request.file();

  if (!file) {
    return reply.code(400).send({ error: 'No file provided' });
  }

  const buffer = await file.toBuffer();
  // Process file...

  return {
    filename: file.filename,
    mimetype: file.mimetype,
    size: buffer.length
  };
});
```

## Multiple Files

```typescript
app.post('/upload-many', async (request) => {
  const files = request.files();
  const results = [];

  for await (const file of files) {
    const buffer = await file.toBuffer();
    results.push({ name: file.filename, size: buffer.length });
  }

  return results;
});
```

## Configuration

```typescript
interface MultipartConfig {
  limits?: {
    fileSize?: number; // Max file size in bytes
    files?: number; // Max number of files
    fields?: number; // Max number of non-file fields
  };
}
```

## With Form Fields

Access form fields alongside files:

```typescript
const data = await request.file();
const fields = data.fields; // Non-file form fields
```

## Streaming

For large files, stream instead of buffering:

```typescript
const file = await request.file();
const stream = file.file; // Node.js Readable stream
stream.pipe(destinationStream);
```
