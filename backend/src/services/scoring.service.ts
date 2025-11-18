import { ScoreResult } from '../types';
import { llmService } from './llm.service';

export class ScoringService {
  /**
   * Score a result based on expected output and scoring config
   */
  async score(
    output: any,
    expected?: any,
    scoringConfig?: any
  ): Promise<ScoreResult> {
    const result: ScoreResult = {};

    // Exact match scoring
    if (expected !== undefined && expected !== null) {
      result.exactMatch = this.exactMatch(output, expected);
      result.similarity = this.calculateSimilarity(output, expected);
    }

    // LLM-as-judge scoring (if configured)
    if (scoringConfig?.useLLMJudge && expected) {
      const judgeResult = await this.llmJudge(output, expected, scoringConfig);
      result.llmJudgeScore = judgeResult.score;
      result.llmJudgeReasoning = judgeResult.reasoning;
    }

    // Custom scoring logic can be added here
    if (scoringConfig?.customScoring) {
      result.customScores = this.customScore(output, expected, scoringConfig);
    }

    return result;
  }

  private exactMatch(output: any, expected: any): boolean {
    const outputStr = this.normalizeForComparison(output);
    const expectedStr = this.normalizeForComparison(expected);
    return outputStr === expectedStr;
  }

  private calculateSimilarity(output: any, expected: any): number {
    const outputStr = this.normalizeForComparison(output);
    const expectedStr = this.normalizeForComparison(expected);

    // Simple Jaccard similarity on words
    const outputWords = new Set(outputStr.toLowerCase().split(/\s+/));
    const expectedWords = new Set(expectedStr.toLowerCase().split(/\s+/));

    const intersection = new Set(
      [...outputWords].filter(word => expectedWords.has(word))
    );
    const union = new Set([...outputWords, ...expectedWords]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private async llmJudge(
    output: any,
    expected: any,
    scoringConfig: any
  ): Promise<{ score: number; reasoning: string }> {
    const systemPrompt = `You are an evaluator judging the quality of an AI agent's output.
Compare the actual output to the expected output and provide:
1. A score from 0 to 100 (where 100 is perfect)
2. A brief reasoning for your score

Output your response in JSON format: {"score": number, "reasoning": string}`;

    const userPrompt = `Expected Output:
${JSON.stringify(expected, null, 2)}

Actual Output:
${JSON.stringify(output, null, 2)}

Please evaluate the actual output.`;

    try {
      const response = await llmService.execute(
        'openai',
        'gpt-4',
        systemPrompt,
        userPrompt
      );

      const parsed = JSON.parse(response.content);
      return {
        score: parsed.score || 0,
        reasoning: parsed.reasoning || '',
      };
    } catch (error) {
      console.error('LLM judge error:', error);
      return {
        score: 0,
        reasoning: 'Error during LLM judging',
      };
    }
  }

  private customScore(
    output: any,
    expected: any,
    scoringConfig: any
  ): Record<string, any> {
    // Placeholder for custom scoring logic
    // Can be extended based on specific needs
    return {};
  }

  private normalizeForComparison(value: any): string {
    if (typeof value === 'string') {
      return value.trim();
    }
    return JSON.stringify(value);
  }
}

export const scoringService = new ScoringService();
