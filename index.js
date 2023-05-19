const socket = require("socket.io");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const PDFParser = require('pdf2json');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = 8080;

const server = app.listen(PORT, () => {
    console.log(`Server connected at PORT: ${PORT}`);
});

const io = socket(server);

io.sockets.on('connection', (socket) => {
    console.log("new connection id: ", socket.id);
    sendData(socket);
});

function sendData(socket) {
    socket.on("print_data", data => {
        printPdfFromUrl(data);
    });
}

function printPdfFromUrl(pdfUrl) {
  console.log('URL RECEIVED:', pdfUrl);

  fetch(pdfUrl)
    .then((response) => response.buffer())
    .then((buffer) => {
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        const numPages = pdfData.numPages;

        const getPageText = (pageNumber) => {
          return new Promise((resolve) => {
            pdfParser.parsePage(pageNumber);
            pdfParser.on('pdfParser_dataReady', (pageData) => {
              resolve(pageData);
            });
          });
        };

        const promises = [];
        for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
          promises.push(getPageText(pageNumber));
        }

        Promise.all(promises)
          .then((pageDataList) => {
            // Concatenate or process page data as needed
            const pdfData = pageDataList
              .map((pageData) => pageData.ParsedText)
              .join(' ');

            // Here, you can send the `pdfData` to the printer
            // using a platform-specific method or package.
            console.log('Printing PDF:', pdfData);
          })
          .catch((error) => {
            console.error('Error printing PDF:', error);
          });
      });

      pdfParser.parseBuffer(buffer);
    })
    .catch((error) => {
      console.error('Error fetching PDF:', error);
    });
}





