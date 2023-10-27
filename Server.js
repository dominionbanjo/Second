const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();
const server = http.createServer(app);
const port = 8080;

const wss = new WebSocket.Server({ server });

app.use(express.json());

app.post("/receiveData", (req, res) => {
  const receivedData = req.body; // Assuming data is sent as JSON

  console.log("Received data from localhost server:", receivedData);
  sendToWebSocketClients(receivedData);
  res.json({ message: "Data received successfully" });
});

function sendToWebSocketClients(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Define the initial data here or replace it with your actual data
const initialData = {
  id: 0,
  time: 0,
  value1: 0,
  value2: 0,
  value3: 0,
};

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  // Send the initial data when a client connects
  ws.send(JSON.stringify(initialData));
});

server.listen(port, () => {
  console.log(`Server and WebSocket server are running on port ${port}`);
});
