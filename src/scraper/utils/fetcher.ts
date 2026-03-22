import axios, { type AxiosInstance } from 'axios';
import { logger } from '../../lib/logger.js';

/**
 * Rate-limited HTTP fetcher with retry logic.
 */
export class Fetcher {
  private client: AxiosInstance;
  private requestCount = 0;
  private windowStart = Date.now();
  private readonly requestsPerMinute: number;

  constructor(baseUrl?: string, requestsPerMinute = 30) {
    this.requestsPerMinute = requestsPerMinute;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 30_000,
      headers: {
        'User-Agent': 'claude-skills-directory/1.0 (+https://github.com/example)',
        Accept: 'application/json, text/html',
      },
    });
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const windowMs = 60_000;
    if (now - this.windowStart >= windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }
    if (this.requestCount >= this.requestsPerMinute) {
      const waitMs = windowMs - (now - this.windowStart);
      logger.debug(`Rate limit reached, waiting ${waitMs}ms`);
      await new Promise((r) => setTimeout(r, waitMs));
      this.requestCount = 0;
      this.windowStart = Date.now();
    }
    this.requestCount++;
  }

  async get<T = unknown>(url: string, options?: Record<string, unknown>): Promise<T> {
    await this.rateLimit();
    const { data } = await this.client.get<T>(url, options);
    return data;
  }

  async post<T = unknown>(url: string, body?: unknown, options?: Record<string, unknown>): Promise<T> {
    await this.rateLimit();
    const { data } = await this.client.post<T>(url, body, options);
    return data;
  }
}

/**
 * Simple retry wrapper with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn(`Retry ${attempt + 1}/${retries} after ${delay}ms`, { error: String(err) });
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Unreachable');
}
