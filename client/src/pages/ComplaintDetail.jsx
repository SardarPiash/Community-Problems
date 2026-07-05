import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import StatusBadge from '../components/StatusBadge.jsx';

function TimelineItem({ entry, isLast }) {
  return (
    <li className="relative pb-6">
      {!isLast && <span className="absolute left-3 top-6 h-full w-px bg-gray-200" aria-hidden="true" />}
      <div className="relative flex gap-3">
        <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
          •
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={entry.status} />
            <span className="text-xs text-gray-500">
              {new Date(entry.timestamp).toLocaleString()}
            </span>
          </div>
          {entry.changedBy?.name && (
            <p className="mt-1 text-xs text-gray-500">
              Updated by {entry.changedBy.name}
              {entry.changedBy.role ? ` (${entry.changedBy.role})` : ''}
            </p>
          )}
          {entry.note && <p className="mt-1 text-sm text-gray-700">{entry.note}</p>}
        </div>
      </div>
    </li>
  );
}

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch(`/api/complaints/${id}`);
        if (!cancelled) {
          setComplaint(data.complaint);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading complaint…</p>;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
        <Link to="/complaints" className="ml-2 font-medium text-blue-800 hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/complaints" className="text-sm font-medium text-blue-800 hover:underline">
          ← Back to My Complaints
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {complaint.complaintId} · {complaint.category}
            </p>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Description</h2>
            <p className="mt-1 text-sm text-gray-700">{complaint.description}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Location</h2>
            <p className="mt-1 text-sm text-gray-700">{complaint.location}</p>
          </div>
          {complaint.images?.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Photos</h2>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {complaint.images.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt="Complaint attachment"
                    className="h-32 w-full rounded-md object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Status timeline</h2>
          <ol className="mt-4">
            {complaint.statusHistory.map((entry, index) => (
              <TimelineItem
                key={`${entry.timestamp}-${entry.status}-${index}`}
                entry={entry}
                isLast={index === complaint.statusHistory.length - 1}
              />
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
