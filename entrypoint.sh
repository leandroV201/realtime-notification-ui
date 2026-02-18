#!/bin/sh
echo "Starting Node.js server on port 3000..."
node /app/server.mjs &
NODE_PID=$!

echo "Starting nginx on port 80..."
nginx -g "daemon off;" &
NGINX_PID=$!

wait $NODE_PID $NGINX_PID
