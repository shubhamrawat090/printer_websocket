const socket = require("socket.io");
const express = require("express");
const cors = require("cors");
const { print } = require('pdf-to-printer');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = 8080;

const server = app.listen(PORT, () => {
  console.log(`Server connected at PORT: ${PORT}`);
});

const io = socket(server);

io.sockets.on("connection", (socket) => {
  console.log("new connection id: ", socket.id);
  sendData(socket);
});

function sendData(socket) {
  socket.on("print_data", (data) => {
    printPdfFromUrl(data);
  });
}

function printPdfFromUrl(pdfUrl) {
  print(pdfUrl)
    .then(() => {
      console.log('PDF printed successfully');
    })
    .catch((error) => {
      console.error('Error printing PDF:', error);
    });
}


