import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../api/client.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { COMPLAINT_CATEGORIES } from '../../constants/categories.js';
import { COMPLAINT_STATUSES } from '../../constants/statuses.js';

function ComplaintsTab() {
  const [complaints, setComplaints] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [assignAuthorityId, setAssignAuthorityId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    authority: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [filters]);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/api/complaints${queryString}`);
      setComplaints(data.complaints);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  const loadAuthorities = useCallback(async () => {
    try {
      const data = await apiFetch('/api/users?role=authority');
      setAuthorities(data.users.filter((user) => user.status === 'active'));
    } catch {
      setAuthorities([]);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
    loadAuthorities();
  }, [loadComplaints, loadAuthorities]);

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

  async function handleVerify(decision) {
    setSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const data = await apiFetch(`/api/complaints/${selectedId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({
          decision,
          reason: decision === 'rejected' ? rejectReason : undefined,
        }),
      });
      setSelected(data.complaint);
      setActionMessage(decision === 'verified' ? 'Complaint verified.' : 'Complaint rejected.');
      setRejectReason('');
      await loadComplaints();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssign() {
    setSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    try {
      const data = await apiFetch(`/api/complaints/${selectedId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ authorityId: assignAuthorityId }),
      });
      setSelected(data.complaint);
      setActionMessage('Complaint assigned to authority.');
      setAssignAuthorityId('');
      await loadComplaints();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {COMPLAINT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              {COMPLAINT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={filters.authority}
              onChange={(e) => setFilters((prev) => ({ ...prev, authority: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All authorities</option>
              {authorities.map((authority) => (
                <option key={authority.id} value={authority.id}>
                  {authority.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="search"
              placeholder="Search…"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2 xl:col-span-1"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading complaints…</p>
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
              <p className="px-4 py-8 text-center text-sm text-gray-500">No complaints match filters.</p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
        <h2 className="text-lg font-semibold text-gray-900">Detail & actions</h2>
        {!selectedId ? (
          <p className="mt-4 text-sm text-gray-500">Select a complaint from the queue.</p>
        ) : detailLoading ? (
          <p className="mt-4 text-sm text-gray-500">Loading detail…</p>
        ) : selected ? (
          <div className="mt-4 space-y-4">
            {actionMessage && (
              <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{actionMessage}</div>
            )}
            {actionError && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</div>
            )}

            <div>
              <StatusBadge status={selected.status} />
              <h3 className="mt-2 font-semibold text-gray-900">{selected.title}</h3>
              <p className="text-sm text-gray-500">{selected.complaintId}</p>
            </div>

            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Citizen</dt>
                <dd className="text-gray-900">{selected.citizen?.name || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Location</dt>
                <dd className="text-gray-900">{selected.location}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Description</dt>
                <dd className="text-gray-900">{selected.description}</dd>
              </div>
            </dl>

            {selected.status === 'Pending Verification' && (
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-900">Verify or reject</p>
                <textarea
                  rows={2}
                  placeholder="Rejection reason (required if rejecting)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleVerify('verified')}
                    className="rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
                  >
                    Verify
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleVerify('rejected')}
                    className="rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {selected.status === 'Verified' && (
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-900">Assign to authority</p>
                <select
                  value={assignAuthorityId}
                  onChange={(e) => setAssignAuthorityId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select authority</option>
                  {authorities.map((authority) => (
                    <option key={authority.id} value={authority.id}>
                      {authority.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={submitting || !assignAuthorityId}
                  onClick={handleAssign}
                  className="rounded-md bg-blue-800 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  Assign
                </button>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-900">Timeline</p>
              <ol className="mt-2 space-y-2">
                {selected.statusHistory.map((entry, index) => (
                  <li key={`${entry.timestamp}-${index}`} className="text-sm text-gray-700">
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
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = roleFilter ? `?role=${roleFilter}` : '';
      const data = await apiFetch(`/api/users${qs}`);
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function toggleStatus(user) {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';
    try {
      await apiFetch(`/api/users/${user.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          <option value="citizen">Citizens</option>
          <option value="authority">Authorities</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading users…</p>
      ) : error ? (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Role</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                  <td className="px-4 py-3 capitalize">{user.status}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleStatus(user)}
                      className="text-sm font-medium text-blue-800 hover:underline"
                    >
                      {user.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AnalyticsTab() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/api/analytics/summary');
        setSummary(data.summary);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading analytics…</p>;
  if (error) return <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>;
  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total complaints', value: summary.totalComplaints },
          { label: 'Resolved %', value: `${summary.resolvedPercent}%` },
          {
            label: 'Avg resolution (days)',
            value: summary.averageResolutionDays ?? '—',
          },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900">By category</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {summary.byCategory.map((item) => (
              <li key={item.category} className="flex justify-between">
                <span>{item.category}</span>
                <span className="font-medium">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900">By status</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {summary.byStatus.map((item) => (
              <li key={item.status} className="flex items-center justify-between gap-2">
                <StatusBadge status={item.status} />
                <span className="font-medium">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'complaints', label: 'Complaints' },
  { id: 'users', label: 'Users' },
  { id: 'analytics', label: 'Analytics' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('complaints');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Verify complaints, assign authorities, manage users, and view analytics.
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'border-blue-800 text-blue-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'complaints' && <ComplaintsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  );
}
