import http from "http";
import https from "https";
import net from "net";
import { URL } from "url";

const proxy = http.createServer((req, res) => {
  const url = new URL(req.url);
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname + url.search,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on("error", (err) => {
    res.writeHead(500);
    res.end("Proxy error: " + err.message);
  });
});

// 🔐 Handle HTTPS tunneling via CONNECT
proxy.on("connect", (req, clientSocket, head) => {
  const [host, port] = req.url.split(":");
  const serverSocket = net.connect(port || 443, host, () => {
    clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on("error", (err) => {
    clientSocket.end("HTTP/1.1 500 Proxy error\r\n\r\n");
  });
});

proxy.listen(process.env.PORT || 3000, () => {
  console.log("🛡️ Proxy server running");
});
