import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/complaints', label: 'My Complaints' },
  { to: '/complaints/new', label: 'Submit Complaint' },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-blue-100 hover:bg-blue-600 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-blue-800 shadow">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-white">
            CPRS
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
            <NavLink
              to="/register"
              className="ml-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
            >
              Register
            </NavLink>
          </div>

          {/* Mobile menu button */}
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

        {/* Mobile nav */}
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
            <NavLink to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
              Login
            </NavLink>
            <NavLink to="/register" className={linkClass} onClick={() => setMenuOpen(false)}>
              Register
            </NavLink>
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
