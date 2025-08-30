/**
 * Rate Limiter and Circuit Breaker for External API Calls
 * Addresses "Overloaded" errors encountered with OpenAI API
 */

export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxConcurrentRequests: number;
  timeoutMs: number;
  retryAttempts: number;
  backoffMultiplier: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeoutMs: number;
}

interface RequestWindow {
  requests: number[];
  concurrentCount: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

export class ApiRateLimiter {
  private config: RateLimitConfig;
  private openaiWindow: RequestWindow = { requests: [], concurrentCount: 0 };
  private chromaWindow: RequestWindow = { requests: [], concurrentCount: 0 };
  private openaiCircuitBreaker: CircuitBreakerState = { failures: 0, lastFailure: 0, state: 'closed' };
  private chromaCircuitBreaker: CircuitBreakerState = { failures: 0, lastFailure: 0, state: 'closed' };

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequestsPerMinute: 40, // OpenAI rate limit is ~40 req/min for text-embedding
      maxConcurrentRequests: 5,
      timeoutMs: 30000, // 30 second timeout
      retryAttempts: 3,
      backoffMultiplier: 2,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeoutMs: 60000, // 1 minute circuit breaker timeout
      ...config
    };
  }

  /**
   * Execute OpenAI API call with rate limiting and circuit breaker
   */
  async executeOpenAI<T>(apiCall: () => Promise<T>, operation: string = 'openai'): Promise<T> {
    return this.executeWithLimiter(apiCall, this.openaiWindow, this.openaiCircuitBreaker, operation);
  }

  /**
   * Execute Chroma API call with rate limiting and circuit breaker
   */
  async executeChroma<T>(apiCall: () => Promise<T>, operation: string = 'chroma'): Promise<T> {
    return this.executeWithLimiter(apiCall, this.chromaWindow, this.chromaCircuitBreaker, operation);
  }

  private async executeWithLimiter<T>(
    apiCall: () => Promise<T>,
    window: RequestWindow,
    circuitBreaker: CircuitBreakerState,
    operation: string
  ): Promise<T> {
    // Check circuit breaker state
    if (circuitBreaker.state === 'open') {
      const timeSinceFailure = Date.now() - circuitBreaker.lastFailure;
      if (timeSinceFailure < this.config.circuitBreakerTimeoutMs) {
        throw new Error(`Circuit breaker is open for ${operation}. Try again in ${Math.ceil((this.config.circuitBreakerTimeoutMs - timeSinceFailure) / 1000)} seconds.`);
      } else {
        circuitBreaker.state = 'half-open';
        console.log(`Circuit breaker entering half-open state for ${operation}`);
      }
    }

    // Wait for rate limit availability
    await this.waitForRateLimit(window);
    
    // Wait for concurrent request availability
    await this.waitForConcurrentSlot(window);

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        window.concurrentCount++;
        
        // Execute with timeout
        const result = await Promise.race([
          apiCall(),
          this.createTimeoutPromise<T>(this.config.timeoutMs)
        ]);

        // Success - record request and reset circuit breaker
        this.recordRequest(window);
        this.resetCircuitBreaker(circuitBreaker);
        
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if this is a rate limit or overload error
        if (this.isRateLimitError(lastError) || this.isOverloadError(lastError)) {
          console.log(`Rate limit/overload detected on ${operation}, attempt ${attempt + 1}/${this.config.retryAttempts}`);
          
          if (attempt < this.config.retryAttempts - 1) {
            const backoffMs = 1000 * Math.pow(this.config.backoffMultiplier, attempt);
            console.log(`Backing off for ${backoffMs}ms`);
            await this.sleep(backoffMs);
            continue;
          }
        }
        
        // Record failure for circuit breaker
        this.recordFailure(circuitBreaker);
        break;
        
      } finally {
        window.concurrentCount--;
      }
    }

    throw lastError || new Error(`Failed after ${this.config.retryAttempts} attempts`);
  }

  private async waitForRateLimit(window: RequestWindow): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old requests
    window.requests = window.requests.filter(time => time > oneMinuteAgo);
    
    // Check if we're at rate limit
    if (window.requests.length >= this.config.maxRequestsPerMinute) {
      const oldestRequest = Math.min(...window.requests);
      const waitTime = 60000 - (now - oldestRequest) + 1000; // Add 1s buffer
      
      if (waitTime > 0) {
        console.log(`Rate limit reached. Waiting ${waitTime}ms`);
        await this.sleep(waitTime);
      }
    }
  }

  private async waitForConcurrentSlot(window: RequestWindow): Promise<void> {
    while (window.concurrentCount >= this.config.maxConcurrentRequests) {
      console.log(`Max concurrent requests reached (${this.config.maxConcurrentRequests}). Waiting...`);
      await this.sleep(100);
    }
  }

  private recordRequest(window: RequestWindow): void {
    window.requests.push(Date.now());
  }

  private recordFailure(circuitBreaker: CircuitBreakerState): void {
    circuitBreaker.failures++;
    circuitBreaker.lastFailure = Date.now();
    
    if (circuitBreaker.failures >= this.config.circuitBreakerThreshold) {
      circuitBreaker.state = 'open';
      console.log(`Circuit breaker opened after ${circuitBreaker.failures} failures`);
    }
  }

  private resetCircuitBreaker(circuitBreaker: CircuitBreakerState): void {
    if (circuitBreaker.state === 'half-open') {
      circuitBreaker.state = 'closed';
      console.log('Circuit breaker reset to closed state');
    }
    circuitBreaker.failures = 0;
  }

  private isRateLimitError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('rate limit') || 
           message.includes('too many requests') ||
           message.includes('429');
  }

  private isOverloadError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('overloaded') ||
           message.includes('service unavailable') ||
           message.includes('503') ||
           message.includes('502') ||
           message.includes('504');
  }

  private createTimeoutPromise<T>(timeoutMs: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current status for debugging
   */
  getStatus() {
    return {
      openai: {
        recentRequests: this.openaiWindow.requests.length,
        concurrentRequests: this.openaiWindow.concurrentCount,
        circuitBreakerState: this.openaiCircuitBreaker.state,
        failures: this.openaiCircuitBreaker.failures
      },
      chroma: {
        recentRequests: this.chromaWindow.requests.length,
        concurrentRequests: this.chromaWindow.concurrentCount,
        circuitBreakerState: this.chromaCircuitBreaker.state,
        failures: this.chromaCircuitBreaker.failures
      }
    };
  }

  /**
   * Reset circuit breakers manually
   */
  resetCircuitBreakers(): void {
    this.openaiCircuitBreaker = { failures: 0, lastFailure: 0, state: 'closed' };
    this.chromaCircuitBreaker = { failures: 0, lastFailure: 0, state: 'closed' };
    console.log('Circuit breakers manually reset');
  }
}