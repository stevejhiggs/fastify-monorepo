import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Cache, type CacheOptions, createInMemoryCache } from './index';

describe('caching', () => {
  describe('createInMemoryCache', () => {
    let cache: Cache;
    let onError: CacheOptions['onError'];

    beforeEach(async () => {
      onError = vi.fn();
      cache = createInMemoryCache({
        ttl: 1000,
        maxSize: 100,
        onError
      });
      // Clear cache between tests
      await cache.clear();
    });

    describe('getItem', () => {
      it('should return undefined when key does not exist', async () => {
        const result = await cache.getItem('nonexistent');

        expect(result).toBeUndefined();
      });

      it('should correctly cache dates', async () => {
        const testDate = new Date('2024-01-15T10:30:00Z');

        // First set the date
        await cache.setItem('date-key', testDate);

        // Then retrieve it
        const result = await cache.getItem<Date>('date-key');
        // Verify it's deserialized back to a Date object
        expect(result).toBeInstanceOf(Date);
        expect(result?.getTime()).toBe(testDate.getTime());
      });
    });

    describe('setItem', () => {
      it('should serialize and store value', async () => {
        const testValue = { name: 'test', count: 42 };

        await cache.setItem('test-key', testValue);

        const result = await cache.getItem<typeof testValue>('test-key');
        expect(result).toEqual(testValue);
      });

      it('should not store when value is undefined', async () => {
        await cache.setItem('test-key', undefined);

        const result = await cache.getItem('test-key');
        expect(result).toBeUndefined();
      });

      it('should handle primitive values', async () => {
        await cache.setItem('number-key', 123);

        const result = await cache.getItem<number>('number-key');
        expect(result).toBe(123);
      });
    });

    describe('deleteItem', () => {
      it('should delete item from cache', async () => {
        await cache.setItem('test-key', 'test-value');
        await cache.deleteItem('test-key');

        const result = await cache.getItem('test-key');
        expect(result).toBeUndefined();
      });
    });

    describe('clear', () => {
      it('should clear all items from cache', async () => {
        await cache.setItem('key1', 'value1');
        await cache.setItem('key2', 'value2');
        await cache.clear();

        expect(await cache.getItem('key1')).toBeUndefined();
        expect(await cache.getItem('key2')).toBeUndefined();
      });
    });
  });
});
