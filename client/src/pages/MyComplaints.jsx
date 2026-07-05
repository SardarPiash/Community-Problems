import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import StatusBadge from '../components/StatusBadge.jsx';
import NotificationList from '../components/NotificationList.jsx';
import { COMPLAINT_CATEGORIES } from '../constants/categories.js';
import { COMPLAINT_STATUSES } from '../constants/statuses.js';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.search.trim()) params.set('search', filters.search.trim());
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [filters]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [complaintsData, notificationsData] = await Promise.all([
          apiFetch(`/api/complaints/mine${queryString}`),
          apiFetch('/api/notifications'),
        ]);
        if (!cancelled) {
          setComplaints(complaintsData.complaints);
          setNotifications(notificationsData.notifications);
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
  }, [queryString]);

  async function handleMarkRead(notificationId) {
    try {
      await apiFetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          <p className="mt-1 text-sm text-gray-600">Track the status of complaints you have submitted.</p>
        </div>
        <Link
          to="/complaints/new"
          className="inline-flex justify-center rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Submit New Complaint
        </Link>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Filter & search</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
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

          <input
            type="search"
            placeholder="Search title, ID, or location"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Complaints</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading complaints…</p>
        ) : error ? (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : complaints.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-gray-600">No complaints found.</p>
            <Link
              to="/complaints/new"
              className="mt-3 inline-block text-sm font-medium text-blue-800 hover:underline"
            >
              Submit your first complaint
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <ul className="divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <li key={complaint.id}>
                  <Link
                    to={`/complaints/${complaint.id}`}
                    className="block px-4 py-4 hover:bg-gray-50 sm:px-6"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{complaint.title}</p>
                        <p className="text-sm text-gray-500">
                          {complaint.complaintId} · {complaint.category} · {complaint.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={complaint.status} />
                        <span className="text-xs text-gray-500">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Notifications</h2>
        <NotificationList
          notifications={notifications}
          loading={loading}
          onMarkRead={handleMarkRead}
        />
      </section>
    </div>
  );
}
