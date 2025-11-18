'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function RunDetailPage({ params }: { params: { id: string } }) {
  const [matrix, setMatrix] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatrix();
    // Poll for updates if run is not completed
    const interval = setInterval(() => {
      loadStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [params.id]);

  const loadMatrix = async () => {
    try {
      const data = await api.getRunMatrix(params.id);
      setMatrix(data);
    } catch (error) {
      console.error('Failed to load matrix:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const status = await api.getRunStatus(params.id);
      if (status.status === 'completed' || status.status === 'failed') {
        loadMatrix();
      }
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!matrix) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Run not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link href="/runs" className="text-indigo-600 hover:text-indigo-900">
          ← Back to Runs
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {matrix.runName || `Run ${matrix.runId.slice(0, 8)}`}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Suite: <span className="font-medium">{matrix.suiteName}</span>
        </p>
      </div>

      {/* Agent Summary Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matrix.agents.map((agent: any) => (
          <div
            key={agent.id}
            className="bg-white shadow rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                {agent.agentName}
              </h3>
              <StatusBadge status={agent.status} />
            </div>
            {agent.metrics && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Avg Score:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {agent.metrics.averageScore?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Success:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {agent.metrics.successfulTasks || 0}/{agent.metrics.totalTasks || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Avg Time:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {agent.metrics.averageDurationMs
                      ? `${(agent.metrics.averageDurationMs / 1000).toFixed(1)}s`
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Tokens:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {agent.metrics.totalTokens?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Results Matrix */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Results Matrix</h2>
          <p className="mt-1 text-sm text-gray-500">
            Performance comparison across agents and tasks
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Agent / Task
                </th>
                {matrix.tasks.map((task: any) => (
                  <th
                    key={task.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]"
                  >
                    <div className="truncate" title={task.name}>
                      {task.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {matrix.agents.map((agent: any) => (
                <tr key={agent.id}>
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                    {agent.agentName}
                  </td>
                  {agent.results.map((result: any, idx: number) => (
                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm">
                      <ResultCell result={result} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Detailed Results
        </h2>
        <div className="space-y-6">
          {matrix.agents.map((agent: any) => (
            <div key={agent.id} className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">
                  {agent.agentName}
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {agent.results.map((result: any, idx: number) => {
                  const task = matrix.tasks[idx];
                  return (
                    <details key={idx} className="group">
                      <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {task.name}
                        </span>
                        <div className="flex items-center gap-4">
                          {result.score && (
                            <ScoreBadge score={result.score} />
                          )}
                          {result.durationMs && (
                            <span className="text-xs text-gray-500">
                              {(result.durationMs / 1000).toFixed(1)}s
                            </span>
                          )}
                          {result.error && (
                            <span className="text-xs text-red-600">Error</span>
                          )}
                        </div>
                      </summary>
                      <div className="px-4 py-3 bg-gray-50 space-y-2">
                        {result.score && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-1">
                              Score Details:
                            </h4>
                            <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                              {JSON.stringify(result.score, null, 2)}
                            </pre>
                          </div>
                        )}
                        {result.error && (
                          <div>
                            <h4 className="text-xs font-medium text-red-700 mb-1">
                              Error:
                            </h4>
                            <pre className="text-xs bg-red-50 p-2 rounded border border-red-200 overflow-x-auto">
                              {result.error}
                            </pre>
                          </div>
                        )}
                        {result.tokensUsed && (
                          <div className="text-xs text-gray-600">
                            Tokens used: {result.tokensUsed.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
        colors[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  );
}

function ResultCell({ result }: { result: any }) {
  if (result.error) {
    return (
      <div className="flex flex-col items-center">
        <span className="text-red-600 font-medium">Error</span>
      </div>
    );
  }

  if (!result.score) {
    return (
      <div className="flex flex-col items-center">
        <span className="text-gray-400">-</span>
      </div>
    );
  }

  const score = getScoreValue(result.score);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`text-lg font-bold ${
          score >= 80
            ? 'text-green-600'
            : score >= 60
            ? 'text-yellow-600'
            : 'text-red-600'
        }`}
      >
        {score.toFixed(0)}
      </div>
      {result.durationMs && (
        <div className="text-xs text-gray-500 mt-1">
          {(result.durationMs / 1000).toFixed(1)}s
        </div>
      )}
    </div>
  );
}

function ScoreBadge({ score }: { score: any }) {
  const value = getScoreValue(score);
  const color =
    value >= 80
      ? 'bg-green-100 text-green-800'
      : value >= 60
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${color}`}>
      {value.toFixed(0)}
    </span>
  );
}

function getScoreValue(score: any): number {
  if (typeof score === 'number') return score;
  if (score.llmJudgeScore !== undefined) return score.llmJudgeScore;
  if (score.exactMatch !== undefined) return score.exactMatch ? 100 : 0;
  if (score.similarity !== undefined) return score.similarity * 100;
  return 0;
}
