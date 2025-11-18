// Cost Calculator Adapter Interface
// Provider-specific cost calculation

export interface CostCalculationInput {
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  metadata?: Record<string, any>;
}

export interface CostResult {
  totalCost: number; // USD
  promptCost: number;
  completionCost: number;
  currency: string;
  breakdown?: Record<string, any>;
}

export abstract class ICostCalculator {
  abstract provider: string;

  /**
   * Calculate cost for a request
   */
  abstract calculate(input: CostCalculationInput): CostResult;

  /**
   * Get pricing for a specific model
   */
  abstract getPricing(model: string): {
    promptCostPer1kTokens: number;
    completionCostPer1kTokens: number;
  } | null;
}

// OpenAI cost calculator
export class OpenAICostCalculator extends ICostCalculator {
  provider = 'openai';

  private pricing: Record<string, { prompt: number; completion: number }> = {
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-4-32k': { prompt: 0.06, completion: 0.12 },
    'gpt-4-turbo-preview': { prompt: 0.01, completion: 0.03 },
    'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
    'gpt-3.5-turbo-16k': { prompt: 0.003, completion: 0.004 },
  };

  calculate(input: CostCalculationInput): CostResult {
    const pricing = this.pricing[input.model];

    if (!pricing) {
      return {
        totalCost: 0,
        promptCost: 0,
        completionCost: 0,
        currency: 'USD',
        breakdown: { error: `Unknown model: ${input.model}` },
      };
    }

    const promptCost = (input.promptTokens / 1000) * pricing.prompt;
    const completionCost = (input.completionTokens / 1000) * pricing.completion;

    return {
      totalCost: promptCost + completionCost,
      promptCost,
      completionCost,
      currency: 'USD',
    };
  }

  getPricing(model: string) {
    const pricing = this.pricing[model];
    if (!pricing) return null;

    return {
      promptCostPer1kTokens: pricing.prompt,
      completionCostPer1kTokens: pricing.completion,
    };
  }
}

// Anthropic cost calculator
export class AnthropicCostCalculator extends ICostCalculator {
  provider = 'anthropic';

  private pricing: Record<string, { prompt: number; completion: number }> = {
    'claude-3-opus-20240229': { prompt: 0.015, completion: 0.075 },
    'claude-3-sonnet-20240229': { prompt: 0.003, completion: 0.015 },
    'claude-3-haiku-20240307': { prompt: 0.00025, completion: 0.00125 },
  };

  calculate(input: CostCalculationInput): CostResult {
    const pricing = this.pricing[input.model];

    if (!pricing) {
      return {
        totalCost: 0,
        promptCost: 0,
        completionCost: 0,
        currency: 'USD',
        breakdown: { error: `Unknown model: ${input.model}` },
      };
    }

    const promptCost = (input.promptTokens / 1000) * pricing.prompt;
    const completionCost = (input.completionTokens / 1000) * pricing.completion;

    return {
      totalCost: promptCost + completionCost,
      promptCost,
      completionCost,
      currency: 'USD',
    };
  }

  getPricing(model: string) {
    const pricing = this.pricing[model];
    if (!pricing) return null;

    return {
      promptCostPer1kTokens: pricing.prompt,
      completionCostPer1kTokens: pricing.completion,
    };
  }
}

// Registry
class CostCalculatorRegistry {
  private calculators: Map<string, ICostCalculator> = new Map();

  constructor() {
    this.register(new OpenAICostCalculator());
    this.register(new AnthropicCostCalculator());
  }

  register(calculator: ICostCalculator): void {
    this.calculators.set(calculator.provider, calculator);
  }

  get(provider: string): ICostCalculator | undefined {
    return this.calculators.get(provider);
  }

  calculate(input: CostCalculationInput): CostResult {
    const calculator = this.get(input.provider);
    if (!calculator) {
      return {
        totalCost: 0,
        promptCost: 0,
        completionCost: 0,
        currency: 'USD',
        breakdown: { error: `No calculator for provider: ${input.provider}` },
      };
    }

    return calculator.calculate(input);
  }
}

export const costCalculatorRegistry = new CostCalculatorRegistry();
