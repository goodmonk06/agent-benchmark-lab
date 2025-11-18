// Scoring Strategy Adapter Interface
// Allows pluggable scoring methods

export interface ScoringContext {
  taskId: string;
  agentId: string;
  input: any;
  output: any;
  expected?: any;
  config?: any;
  metadata?: Record<string, any>;
}

export interface ScoringResult {
  score: number; // 0-100
  passed: boolean;
  details: Record<string, any>;
  reasoning?: string;
  confidence?: number;
}

export abstract class IScoringStrategy {
  abstract name: string;
  abstract description: string;

  /**
   * Score an output
   */
  abstract score(context: ScoringContext): Promise<ScoringResult>;

  /**
   * Validate configuration
   */
  abstract validateConfig(config: any): boolean;

  /**
   * Get default configuration
   */
  abstract getDefaultConfig(): any;
}

// Built-in strategies

export class ExactMatchStrategy extends IScoringStrategy {
  name = 'exact_match';
  description = 'Scores based on exact string matching';

  async score(context: ScoringContext): Promise<ScoringResult> {
    const { output, expected } = context;

    if (!expected) {
      return {
        score: 0,
        passed: false,
        details: { error: 'No expected output provided' },
      };
    }

    const outputStr = this.normalize(output);
    const expectedStr = this.normalize(expected);
    const matches = outputStr === expectedStr;

    return {
      score: matches ? 100 : 0,
      passed: matches,
      details: {
        outputLength: outputStr.length,
        expectedLength: expectedStr.length,
        exactMatch: matches,
      },
    };
  }

  validateConfig(config: any): boolean {
    return true; // No config needed
  }

  getDefaultConfig(): any {
    return {};
  }

  private normalize(value: any): string {
    if (typeof value === 'string') {
      return value.trim();
    }
    return JSON.stringify(value);
  }
}

export class SimilarityStrategy extends IScoringStrategy {
  name = 'similarity';
  description = 'Scores based on Jaccard similarity';

  async score(context: ScoringContext): Promise<ScoringResult> {
    const { output, expected } = context;

    if (!expected) {
      return {
        score: 0,
        passed: false,
        details: { error: 'No expected output provided' },
      };
    }

    const similarity = this.calculateSimilarity(output, expected);
    const score = Math.round(similarity * 100);

    return {
      score,
      passed: score >= 70, // Default threshold
      details: {
        similarity,
        threshold: 0.7,
      },
      confidence: similarity,
    };
  }

  validateConfig(config: any): boolean {
    if (config.threshold !== undefined) {
      return config.threshold >= 0 && config.threshold <= 1;
    }
    return true;
  }

  getDefaultConfig(): any {
    return { threshold: 0.7 };
  }

  private calculateSimilarity(output: any, expected: any): number {
    const outputStr = this.normalize(output);
    const expectedStr = this.normalize(expected);

    const outputWords = new Set(outputStr.toLowerCase().split(/\s+/));
    const expectedWords = new Set(expectedStr.toLowerCase().split(/\s+/));

    const intersection = new Set([...outputWords].filter((w) => expectedWords.has(w)));
    const union = new Set([...outputWords, ...expectedWords]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private normalize(value: any): string {
    if (typeof value === 'string') {
      return value.trim();
    }
    return JSON.stringify(value);
  }
}

export class RegexMatchStrategy extends IScoringStrategy {
  name = 'regex_match';
  description = 'Scores based on regex pattern matching';

  async score(context: ScoringContext): Promise<ScoringResult> {
    const { output, config } = context;

    if (!config || !config.pattern) {
      return {
        score: 0,
        passed: false,
        details: { error: 'No regex pattern provided in config' },
      };
    }

    const outputStr = typeof output === 'string' ? output : JSON.stringify(output);
    const regex = new RegExp(config.pattern, config.flags || '');
    const matches = regex.test(outputStr);

    return {
      score: matches ? 100 : 0,
      passed: matches,
      details: {
        pattern: config.pattern,
        matches,
      },
    };
  }

  validateConfig(config: any): boolean {
    return config && typeof config.pattern === 'string';
  }

  getDefaultConfig(): any {
    return { pattern: '.*', flags: '' };
  }
}

// Registry for scoring strategies
class ScoringStrategyRegistry {
  private strategies: Map<string, IScoringStrategy> = new Map();

  constructor() {
    // Register built-in strategies
    this.register(new ExactMatchStrategy());
    this.register(new SimilarityStrategy());
    this.register(new RegexMatchStrategy());
  }

  register(strategy: IScoringStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  get(name: string): IScoringStrategy | undefined {
    return this.strategies.get(name);
  }

  getAll(): IScoringStrategy[] {
    return Array.from(this.strategies.values());
  }

  has(name: string): boolean {
    return this.strategies.has(name);
  }

  unregister(name: string): boolean {
    return this.strategies.delete(name);
  }
}

export const scoringStrategyRegistry = new ScoringStrategyRegistry();
