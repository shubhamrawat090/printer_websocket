const io = require("socket.io-client");
const axios = require("axios");
const fs = require("fs");
const { print } = require("pdf-to-printer");

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

    // Save the PDF to a temporary file
    const tempFilePath = "./temp.pdf";
    fs.writeFileSync(tempFilePath, pdfBuffer);

    // Print the PDF
    await print(tempFilePath);

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
