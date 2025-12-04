import { useState } from "react";
import type { FormEvent } from "react";
import { Panel } from "../components/Panel";
import { authService } from "../services/travelmateApi";
import { useAuthStore } from "../store/useAuthStore";

export const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("demo@travel.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Traveler");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const payload = mode === "login" ? { email, password } : { email, password, name };
      const data = mode === "login" ? await authService.login(payload) : await authService.signup(payload);
      await setCredentials(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-grid">
        <Panel title="Travel Companion" subtitle="Plan, track, and relive every trip from one place.">
          <ul>
            <li>Authenticate once and pick up where you left off.</li>
            <li>Visualize visited cities, wishlist items, and curated highlights.</li>
            <li>Ask the advisor for smart flight + stay suggestions in seconds.</li>
          </ul>
        </Panel>
        <Panel
          title={mode === "login" ? "Welcome back" : "Create an account"}
          subtitle={mode === "login" ? "Use your credentials to access the dashboard." : "A few details to get started."}
        >
          <form className="form-grid" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <label>
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Jane Traveler" />
              </label>
            )}
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error && <div className="alert">{error}</div>}
            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Working..." : mode === "login" ? "Log in" : "Sign up"}
            </button>
            <button
              className="secondary"
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
            </button>
          </form>
        </Panel>
      </div>
    </div>
  );
};
