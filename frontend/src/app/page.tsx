import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Agent Benchmark Lab
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          A comprehensive platform for benchmarking and comparing different agent configurations.
          Test various models, system prompts, and tools across standardized task suites.
        </p>
        <div className="mt-10 flex justify-center gap-x-6">
          <Link
            href="/suites"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Task Suites
          </Link>
          <Link
            href="/agents"
            className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Agent Profiles
          </Link>
          <Link
            href="/runs"
            className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Benchmark Runs
          </Link>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Features</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Task Suites</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create and manage collections of benchmark tasks organized by domain
                (code, writing, planning, QA, etc.)
              </p>
            </div>
          </div>

          <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Agent Profiles</h3>
              <p className="mt-2 text-sm text-gray-500">
                Configure different agent setups with various models (OpenAI/Anthropic),
                system prompts, and tool configurations
              </p>
            </div>
          </div>

          <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Benchmark Runs</h3>
              <p className="mt-2 text-sm text-gray-500">
                Execute benchmarks across multiple agents and tasks, with automated
                scoring and detailed metrics
              </p>
            </div>
          </div>

          <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Multiple Scoring Methods</h3>
              <p className="mt-2 text-sm text-gray-500">
                Exact match, similarity scoring, and LLM-as-judge evaluation for
                comprehensive result analysis
              </p>
            </div>
          </div>

          <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Matrix View</h3>
              <p className="mt-2 text-sm text-gray-500">
                Visualize results in an agents × tasks matrix to easily compare
                performance across different configurations
              </p>
            </div>
          </div>

          <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Detailed Metrics</h3>
              <p className="mt-2 text-sm text-gray-500">
                Track performance with metrics including scores, duration, token usage,
                and success rates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
