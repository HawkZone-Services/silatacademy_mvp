import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadCertificateAsPDF = async () => {
  const input = document.getElementById("certificate");
  if (!input) return;

  const canvas = await html2canvas(input, { scale: 3 });
  const img = canvas.toDataURL("image/png");

  const pdf = new jsPDF("landscape", "px", [canvas.width, canvas.height]);
  pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save("certificate.pdf");
};
