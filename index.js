// proxy-server.ts
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 8080;

// Your target URL
const TARGET = "https://twitter.com";

app.use(
  "/",
  createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,
    onProxyReq(proxyReq, req, res) {
      proxyReq.setHeader("user-agent", "Mozilla/5.0 ..."); // rotate if needed
    },
  })
);

app.listen(PORT, () => {
  console.log(`🔁 Proxy running at http://localhost:${PORT}`);
});
