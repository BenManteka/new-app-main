import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result === true) {
      navigate("/");
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center">
      <div className="row w-100">
        {/* Left Side - Form */}
        <div className="col-lg-6 d-flex justify-content-center align-items-center p-4">
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <div className="text-center mb-4">
              <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center p-3">
                <i className="bi bi-chat-left-text text-primary fs-4"></i>
              </div>
              <h2 className="mt-3">Welcome Back</h2>
              <p className="text-muted">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <Loader2 className="me-2 spinner-border spinner-border-sm" />
                    Loading...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="text-center mt-3">
                <p className="text-muted">
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" className="text-decoration-none">
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Pattern */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-light">
          <AuthImagePattern
            title="Welcome back!"
            subtitle="Sign in to continue your conversations and catch up with your messages."
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
