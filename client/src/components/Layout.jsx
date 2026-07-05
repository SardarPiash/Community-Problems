import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const citizenLinks = [
  { to: '/', label: 'Home' },
  { to: '/complaints', label: 'My Complaints' },
  { to: '/complaints/new', label: 'Submit Complaint' },
];

const adminLinks = [
  { to: '/', label: 'Home' },
  { to: '/admin', label: 'Admin Dashboard' },
];

const authorityLinks = [
  { to: '/', label: 'Home' },
  { to: '/assigned', label: 'Assigned Complaints' },
];

function getNavLinks(role) {
  if (role === 'admin') return adminLinks;
  if (role === 'authority') return authorityLinks;
  return citizenLinks;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = getNavLinks(user?.role);

  const linkClass = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-blue-100 hover:bg-blue-600 hover:text-white'
    }`;

  const authLinks = user ? (
    <>
      <NavLink to="/profile" className={linkClass}>
        Profile
      </NavLink>
      <span className="hidden px-2 text-sm text-blue-200 md:inline">{user.name}</span>
      <button
        type="button"
        onClick={logout}
        className="rounded-md px-3 py-2 text-sm font-medium text-blue-100 hover:bg-blue-600 hover:text-white"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <NavLink to="/login" className={linkClass}>
        Login
      </NavLink>
      <NavLink
        to="/register"
        className="ml-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
      >
        Register
      </NavLink>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-blue-800 shadow">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-white">
            CPRS
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
            {authLinks}
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-blue-100 hover:bg-blue-700 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {menuOpen && (
          <div className="space-y-1 px-4 pb-3 md:hidden">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <div onClick={() => setMenuOpen(false)}>{authLinks}</div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-500">
        Community Problem Reporting System — v1.0
      </footer>
    </div>
  );
}
