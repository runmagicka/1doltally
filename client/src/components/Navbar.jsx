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
            to="/idols"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Idols
          </NavLink>
          <NavLink
            to="/groups"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Groups
          </NavLink>
          <NavLink
            to="/stats"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Stats
          </NavLink>
          <NavLink
            to="/add"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Add
          </NavLink>
        </div>

        <button className="btn btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
