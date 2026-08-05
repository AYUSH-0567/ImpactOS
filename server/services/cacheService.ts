export class CacheService {
  private static store: Map<string, { value: any; expiresAt: number }> = new Map();

  /**
   * Retrieves value from in-memory cache if not expired.
   */
  public static get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Stores value in cache with specified TTL in seconds (default: 60s).
   */
  public static set(key: string, value: any, ttlSeconds: number = 60): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Invalidates all cache keys matching an organization ID prefix.
   */
  public static invalidateOrgCache(organizationId: string): void {
    for (const key of this.store.keys()) {
      if (key.includes(organizationId)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clears entire cache.
   */
  public static clear(): void {
    this.store.clear();
  }
}
