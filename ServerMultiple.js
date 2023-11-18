const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();
const server = http.createServer(app);
const port = 8080;

// Create a WebSocket server for each port
const wss = {};
for (let i = 12345; i <= 12350; i++) {
  wss[i] = new WebSocket.Server({ noServer: true });
}

app.use(express.json());

// Function to process received data and send it to the appropriate WebSocket clients
function processAndSendData(port, receivedData) {
  console.log(`Received data on port ${port}:`, receivedData);
  sendToWebSocketClients(port, receivedData);
}

function sendToWebSocketClients(port, data) {
  wss[port].clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Set up WebSocket connections for each port
for (let i = 12345; i <= 12350; i++) {
  wss[i].on("connection", (ws) => {
    console.log(`WebSocket client connected on port ${i}`);
  });
}

// Handle POST requests using a dynamic route
app.post("/receiveData/:port", (req, res) => {
  const port = parseInt(req.params.port);
  const receivedData = req.body; // Assuming data is sent as JSON

  if (wss[port]) {
    processAndSendData(port, receivedData);
    res.json({ message: `Data received successfully on port ${port}` });
  } else {
    res
      .status(404)
      .json({ message: `WebSocket server for port ${port} not found` });
  }
});

// Create HTTP server
server.on("upgrade", (request, socket, head) => {
  const port = request.url.split("/").pop(); // Extract the port from the URL
  if (wss[port]) {
    wss[port].handleUpgrade(request, socket, head, (ws) => {
      wss[port].emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(port, () => {
  console.log(`Server and WebSocket servers are running on port ${port}`);
});
