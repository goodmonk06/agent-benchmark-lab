import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, LLMResponse } from '../types';

export class LLMService {
  private openai: OpenAI;
  private anthropic: Anthropic;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async execute(
    provider: LLMProvider,
    model: string,
    systemPrompt: string,
    userInput: string,
    tools?: string[]
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      if (provider === 'openai') {
        return await this.executeOpenAI(model, systemPrompt, userInput, tools, startTime);
      } else if (provider === 'anthropic') {
        return await this.executeAnthropic(model, systemPrompt, userInput, tools, startTime);
      }
      throw new Error(`Unsupported provider: ${provider}`);
    } catch (error) {
      const durationMs = Date.now() - startTime;
      throw {
        message: error instanceof Error ? error.message : 'Unknown error',
        durationMs,
      };
    }
  }

  private async executeOpenAI(
    model: string,
    systemPrompt: string,
    userInput: string,
    tools: string[] | undefined,
    startTime: number
  ): Promise<LLMResponse> {
    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput },
      ],
      temperature: 0.7,
    });

    const durationMs = Date.now() - startTime;
    const content = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens;

    return {
      content,
      tokensUsed,
      durationMs,
    };
  }

  private async executeAnthropic(
    model: string,
    systemPrompt: string,
    userInput: string,
    tools: string[] | undefined,
    startTime: number
  ): Promise<LLMResponse> {
    const response = await this.anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userInput },
      ],
    });

    const durationMs = Date.now() - startTime;
    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    return {
      content,
      tokensUsed,
      durationMs,
    };
  }
}

export const llmService = new LLMService();
