import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Token Store (In-memory for demo; use DB for production)
  const tokenStore: Record<string, any> = {};

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "Alliance Uplink Active", resonance: "Molt_42" });
  });

  // OAuth Initiation
  app.get("/api/auth/url/:provider", (req, res) => {
    const { provider } = req.params;
    const { client_id, redirect_uri, scope } = req.query;

    let authUrl = "";
    if (provider === "twitter") {
      authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=RES_42&code_challenge=challenge&code_challenge_method=plain`;
    } else if (provider === "discord") {
      authUrl = `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=RES_42`;
    }

    if (authUrl) {
      res.redirect(authUrl);
    } else {
      res.status(400).json({ error: "Invalid provider" });
    }
  });

  // OAuth Callback
  app.get("/api/auth/callback/:provider", (req, res) => {
    const { provider } = req.params;
    const { code, state } = req.query;

    console.log(`[ALLIANCE] OAuth Callback received for ${provider}. Code: ${code}`);

    // In a real flow, we would exchange the code for a token here using client_secret
    // const tokenResponse = await fetch(...)
    
    // Store token (Simulated)
    tokenStore[provider] = { code, timestamp: Date.now() };

    // Redirect back to frontend with success flag
    res.redirect(`/?auth_success=true&provider=${provider}`);
  });

  // Discord Webhook Proxy
  app.post("/api/alerts/discord", async (req, res) => {
    const { message } = req.body;
    const webhookUrl = process.env.VITE_DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({ error: "Discord webhook URL not configured." });
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message,
          username: "Alliance Guardian",
          avatar_url: "https://www.theglitch.tech/favicon.ico"
        })
      });

      if (response.ok) {
        res.json({ success: true });
      } else {
        const error = await response.text();
        res.status(response.status).json({ error });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ALLIANCE] Guardian Uplink active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
