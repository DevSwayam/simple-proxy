import http from 'http';
import net from 'net';
import url from 'url';
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({});

// Handle HTTP requests (e.g., http://example.com)
const server = http.createServer((req, res) => {
  const target = req.url.startsWith('http') ? req.url : `http://${req.headers.host}${req.url}`;
  console.log(`🔁 Proxying HTTP: ${target}`);
  proxy.web(req, res, { target, changeOrigin: true }, (e) => {
    console.error(`❌ HTTP Proxy error:`, e.message);
    res.writeHead(500);
    res.end('Proxy error');
  });
});

// Handle HTTPS CONNECT method (e.g., https://example.com)
server.on('connect', (req, clientSocket, head) => {
  const { port, hostname } = new URL(`http://${req.url}`);
  console.log(`🔐 CONNECT request: ${hostname}:${port}`);

  const serverSocket = net.connect(port || 443, hostname, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', (err) => {
    console.error(`❌ CONNECT Proxy error:`, err.message);
    clientSocket.end(`HTTP/1.1 500 ${err.message}\r\n`);
  });
});

server.listen(3000, () => {
  console.log('🛡️ Proxy server running on http://localhost:3000');
});
