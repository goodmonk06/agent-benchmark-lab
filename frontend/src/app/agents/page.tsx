'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await api.getAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent profile?')) return;

    try {
      await api.deleteAgent(id);
      await loadAgents();
    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert('Failed to delete agent');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Agent Profiles</h1>
          <p className="mt-2 text-sm text-gray-700">
            Configure different agent setups with various models and system prompts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowCreateModal(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Create Agent
          </button>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500">No agent profiles yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white shadow rounded-lg border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {agent.name}
                  </h3>
                  {agent.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {agent.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Provider:</span>
                  <span className="font-medium text-gray-900">
                    {agent.provider}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Model:</span>
                  <span className="font-medium text-gray-900 truncate ml-2">
                    {agent.model}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tools:</span>
                  <span className="font-medium text-gray-900">
                    {Array.isArray(agent.toolsJson) ? agent.toolsJson.length : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Runs:</span>
                  <span className="font-medium text-gray-900">
                    {agent._count?.runAgents || 0}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <details className="text-sm">
                  <summary className="cursor-pointer text-indigo-600 hover:text-indigo-900">
                    View System Prompt
                  </summary>
                  <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto">
                    {agent.systemPrompt}
                  </pre>
                </details>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleDelete(agent.id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadAgents();
          }}
        />
      )}
    </div>
  );
}

function CreateAgentModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: 'openai',
    model: 'gpt-4',
    systemPrompt: '',
    toolsJson: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let tools: string[] = [];
      if (formData.toolsJson.trim()) {
        try {
          tools = JSON.parse(formData.toolsJson);
          if (!Array.isArray(tools)) {
            throw new Error('Tools must be an array');
          }
        } catch {
          tools = formData.toolsJson.split(',').map(t => t.trim()).filter(Boolean);
        }
      }

      await api.createAgent({
        name: formData.name,
        description: formData.description || undefined,
        provider: formData.provider,
        model: formData.model,
        systemPrompt: formData.systemPrompt,
        toolsJson: tools,
      });
      onCreated();
    } catch (error) {
      console.error('Failed to create agent:', error);
      alert('Failed to create agent: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-lg font-semibold mb-4">Create Agent Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Provider
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Model
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  placeholder={
                    formData.provider === 'openai'
                      ? 'gpt-4, gpt-3.5-turbo'
                      : 'claude-3-opus-20240229'
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                System Prompt
              </label>
              <textarea
                required
                value={formData.systemPrompt}
                onChange={(e) =>
                  setFormData({ ...formData, systemPrompt: e.target.value })
                }
                rows={6}
                placeholder="You are a helpful assistant..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tools (comma-separated or JSON array)
              </label>
              <input
                type="text"
                value={formData.toolsJson}
                onChange={(e) =>
                  setFormData({ ...formData, toolsJson: e.target.value })
                }
                placeholder='["web_search", "calculator"] or web_search, calculator'
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border font-mono text-xs"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
