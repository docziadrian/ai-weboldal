import type { Express } from "express";

const USERS = [
  { username: "admin", password: "admin123" },
];

const SERVICE_TOKENS: Record<string, string> = {
  chatterblast: "cb-token-secret",
  dreamweaver: "dw-token-secret",
  mindreader: "mr-token-secret",
};

export function registerRoutes(app: Express) {

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      return res.json({ success: true, username: user.username });
    }
    return res.status(401).json({ error: "Invalid credentials" });
  });

  app.post("/api/auth/validate-token", (req, res) => {
    const { service, token } = req.body;
    const validToken = SERVICE_TOKENS[service];
    if (validToken && validToken === token) {
      return res.json({ success: true });
    }
    return res.status(403).json({ error: "Invalid access token" });
  });

}