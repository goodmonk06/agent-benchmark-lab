import prisma from '../db';
import { llmService } from './llm.service';
import { scoringService } from './scoring.service';

export class RunnerService {
  /**
   * Execute a benchmark run
   */
  async executeBenchmarkRun(runId: string): Promise<void> {
    // Update run status
    await prisma.benchmarkRun.update({
      where: { id: runId },
      data: { status: 'running' },
    });

    try {
      // Get run with all related data
      const run = await prisma.benchmarkRun.findUnique({
        where: { id: runId },
        include: {
          suite: {
            include: {
              tasks: true,
            },
          },
          agents: {
            include: {
              agentProfile: true,
            },
          },
        },
      });

      if (!run) {
        throw new Error(`Run ${runId} not found`);
      }

      const tasks = run.suite.tasks;

      // Execute each agent × task combination
      for (const runAgent of run.agents) {
        await this.executeRunAgent(runAgent.id, runAgent.agentProfile, tasks);
      }

      // Mark run as completed
      await prisma.benchmarkRun.update({
        where: { id: runId },
        data: { status: 'completed' },
      });
    } catch (error) {
      console.error(`Error executing run ${runId}:`, error);
      await prisma.benchmarkRun.update({
        where: { id: runId },
        data: { status: 'failed' },
      });
      throw error;
    }
  }

  private async executeRunAgent(
    runAgentId: string,
    agentProfile: any,
    tasks: any[]
  ): Promise<void> {
    await prisma.benchmarkRunAgent.update({
      where: { id: runAgentId },
      data: { status: 'running' },
    });

    try {
      const results = [];

      // Execute each task
      for (const task of tasks) {
        const result = await this.executeTask(runAgentId, agentProfile, task);
        results.push(result);
      }

      // Calculate aggregate metrics
      const metrics = this.calculateAggregateMetrics(results);

      await prisma.benchmarkRunAgent.update({
        where: { id: runAgentId },
        data: {
          status: 'completed',
          metricsJson: metrics,
        },
      });
    } catch (error) {
      console.error(`Error executing run agent ${runAgentId}:`, error);
      await prisma.benchmarkRunAgent.update({
        where: { id: runAgentId },
        data: { status: 'failed' },
      });
      throw error;
    }
  }

  private async executeTask(
    runAgentId: string,
    agentProfile: any,
    task: any
  ): Promise<any> {
    const startTime = Date.now();

    try {
      // Prepare input
      const userInput = this.prepareInput(task.inputJson);

      // Execute LLM
      const llmResponse = await llmService.execute(
        agentProfile.provider,
        agentProfile.model,
        agentProfile.systemPrompt,
        userInput,
        agentProfile.toolsJson
      );

      // Parse output
      const output = this.parseOutput(llmResponse.content);

      // Score the result
      const score = await scoringService.score(
        output,
        task.expectedJson,
        task.scoringConfigJson
      );

      // Save result
      const result = await prisma.benchmarkResult.create({
        data: {
          runAgentId,
          taskItemId: task.id,
          outputJson: output,
          scoreJson: score,
          durationMs: llmResponse.durationMs,
          tokensUsed: llmResponse.tokensUsed,
        },
      });

      return result;
    } catch (error) {
      // Save error result
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const result = await prisma.benchmarkResult.create({
        data: {
          runAgentId,
          taskItemId: task.id,
          outputJson: null,
          scoreJson: null,
          errorMessage,
          durationMs,
        },
      });

      return result;
    }
  }

  private prepareInput(inputJson: any): string {
    if (typeof inputJson === 'string') {
      return inputJson;
    }
    if (inputJson.prompt) {
      return inputJson.prompt;
    }
    return JSON.stringify(inputJson);
  }

  private parseOutput(content: string): any {
    // Try to parse as JSON first
    try {
      return JSON.parse(content);
    } catch {
      // Return as string if not valid JSON
      return content;
    }
  }

  private calculateAggregateMetrics(results: any[]): any {
    const validResults = results.filter(r => r.scoreJson !== null);

    if (validResults.length === 0) {
      return {
        totalTasks: results.length,
        successfulTasks: 0,
        failedTasks: results.length,
        averageScore: 0,
      };
    }

    const scores = validResults.map(r => {
      const score = r.scoreJson;
      if (score.llmJudgeScore !== undefined) {
        return score.llmJudgeScore;
      }
      if (score.exactMatch !== undefined) {
        return score.exactMatch ? 100 : 0;
      }
      if (score.similarity !== undefined) {
        return score.similarity * 100;
      }
      return 0;
    });

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const totalDuration = results.reduce((sum, r) => sum + (r.durationMs || 0), 0);
    const totalTokens = results.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);

    return {
      totalTasks: results.length,
      successfulTasks: validResults.length,
      failedTasks: results.length - validResults.length,
      averageScore: Math.round(averageScore * 100) / 100,
      totalDurationMs: totalDuration,
      averageDurationMs: Math.round(totalDuration / results.length),
      totalTokens,
      averageTokens: Math.round(totalTokens / results.length),
    };
  }
}

export const runnerService = new RunnerService();
