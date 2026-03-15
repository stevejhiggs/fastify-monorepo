import { type z, ZodError } from 'zod';

export class ConfigError extends Error {
  constructor(message: string, cause: ZodError) {
    super(message, { cause });
    this.name = 'ConfigError';
  }
}

export function createConfig<T extends z.ZodType>(schema: T, values: unknown): Readonly<z.output<T>> {
  try {
    const parsed = schema.parse(values);
    return Object.freeze(parsed);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ConfigError(`Invalid configuration: ${error.message}`, error);
    }
    throw error;
  }
}
