'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function SuiteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [suite, setSuite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  useEffect(() => {
    loadSuite();
  }, [params.id]);

  const loadSuite = async () => {
    try {
      const data = await api.getSuite(params.id);
      setSuite(data);
    } catch (error) {
      console.error('Failed to load suite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.deleteTask(taskId);
      await loadSuite();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!suite) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Suite not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link href="/suites" className="text-indigo-600 hover:text-indigo-900">
          ← Back to Suites
        </Link>
      </div>

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">{suite.name}</h1>
          {suite.description && (
            <p className="mt-2 text-sm text-gray-700">{suite.description}</p>
          )}
          <div className="mt-2">
            <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
              {suite.domain}
            </span>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowCreateTaskModal(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tasks ({suite.tasks?.length || 0})
        </h2>

        {suite.tasks?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tasks yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suite.tasks?.map((task: any, index: number) => (
              <div
                key={task.id}
                className="bg-white shadow rounded-lg border border-gray-200 p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {task.name || `Task ${index + 1}`}
                    </h3>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-indigo-600 hover:text-indigo-900">
                          View Input
                        </summary>
                        <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(task.inputJson, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="ml-4 text-red-600 hover:text-red-900 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateTaskModal && (
        <CreateTaskModal
          suiteId={suite.id}
          onClose={() => setShowCreateTaskModal(false)}
          onCreated={() => {
            setShowCreateTaskModal(false);
            loadSuite();
          }}
        />
      )}
    </div>
  );
}

function CreateTaskModal({
  suiteId,
  onClose,
  onCreated,
}: {
  suiteId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    inputJson: '',
    expectedJson: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let inputJson;
      let expectedJson = undefined;

      try {
        inputJson = JSON.parse(formData.inputJson);
      } catch {
        inputJson = formData.inputJson;
      }

      if (formData.expectedJson.trim()) {
        try {
          expectedJson = JSON.parse(formData.expectedJson);
        } catch {
          expectedJson = formData.expectedJson;
        }
      }

      await api.createTask({
        suiteId,
        name: formData.name || undefined,
        description: formData.description || undefined,
        inputJson,
        expectedJson,
      });
      onCreated();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-lg font-semibold mb-4">Add Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name (optional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description (optional)
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Input (JSON or text)
              </label>
              <textarea
                required
                value={formData.inputJson}
                onChange={(e) =>
                  setFormData({ ...formData, inputJson: e.target.value })
                }
                rows={6}
                placeholder='{"prompt": "Write a hello world program"}'
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expected Output (optional, JSON or text)
              </label>
              <textarea
                value={formData.expectedJson}
                onChange={(e) =>
                  setFormData({ ...formData, expectedJson: e.target.value })
                }
                rows={4}
                placeholder='Optional expected output for scoring'
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
              {submitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
