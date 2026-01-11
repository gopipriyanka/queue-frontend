import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import './Login.css';

export default function Login() {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = await login(form.email, form.password);

    if (!user) return;

    // Redirect based on role
    if (user.role === "student") {
      window.location.href = "/dashboard";
    } else if (user.role === "mentor") {
      window.location.href = "/mentor";
    } else if (user.role === "admin") {
      window.location.href = "/admin";
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p>
          New user? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}
