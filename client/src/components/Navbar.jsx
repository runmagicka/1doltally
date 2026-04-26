import { NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "../features/auth/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate("/login");
  };

  const initial = user?.username?.charAt(0).toUpperCase() ?? "?";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-logo">IdolTally</span>

        <div className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/stats"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Stats
          </NavLink>
        </div>

        {/* <div className="navbar-user">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="navbar-avatar"
            />
          ) : (
            <span className="navbar-avatar-placeholder">{initial}</span>
          )}
        </div> */}

        <button className="btn btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
