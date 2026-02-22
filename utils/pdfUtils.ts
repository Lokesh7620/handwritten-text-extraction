declare const jspdf: any;
declare const html2pdf: any;

export const generatePDF = (text: string, filename: string = 'scanned-document.pdf') => {
  // Create a temporary element to hold the text for PDF generation
  const element = document.createElement('div');
  element.style.padding = '40px';
  element.style.fontSize = '14px';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.whiteSpace = 'pre-wrap';
  element.style.lineHeight = '1.6';
  element.style.color = '#333';
  element.innerText = text;

  const opt = {
    margin: 10,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Run html2pdf
  html2pdf().set(opt).from(element).save();
};

export const generateWordDoc = (text: string, filename: string = 'scanned-document.doc') => {
  // A simple way to generate a file Word can open is an HTML blob or simple text with .doc extension
  const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
  const footer = "</body></html>";
  // Wrap text in pre-wrap to preserve newlines, and use a standard font
  const sourceHTML = header + `<div style="white-space: pre-wrap; font-family: Calibri, sans-serif; font-size: 11pt;">${text}</div>` + footer;

  const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);

  const link = document.createElement("a");
  document.body.appendChild(link);
  link.href = source;
  link.download = filename;
  link.click();
  document.body.removeChild(link);
};

export const generateTXT = (text: string, filename: string = 'scanned-document.txt') => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const generateMarkdown = (text: string, filename: string = 'scanned-document.md') => {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};