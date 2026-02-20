import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(username, password);
    setLoading(false);

    if (success) {
      navigate("/");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-10 rounded-2xl border border-white/10 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-2 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            NEXUS
          </span>
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Authenticate to access the system.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 focus:border-primary focus:outline-none transition-colors"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 focus:border-primary focus:outline-none transition-colors"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}