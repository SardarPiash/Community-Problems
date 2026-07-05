import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';

export default function NotificationList({ notifications, loading, onMarkRead }) {
  if (loading) {
    return <p className="text-sm text-gray-500">Loading notifications…</p>;
  }

  if (!notifications.length) {
    return <p className="text-sm text-gray-500">No notifications yet.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className={`px-4 py-3 ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-900">{notification.message}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
                {notification.complaint && (
                  <Link
                    to={`/complaints/${notification.complaint.id}`}
                    className="font-medium text-blue-800 hover:underline"
                  >
                    {notification.complaint.complaintId}
                  </Link>
                )}
              </div>
            </div>
            {!notification.isRead && onMarkRead && (
              <button
                type="button"
                onClick={() => onMarkRead(notification.id)}
                className="shrink-0 text-xs font-medium text-blue-800 hover:underline"
              >
                Mark read
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
