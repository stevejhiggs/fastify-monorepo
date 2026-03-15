import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ConfigError, createConfig } from './create-config.ts';

describe('createConfig', () => {
  it('returns a typed object from valid input', () => {
    const schema = z.object({
      host: z.string(),
      port: z.number()
    });

    const config = createConfig(schema, { host: 'localhost', port: 3000 });

    expect(config.host).toBe('localhost');
    expect(config.port).toBe(3000);
  });

  it('applies default values from the schema', () => {
    const schema = z.object({
      host: z.string(),
      port: z.number().default(5432)
    });

    const config = createConfig(schema, { host: 'localhost' });

    expect(config.port).toBe(5432);
  });

  it('throws ConfigError when a required field is missing', () => {
    const schema = z.object({
      host: z.string(),
      port: z.number()
    });

    expect(() => createConfig(schema, { host: 'localhost' })).toThrow(ConfigError);
  });

  it('throws ConfigError when a field has the wrong type', () => {
    const schema = z.object({
      port: z.number()
    });

    expect(() => createConfig(schema, { port: 'not-a-number' })).toThrow(ConfigError);
  });

  it('sets the ZodError as the cause on ConfigError', () => {
    const schema = z.object({
      host: z.string()
    });

    let caught: unknown;
    try {
      createConfig(schema, {});
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ConfigError);
    if (caught instanceof ConfigError) {
      expect(caught.cause).toBeInstanceOf(z.ZodError);
    }
  });

  it('returns a frozen object', () => {
    const schema = z.object({
      host: z.string()
    });

    const config = createConfig(schema, { host: 'localhost' });

    expect(Object.isFrozen(config)).toBe(true);
  });
});
