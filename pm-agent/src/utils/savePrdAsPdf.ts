import PDFDocument from 'pdfkit';
import fs from 'fs';

export function savePrdAsPdf(prd: any, filePath: string) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  // Title
  doc.fontSize(18).text(`📄 ${prd?.title || 'Untitled PRD'}`, { underline: true });
  doc.moveDown();
  console.log('[DEBUG] Full PRD object:', JSON.stringify(prd, null, 2));
let c = prd?.content;
  if (typeof c === 'string') {
    try {
      c = JSON.parse(c);
    } catch (e) {
      console.warn('[WARN] content is a string but not valid JSON');
      c = {};
    }
  }
  if (!c || typeof c !== 'object') {
    console.warn('[WARN] Invalid or missing PRD content.');
    c = {};
  }

  console.log('[DEBUG] Parsed PRD content overview:', c.overview);

 // const c = prd?.content || {};
 // console.log('[DEBUG] PRD content overview:', c.overview);

  // Overview
  const overviewText =
    typeof c.overview === 'string'
      ? c.overview
      : c.overview?.description || 'No overview provided';
  doc.fontSize(12).text(`Overview:\n${overviewText}\n`);

  // Problem Statement
  const problemText = c.problem_statement?.description || 'No problem statement provided';
  doc.moveDown().text(`Problem:\n${problemText}\n`);

  // Goals
  doc.moveDown().text(`Goals:`);
  (c.goals || []).forEach((g: any) =>
    doc.text(`• ${g?.description || g || 'Unnamed goal'}`)
  );

  // Requirements
  doc.moveDown().text(`Requirements:`);
  const functionalReqs = c.requirements?.functional || [];
  functionalReqs.forEach((r: any) =>
    doc.text(`- ${r?.description || r || 'Unnamed requirement'}`)
  );

  // Success Metrics
  doc.moveDown().text(`Success Metrics:`);
  (c.success_metrics || []).forEach((m: any) =>
    doc.text(`✓ ${m?.metric || m || 'Unnamed metric'} — Target: ${m?.target || 'TBD'}`)
  );

  doc.end();
}
