// server.js
import http from 'http';
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  const target = req.url.startsWith('http') ? req.url : `http://${req.headers.host}${req.url}`;
  console.log(`🔁 Proxying: ${target}`);
  proxy.web(req, res, { target, changeOrigin: true }, (e) => {
    console.error(`❌ Proxy error:`, e.message);
    res.writeHead(500);
    res.end('Proxy error');
  });
});

server.listen(3000, () => {
  console.log('🛡️ Proxy server running on http://localhost:3000');
});
