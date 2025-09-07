"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePrdAsPdf = savePrdAsPdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
function savePrdAsPdf(prd, filePath) {
    var _a, _b, _c;
    const doc = new pdfkit_1.default();
    doc.pipe(fs_1.default.createWriteStream(filePath));
    // Title
    doc.fontSize(18).text(`📄 ${(prd === null || prd === void 0 ? void 0 : prd.title) || 'Untitled PRD'}`, { underline: true });
    doc.moveDown();
    console.log('[DEBUG] Full PRD object:', JSON.stringify(prd, null, 2));
    let c = prd === null || prd === void 0 ? void 0 : prd.content;
    if (typeof c === 'string') {
        try {
            c = JSON.parse(c);
        }
        catch (e) {
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
    const overviewText = typeof c.overview === 'string'
        ? c.overview
        : ((_a = c.overview) === null || _a === void 0 ? void 0 : _a.description) || 'No overview provided';
    doc.fontSize(12).text(`Overview:\n${overviewText}\n`);
    // Problem Statement
    const problemText = ((_b = c.problem_statement) === null || _b === void 0 ? void 0 : _b.description) || 'No problem statement provided';
    doc.moveDown().text(`Problem:\n${problemText}\n`);
    // Goals
    doc.moveDown().text(`Goals:`);
    (c.goals || []).forEach((g) => doc.text(`• ${(g === null || g === void 0 ? void 0 : g.description) || g || 'Unnamed goal'}`));
    // Requirements
    doc.moveDown().text(`Requirements:`);
    const functionalReqs = ((_c = c.requirements) === null || _c === void 0 ? void 0 : _c.functional) || [];
    functionalReqs.forEach((r) => doc.text(`- ${(r === null || r === void 0 ? void 0 : r.description) || r || 'Unnamed requirement'}`));
    // Success Metrics
    doc.moveDown().text(`Success Metrics:`);
    (c.success_metrics || []).forEach((m) => doc.text(`✓ ${(m === null || m === void 0 ? void 0 : m.metric) || m || 'Unnamed metric'} — Target: ${(m === null || m === void 0 ? void 0 : m.target) || 'TBD'}`));
    doc.end();
}
