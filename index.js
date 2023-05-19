const socket = require("socket.io");
const express = require("express");
const cors = require("cors");
const { print } = require('pdf-to-printer');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const os = require('os');

function getIPAddress() {
  const interfaces = os.networkInterfaces();
  let ipAddress;

  for (const networkInterface of Object.values(interfaces)) {
    const found = networkInterface.find(
      (details) => details.family === 'IPv4' && !details.internal
    );

    if (found) {
      ipAddress = found.address;
      break;
    }
  }

  return ipAddress;
}

const PORT = 8080;
const IP_ADDRESS = getIPAddress();

const server = app.listen(PORT, IP_ADDRESS, () => {
  console.log(`Server connected at PORT: ${PORT}`);
});

const io = socket(server);

io.sockets.on("connection", (socket) => {
  console.log("new connection id: ", socket.id);
  sendData(socket);
});

async function sendData(socket) {
  socket.on("print_data", async (data) => {
    try {
      await printPdfFromUrl(data);
      console.log('PDF printed successfully');
    } catch (error) {
      console.error('Error printing PDF:', error);
    }
  });
}

async function printPdfFromUrl(pdfUrl) {
  const printer = await print(pdfUrl);
  console.log('PDF printed on printer:', printer);
}
