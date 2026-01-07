const WebSocket = require('ws');
const net = require('net');
const edge = net.createConnection({ host: '127.0.0.1', port: 4000 });
const wss = new WebSocket.Server({ port: 3000 });
const { v4: uuidv4 } = require('uuid');

const listener = net.createServer((socket) => {
  console.log("IPC connect");
  socket.setEncoding("utf8");
  socket.on("data", (data) => {
    const text = data.toString().trim();
    let msg;
    try {
      msg = JSON.parse(text);
    } catch (err) {
      console.error("Invalid JSON from local process:", err.message);
      return;
    }
    if (!msg.client || typeof msg.client !== "string") {
      console.error("Missing or invalid 'client' field");
      return;
    }
    if (typeof msg.data !== "object") {
      console.error("Missing or invalid 'data' field");
      return;
    }
    sendToClient(msg.client, JSON.stringify(msg.data));
  });
  socket.on("close", () => {
    console.log("IPC closed");
  });
  socket.on("error", (err) => {
    console.error("IPC error: ", err);
  });
});

const port = 3001
listener.listen(port, "127.0.0.1", () => {
  console.log(`IPC started on ${port}`);
});

const clients = new Map()

wss.on('connection', (ws, request) => {
  console.log("WebSocket server listening on ws://localhost:3000");
  const id = uuidv4();
  clients.set(id, ws);
  console.log(`Client connected: ${id}`);

  ws.on('message', (message) => {
    console.log(`From ${id}:`, message.toString());
    edge.write(message.toString());
  });

  ws.on('close', () => {
    clients.delete(id);
    console.log(`Client disconnected: ${id}`);
  });

  ws.on('error', (err) => {
    console.error("WebSocket error:", err);
  });
});

function sendToClient(id, text) {
    const ws = clients.get(id);
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(text);
    }
}

