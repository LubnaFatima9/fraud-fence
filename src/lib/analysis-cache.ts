// Simple in-memory cache for analysis results to improve consistency
// This helps ensure the same content gets the same result (within a reasonable time window)

export interface CacheEntry {
  result: any;
  timestamp: number;
  hash: string;
}

const analysisCache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a simple hash for content to use as cache key
 */
export function generateContentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get cached analysis result if available and not expired
 */
export function getCachedResult(contentHash: string): any | null {
  const entry = analysisCache.get(contentHash);
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    analysisCache.delete(contentHash);
    return null;
  }
  
  console.log('🎯 Using cached analysis result for hash:', contentHash);
  return entry.result;
}

/**
 * Cache analysis result
 */
export function setCachedResult(contentHash: string, result: any): void {
  analysisCache.set(contentHash, {
    result,
    timestamp: Date.now(),
    hash: contentHash
  });
  
  console.log('💾 Cached analysis result for hash:', contentHash);
}

/**
 * Clean up expired cache entries
 */
export function cleanupCache(): void {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of analysisCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      analysisCache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: analysisCache.size,
    entries: Array.from(analysisCache.entries()).map(([key, entry]) => ({
      key,
      timestamp: entry.timestamp,
      age: Date.now() - entry.timestamp
    }))
  };
}

// Only set up cleanup interval in Node.js environment (not Edge runtime)
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  // Clean up cache every 10 minutes
  setInterval(cleanupCache, 10 * 60 * 1000);
}
