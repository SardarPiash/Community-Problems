import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../api/client.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { COMPLAINT_STATUSES } from '../../constants/statuses.js';

const AUTHORITY_UPDATE_STATUSES = ['In Progress', 'Resolved', 'Unable to Resolve'];

export default function AuthorityAssigned() {
  const [complaints, setComplaints] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [newStatus, setNewStatus] = useState('In Progress');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
      const data = await apiFetch(`/api/complaints/assigned${qs}`);
      setComplaints(data.complaints);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      return;
    }

    let cancelled = false;
    async function loadDetail() {
      setDetailLoading(true);
      setActionError(null);
      try {
        const data = await apiFetch(`/api/complaints/${selectedId}`);
        if (!cancelled) {
          setSelected(data.complaint);
        }
      } catch (err) {
        if (!cancelled) {
          setActionError(err.message);
          setSelected(null);
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    }

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const canUpdate =
    selected && (selected.status === 'Assigned' || selected.status === 'In Progress');

  async function handleStatusUpdate(e) {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const data = await apiFetch(`/api/complaints/${selectedId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, note }),
      });
      setSelected(data.complaint);
      setActionMessage(`Status updated to ${newStatus}.`);
      setNote('');
      await loadComplaints();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assigned Complaints</h1>
        <p className="mt-1 text-sm text-gray-600">
          View complaints assigned to you and update progress until resolved.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {COMPLAINT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {loading ? (
            <p className="text-sm text-gray-500">Loading assigned complaints…</p>
          ) : error ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <ul className="divide-y divide-gray-200">
                {complaints.map((complaint) => (
                  <li key={complaint.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(complaint.id)}
                      className={`block w-full px-4 py-4 text-left hover:bg-gray-50 sm:px-6 ${
                        selectedId === complaint.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{complaint.title}</p>
                          <p className="text-sm text-gray-500">
                            {complaint.complaintId} · {complaint.category}
                            {complaint.citizen ? ` · ${complaint.citizen.name}` : ''}
                          </p>
                        </div>
                        <StatusBadge status={complaint.status} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              {complaints.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  No assigned complaints.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">Update status</h2>
          {!selectedId ? (
            <p className="mt-4 text-sm text-gray-500">Select a complaint to update.</p>
          ) : detailLoading ? (
            <p className="mt-4 text-sm text-gray-500">Loading detail…</p>
          ) : selected ? (
            <div className="mt-4 space-y-4">
              {actionMessage && (
                <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                  {actionMessage}
                </div>
              )}
              {actionError && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</div>
              )}

              <div>
                <StatusBadge status={selected.status} />
                <h3 className="mt-2 font-semibold text-gray-900">{selected.title}</h3>
                <p className="text-sm text-gray-500">{selected.location}</p>
                <p className="mt-2 text-sm text-gray-700">{selected.description}</p>
              </div>

              {canUpdate ? (
                <form onSubmit={handleStatusUpdate} className="space-y-3 border-t border-gray-200 pt-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      New status
                    </label>
                    <select
                      id="status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      {AUTHORITY_UPDATE_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                      Progress note
                    </label>
                    <textarea
                      id="note"
                      required
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Describe progress or resolution details"
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {submitting ? 'Updating…' : 'Update status'}
                  </button>
                </form>
              ) : (
                <p className="border-t border-gray-200 pt-4 text-sm text-gray-500">
                  This complaint is closed and cannot be updated.
                </p>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-900">Timeline</p>
                <ol className="mt-2 space-y-2">
                  {selected.statusHistory.map((entry, index) => (
                    <li key={`${entry.timestamp}-${index}`} className="text-sm">
                      <StatusBadge status={entry.status} />
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      {entry.note && <p className="mt-1 text-gray-600">{entry.note}</p>}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
