import { generateObject } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Rate limiting constants
const BASE_DELAY = 2000; // 2 seconds between requests
const MAX_CONCURRENT = 2; // Maximum concurrent requests
const BACKOFF_MULTIPLIER = 3; // More aggressive backoff

// Queue for managing concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = 0;
  private lastRequestTime = 0;

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Ensure minimum time between requests
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < BASE_DELAY) {
            await new Promise(resolve => 
              setTimeout(resolve, BASE_DELAY - timeSinceLastRequest)
            );
          }

          const result = await fn();
          this.lastRequestTime = Date.now();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing >= MAX_CONCURRENT) return;

    while (this.queue.length > 0 && this.processing < MAX_CONCURRENT) {
      const request = this.queue.shift();
      if (request) {
        this.processing++;
        try {
          await request();
        } finally {
          this.processing--;
          // Add additional delay after each request
          await new Promise(resolve => setTimeout(resolve, BASE_DELAY));
        }
      }
    }
  }
}

const requestQueue = new RequestQueue();

// Debounce function to prevent rapid successive calls
function debounce<T>(fn: () => Promise<T>, delay: number): () => Promise<T> {
  let timeoutId: NodeJS.Timeout;
  let lastCall = 0;

  return () => new Promise((resolve, reject) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    clearTimeout(timeoutId);

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      fn().then(resolve).catch(reject);
    } else {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn().then(resolve).catch(reject);
      }, delay - timeSinceLastCall);
    }
  });
}

export async function generateAIResponse<T>({
  prompt,
  schema,
  cacheKey,
  systemPrompt,
}: {
  prompt: string;
  schema: any;
  cacheKey: string;
  systemPrompt: string;
}): Promise<T> {
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Implement exponential backoff with more aggressive delays
  const maxRetries = 5; // Increased max retries
  let retryCount = 0;
  let lastError: any;

  const makeRequest = async () => {
    const data = await generateObject<{ object: T }>({
      model: bedrock("anthropic.claude-3-5-sonnet-20240620-v1:0"),
      prompt,
      schema,
      system: systemPrompt,
      temperature: 0.7,
      maxTokens: 3000,
    });
    return data.object as T;
  };

  // Debounce the request with a 2-second delay
  const debouncedRequest = debounce(makeRequest, 2000);

  while (retryCount < maxRetries) {
    try {
      const result = await requestQueue.add(async () => {
        return await debouncedRequest();
      });

      // Cache successful response
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error: any) {
      lastError = error;
      if (error?.$metadata?.httpStatusCode === 429) {
        // More aggressive exponential backoff
        const delay = Math.pow(BACKOFF_MULTIPLIER, retryCount) * BASE_DELAY;
        console.log(`Rate limited. Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retryCount++;
      } else {
        throw error;
      }
    }
  }

  throw lastError;
} 