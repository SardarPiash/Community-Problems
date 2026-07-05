import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-blue-800 px-6 py-12 text-center text-white sm:px-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Report Community Problems</h1>
        <p className="mx-auto mt-4 max-w-2xl text-blue-100">
          Report damaged roads, waste issues, water leakage, broken streetlights, drainage
          problems, and security concerns directly to the responsible authorities — and track
          resolution every step of the way.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/complaints/new"
            className="rounded-md bg-white px-5 py-2.5 font-semibold text-blue-800 hover:bg-blue-50"
          >
            Submit New Complaint
          </Link>
          <Link
            to="/complaints"
            className="rounded-md border border-blue-300 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Track My Complaints
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { title: 'Submit', text: 'Describe the problem, add photos, and pick a category.' },
          { title: 'Track', text: 'Follow your complaint from verification to resolution.' },
          { title: 'Resolve', text: 'Authorities update progress until the issue is fixed.' },
        ].map((card) => (
          <div key={card.title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900">{card.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{card.text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <span className="font-medium text-gray-700">API status: </span>
        {health ? (
          <span className="text-green-700">
            {health.status} (db: {health.db})
          </span>
        ) : error ? (
          <span className="text-red-600">unreachable — {error}</span>
        ) : (
          <span className="text-gray-500">checking…</span>
        )}
      </section>
    </div>
  );
}
