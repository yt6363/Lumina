import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET || "pm-cursor-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      sameSite: "none"
    }
  }));

  // GitHub OAuth Routes
  app.get("/api/auth/github/url", (req, res) => {
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    if (!GITHUB_CLIENT_ID) {
      return res.status(500).json({ error: "GITHUB_CLIENT_ID not configured" });
    }

    const redirectUri = `${req.protocol}://${req.get("host")}/auth/github/callback`;
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: "repo read:user",
      state: Math.random().toString(36).substring(7),
    });

    res.json({ url: `https://github.com/login/oauth/authorize?${params.toString()}` });
  });

  app.get("/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

    if (!code || !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return res.status(400).send("Missing code or configuration");
    }

    try {
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.access_token) {
        // In a real app, you'd store this in a database or secure session
        // For this demo, we'll pass it back to the client via a script
        res.send(`
          <html>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'GITHUB_AUTH_SUCCESS', 
                    token: '${tokenData.access_token}' 
                  }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
              <p>Authentication successful. This window should close automatically.</p>
            </body>
          </html>
        `);
      } else {
        res.status(400).send("Failed to obtain access token");
      }
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      res.status(500).send("Internal Server Error");
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
