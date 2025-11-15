import { CacheableMemory } from 'cacheable';
import SuperJSON from 'superjson';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type Cache, type CacheOptions, createInMemoryCache } from './index';

// Mock dependencies
vi.mock('@keyv/redis', () => ({
  default: vi.fn(
    class KeyvRedis {
      on = vi.fn();
    }
  )
}));

vi.mock('cacheable', () => ({
  Cacheable: vi.fn(
    class Cacheable {
      get = vi.fn();
      set = vi.fn();
      delete = vi.fn();
      clear = vi.fn();
      on = vi.fn();
    }
  ),
  CacheableMemory: vi.fn(
    class CacheableMemory {
      get = vi.fn();
      set = vi.fn();
      delete = vi.fn();
      clear = vi.fn();
      on = vi.fn();
    }
  )
}));

describe('caching', () => {
  describe('createInMemoryCache', () => {
    let mockCacheableMemoryInstance: {
      get: ReturnType<typeof vi.fn>;
      set: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      clear: ReturnType<typeof vi.fn>;
      on: ReturnType<typeof vi.fn>;
    };
    let cache: Cache;
    let onError: CacheOptions['onError'];

    beforeEach(() => {
      onError = vi.fn();
      // We'll get the instance after it's created
      mockCacheableMemoryInstance = {} as typeof mockCacheableMemoryInstance;

      cache = createInMemoryCache({
        ttl: 1000,
        maxSize: 100,
        onError
      });

      // Get the instance that was created and replace its methods with our mocks
      const instance = vi.mocked(CacheableMemory).mock.results[0]?.value;
      if (instance) {
        Object.assign(instance, mockCacheableMemoryInstance);
        mockCacheableMemoryInstance = instance as typeof mockCacheableMemoryInstance;
      }
    });

    it('should register error handler', () => {
      expect(mockCacheableMemoryInstance.on).toHaveBeenCalledWith('error', onError);
    });

    describe('getItem', () => {
      it('should return undefined when key does not exist', async () => {
        mockCacheableMemoryInstance.get.mockReturnValue(undefined);

        const result = await cache.getItem('nonexistent');

        expect(result).toBeUndefined();
        expect(mockCacheableMemoryInstance.get).toHaveBeenCalledWith('nonexistent');
      });

      it('should correctly cache dates', async () => {
        const testDate = new Date('2024-01-15T10:30:00Z');
        // Use real SuperJSON to get expected serialized value

        const expectedSerialized = SuperJSON.stringify(testDate);

        // Mock get to return the serialized date
        mockCacheableMemoryInstance.get.mockReturnValue(expectedSerialized);

        // First set the date
        await cache.setItem('date-key', testDate);
        expect(mockCacheableMemoryInstance.set).toHaveBeenCalledWith('date-key', expectedSerialized);

        // Then retrieve it
        const result = await cache.getItem<Date>('date-key');
        // Verify it's deserialized back to a Date object
        expect(result).toBeInstanceOf(Date);
        expect(result?.getTime()).toBe(testDate.getTime());
        expect(mockCacheableMemoryInstance.get).toHaveBeenCalledWith('date-key');
      });
    });

    describe('setItem', () => {
      it('should serialize and store value', async () => {
        const testValue = { name: 'test', count: 42 };
        // Use real SuperJSON to get expected serialized value
        const expectedSerialized = SuperJSON.stringify(testValue);

        await cache.setItem('test-key', testValue);

        expect(mockCacheableMemoryInstance.set).toHaveBeenCalledWith('test-key', expectedSerialized);
      });

      it('should not store when value is undefined', async () => {
        await cache.setItem('test-key', undefined);

        expect(mockCacheableMemoryInstance.set).not.toHaveBeenCalled();
      });

      it('should handle primitive values', async () => {
        // Use real SuperJSON to get expected serialized value
        const expectedSerialized = SuperJSON.stringify(123);

        await cache.setItem('number-key', 123);

        expect(mockCacheableMemoryInstance.set).toHaveBeenCalledWith('number-key', expectedSerialized);
      });
    });

    describe('deleteItem', () => {
      it('should delete item from cache', async () => {
        mockCacheableMemoryInstance.delete.mockReturnValue(undefined);

        await cache.deleteItem('test-key');

        expect(mockCacheableMemoryInstance.delete).toHaveBeenCalledWith('test-key');
      });
    });

    describe('clear', () => {
      it('should clear all items from cache', async () => {
        mockCacheableMemoryInstance.clear.mockReturnValue(undefined);

        await cache.clear();

        expect(mockCacheableMemoryInstance.clear).toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('should call error handler when cache emits error', () => {
      const onError = vi.fn();

      createInMemoryCache({
        ttl: 1000,
        maxSize: 100,
        onError
      });

      // Get the instance that was created
      const instance = vi.mocked(CacheableMemory).mock.results[0]?.value;
      if (instance) {
        // Simulate error event
        const errorHandler = (instance as { on: ReturnType<typeof vi.fn> }).on.mock.calls.find((call) => call[0] === 'error')?.[1];
        const testError = new Error('Cache error');
        if (errorHandler) {
          errorHandler(testError);
        }

        expect(onError).toHaveBeenCalledWith(testError);
      }
    });
  });
});
