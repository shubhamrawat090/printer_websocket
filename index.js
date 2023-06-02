const io = require("socket.io-client");
const axios = require("axios");
const fs = require("fs");
const { print, getDefaultPrinter } = require("pdf-to-printer");

const socket = io("https://samasya.tech");

socket.on("connect", () => {
  console.log("Connected to backend socket");
  getDefaultPrinter().then(res => console.log("default printer: ", res))

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

    // For amazon labels -> resize the content a/c to label paper size
    if(pdfUrl.endsWith("amazon.pdf")) {
      // Print the PDF
      const options = {
        printer: "iDPRT SP410",
        scale: "fit",
        paperSize: `3.25"x5.83"(8.26cm x 14.81cm)`
      }
      await print(tempFilePath, options)
    } 
    // For other labels -> just print as it is
    else {
      await print(tempFilePath)
    }


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
