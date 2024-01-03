const io = require("socket.io-client");
const axios = require("axios");
const fs = require("fs");
const { print } = require("pdf-to-printer");
const { PDFDocument, degrees } = require("pdf-lib");

const socket = io("https://samasya.tech");

socket.on("connect", () => {
  console.log("Connected to backend socket");

  // Join the "printer_system" room
  socket.emit("printer_socket_room", "printer_system");
});

socket.on("get_printer_system", async (pdfUrl) => {
  try {
    console.log("PDF Url: ", pdfUrl);
    // Download the PDF from pdfUrl
    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
    const pdfBuffer = response.data;

    // Create a PDF document from the downloaded buffer
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Rotate all pages in the document by 180 degrees
    const pages = pdfDoc.getPages();
    pages.forEach((page) => {
      page.setRotation(degrees(180));
    });

    // Save the rotated PDF to a temporary file
    const tempFilePath = "./temp.pdf";
    const modifiedPdfBuffer = await pdfDoc.save();
    fs.writeFileSync(tempFilePath, modifiedPdfBuffer);

    // Print the PDF
    const options = {
      printer: "iDPRT SP410",
      scale: "fit",
      paperSize: `4.00"x6.00"(10.16cm x 15.24cm)`
    }
    await print(tempFilePath, options)

    // Delete the temporary file
    fs.unlinkSync(tempFilePath);

    console.log("PDF printed successfully");
  } catch (error) {
    console.error("Failed to print PDF: ", error);
  }
});

socket.on("disconnect", () => {
  console.log("Disconnected from backend socket");
});
