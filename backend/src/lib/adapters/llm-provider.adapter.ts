// LLM Provider Adapter Interface
// Allows pluggable LLM providers

export interface LLMRequest {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
  metadata?: Record<string, any>;
}

export interface LLMResponse {
  content: string;
  tokensUsed?: {
    total: number;
    prompt: number;
    completion: number;
  };
  durationMs: number;
  model: string;
  finishReason?: string;
  metadata?: Record<string, any>;
}

export interface LLMProviderConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
  };
}

export abstract class ILLMProvider {
  protected config: LLMProviderConfig;
  abstract name: string;

  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  /**
   * Execute an LLM request
   */
  abstract execute(request: LLMRequest): Promise<LLMResponse>;

  /**
   * Validate model name
   */
  abstract isValidModel(model: string): boolean;

  /**
   * Get list of supported models
   */
  abstract getSupportedModels(): string[];

  /**
   * Calculate estimated cost for a request
   */
  abstract estimateCost(tokensUsed: LLMResponse['tokensUsed'], model: string): number;

  /**
   * Health check
   */
  abstract healthCheck(): Promise<boolean>;
}

// Registry for LLM providers
class LLMProviderRegistry {
  private providers: Map<string, ILLMProvider> = new Map();

  register(name: string, provider: ILLMProvider): void {
    this.providers.set(name, provider);
  }

  get(name: string): ILLMProvider | undefined {
    return this.providers.get(name);
  }

  getAll(): Map<string, ILLMProvider> {
    return new Map(this.providers);
  }

  has(name: string): boolean {
    return this.providers.has(name);
  }

  unregister(name: string): boolean {
    return this.providers.delete(name);
  }
}

export const llmProviderRegistry = new LLMProviderRegistry();
