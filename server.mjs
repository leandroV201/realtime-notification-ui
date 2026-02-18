import { createServer } from 'node:http';
import serverHandler from './dist/server/server.js';


const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const httpServer = createServer(async (req, res) => {
  try {
    const response = await serverHandler.fetch(
      new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method,
        headers: req.headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
      })
    );

    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(await response.text());
  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
