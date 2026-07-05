import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    password: '',
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name,
        phone: user.phone,
      }));
    }
  }, [user]);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const payload = {
      name: form.name,
      phone: form.phone,
    };

    if (form.password) {
      payload.password = form.password;
      payload.currentPassword = form.currentPassword;
    }

    try {
      await updateProfile(payload);
      setMessage('Profile updated successfully.');
      setForm((prev) => ({ ...prev, currentPassword: '', password: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      <p className="mt-1 text-sm text-gray-600">View and edit your account details.</p>

      <dl className="mt-4 grid grid-cols-2 gap-2 rounded-md bg-gray-50 p-4 text-sm">
        <dt className="text-gray-500">Email</dt>
        <dd className="font-medium text-gray-900">{user?.email}</dd>
        <dt className="text-gray-500">Role</dt>
        <dd className="font-medium capitalize text-gray-900">{user?.role}</dd>
      </dl>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        {message && (
          <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={update('name')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={form.phone}
            onChange={update('phone')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <hr className="border-gray-200" />

        <p className="text-sm font-medium text-gray-700">Change password (optional)</p>

        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={update('currentPassword')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={update('password')}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
