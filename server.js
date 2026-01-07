const WebSocket = require('ws');

// Create WebSocket server on port 3000
const wss = new WebSocket.Server({ port: 3000 });

console.log("WebSocket server listening on ws://localhost:3000");

wss.on('connection', (ws, request) => {
  console.log("Client connected");

  ws.on('message', (message) => {
    console.log("Received:", message.toString());

    // Reply with "hello" for any message
    ws.send("hello");
  });

  ws.on('close', () => {
    console.log("Client disconnected");
  });

  ws.on('error', (err) => {
    console.error("WebSocket error:", err);
  });
});

