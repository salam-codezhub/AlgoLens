import PDFDocument from "pdfkit";
import type { DocumentationExport, ProjectDocumentation } from "./types.js";

export function generatePdf(documentation: ProjectDocumentation): Promise<Buffer> {
  return new Promise((resolve) => {
    const document = new PDFDocument();
    const chunks: Buffer[] = [];

    document.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    document.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    document.fontSize(22).text(documentation.title);
    document.moveDown();

    document.fontSize(16).text("Overview");
    document.fontSize(11).text(documentation.overview);
    document.moveDown();

    document.fontSize(16).text("Architecture");
    document.fontSize(11).text(documentation.architectureSummary);
    document.moveDown();

    document.fontSize(16).text("Functions");

    for (const functionDocumentation of documentation.functions) {
      document.fontSize(13).text(functionDocumentation.name);
      document.fontSize(11).text(functionDocumentation.description);
      document
        .fontSize(10)
        .text(
          `Parameters: ${
            functionDocumentation.parameters.length > 0
              ? functionDocumentation.parameters.join(", ")
              : "None"
          }`
        );
      document.fontSize(10).text(`Returns: ${functionDocumentation.returns}`);
      document.moveDown();
    }

    document.fontSize(16).text("Classes");

    for (const classDocumentation of documentation.classes) {
      document.fontSize(13).text(classDocumentation.name);
      document.fontSize(11).text(classDocumentation.description);
      document
        .fontSize(10)
        .text(
          `Methods: ${
            classDocumentation.methods.length > 0 ? classDocumentation.methods.join(", ") : "None"
          }`
        );
      document.moveDown();
    }

    document.fontSize(16).text("Analysis Reports");

    for (const report of documentation.reports) {
      document.fontSize(13).text(report.title);
      document.fontSize(11).text(report.content);
      document.moveDown();
    }

    document.end();
  });
}

export async function createPdfExport(
  documentation: ProjectDocumentation
): Promise<DocumentationExport> {
  const pdf = await generatePdf(documentation);

  return {
    format: "pdf",
    content: pdf.toString("base64"),
    fileExtension: ".pdf",
  };
}
