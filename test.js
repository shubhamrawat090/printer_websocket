const io = require("socket.io-client");
const fs = require("fs");
const { print, getPrinters, getDefaultPrinter } = require("pdf-to-printer");

const printPDF = async () => {
  try {
    const pdfUrl =
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    console.log("PDF Url: ", pdfUrl);
    // Download the PDF from pdfUrl
    const response = await fetch(pdfUrl);
    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    // Save the PDF to a temporary file
    const tempFilePath = "./temp.pdf";
    fs.writeFileSync(tempFilePath, pdfBuffer);

    const printers = await getPrinters();
    console.log("Printers: ", printers);

    const defaultPrinter = await getDefaultPrinter();
    console.log("Default Printer: ", defaultPrinter);

    // Print the PDF
    const options = {
      printer: "Microsoft Print to PDF",
      scale: "fit",
    };
    await print(tempFilePath, options);

    // Delete the temporary file
    fs.unlinkSync(tempFilePath);

    console.log("PDF printed successfully");
  } catch (error) {
    console.error("Failed to print PDF: ", error);
  }
};

printPDF();

// Just set an infinite loop because app was closing after completion.
// Have to test if it closes in websocket application also
setInterval(() => {}, 100);
