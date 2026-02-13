import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield } from "lucide-react";

interface AccessTokenDialogProps {
  isOpen: boolean;
  serviceName: string;
  onSubmit: (token: string) => void;
  onClose: () => void;
}

export default function AccessTokenDialog({
  isOpen,
  serviceName,
  onSubmit,
  onClose,
}: AccessTokenDialogProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Access token is required.");
      return;
    }
    setError("");
    setLoading(true);

    // Validate the token via API
    try {
      const res = await fetch("/api/auth/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: serviceName, token }),
      });
      setLoading(false);

      if (res.ok) {
        onSubmit(token);
        setToken("");
      } else {
        setError("Invalid access token for this service.");
      }
    } catch {
      setLoading(false);
      setError("Failed to validate token. Try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-panel p-8 rounded-2xl border border-white/10 w-full max-w-md relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Access Token Required</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter the access token for {serviceName}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 focus:border-primary focus:outline-none transition-colors"
                    placeholder="Enter access token"
                    autoFocus
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Validating..." : "Unlock Module"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}