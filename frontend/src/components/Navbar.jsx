// Top navigation bar. On small screens the links fold into a "Menu" button.
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate('/login', { replace: true });
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="brand" onClick={closeMenu}>
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span>True Track</span>
        </Link>

        <button
          type="button"
          className="menu-button"
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>

        <nav id="main-menu" className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/dashboard" onClick={closeMenu}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" end onClick={closeMenu}>
            Tasks
          </NavLink>
          <NavLink to="/tasks/new" onClick={closeMenu}>
            Add Task
          </NavLink>
          <span className="nav-user" title={user?.email}>
            {user?.name}
          </span>
          <button type="button" className="btn btn-outline btn-small" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
