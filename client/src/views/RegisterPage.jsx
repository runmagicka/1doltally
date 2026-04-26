import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authSlice";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ username: "", email: "", password: "" });

  useEffect(() => {
    if (token) navigate("/", { replace: true });
  }, [token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      navigate("/");
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-logo-text">IdolTally</p>
        <h1 className="auth-title">Create account</h1>

        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Username
            <input
              className="input"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="username"
              required
            />
          </label>

          <label className="form-label">
            Email
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="form-label">
            Password
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="min. 6 characters"
              required
              minLength={6}
            />
          </label>

          <button
            className="btn btn-primary auth-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
