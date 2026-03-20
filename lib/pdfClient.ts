"use client";

export async function generatePDF(match: any, innings: any[], balls: any[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();

  doc.text("Scorecard", 10, 10);

  autoTable(doc, {
    head: [["Player", "Runs"]],
    body: [["Demo", "100"]],
  });

  doc.save("scorecard.pdf");
}