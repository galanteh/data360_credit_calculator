import jsPDF from 'jspdf';
import { CalculationResult, FormData } from '../types';

const SF_BLUE = [0, 112, 210] as const;
const SF_NAVY = [3, 45, 96] as const;
const SF_NAVY_DARK = [11, 33, 65] as const;
const SF_GREEN = [75, 202, 129] as const;
const SF_ORANGE = [255, 183, 93] as const;
const WHITE = [255, 255, 255] as const;
const GRAY_LIGHT = [243, 246, 251] as const;
const GRAY_MID = [216, 221, 230] as const;
const GRAY_DARK = [100, 100, 100] as const;
const BLACK = [26, 26, 26] as const;

type RGB = readonly [number, number, number];

const fmt = (n: number) => new Intl.NumberFormat('es-MX').format(Math.round(n));
const fmtMoney = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(n);

function setFill(doc: jsPDF, rgb: RGB) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}
function setDraw(doc: jsPDF, rgb: RGB) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}
function setFont(doc: jsPDF, rgb: RGB) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

// Draw a horizontal gradient rect by layering thin slices
function gradientRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  from: RGB,
  to: RGB,
  steps = 60
) {
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = Math.round(from[0] + (to[0] - from[0]) * t);
    const g = Math.round(from[1] + (to[1] - from[1]) * t);
    const b = Math.round(from[2] + (to[2] - from[2]) * t);
    doc.setFillColor(r, g, b);
    doc.rect(x + (w / steps) * i, y, w / steps + 0.5, h, 'F');
  }
}

const MATURITY_COLORS: Record<number, RGB> = {
  1: [255, 93, 93],
  2: [255, 183, 93],
  3: [0, 112, 210],
  4: [75, 202, 129],
};

// Convert the official logo SVG (served from /images/logo.svg) to a PNG data URL
// by drawing it onto an offscreen canvas. Returns null if loading fails.
async function loadOfficialLogoPng(size = 240): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    // Append cache-buster so the browser actually loads it
    img.src = '/images/logo.svg';
  });
}

export async function generatePDF(result: CalculationResult, form: FormData): Promise<void> {
  // Pre-load official logo as PNG (required by jsPDF addImage)
  const officialLogoPng = await loadOfficialLogoPng(240);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 18;
  const contentW = pageW - margin * 2;
  const today = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ════════════════════════════════════════════════════════════════
  // PAGE 1 – Executive Cover
  // ════════════════════════════════════════════════════════════════

  // Header gradient band
  gradientRect(doc, 0, 0, pageW, 72, SF_NAVY_DARK, SF_BLUE);

  // Official Data 360 logo — top-left of gradient band (white background pill)
  if (officialLogoPng) {
    try {
      // Draw white pill background behind the logo for contrast on dark gradient
      setFill(doc, WHITE);
      doc.roundedRect(margin, 8, 26, 14, 2, 2, 'F');
      // Logo is a 1:1 square (480×480 viewBox) → 14mm × 14mm, centered in the pill
      doc.addImage(officialLogoPng, 'PNG', margin + 1, 9, 24, 12, undefined, 'FAST');
    } catch {
      // fallback text if canvas/image conversion failed
      setFont(doc, WHITE);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SALESFORCE DATA 360', margin, 18);
    }
  } else {
    setFont(doc, WHITE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('SALESFORCE DATA 360', margin, 18);
  }

  // Main title
  setFont(doc, WHITE);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Data 360 Credit', margin, 38);
  doc.text('Calculator', margin, 47);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setFont(doc, [180, 210, 240]);
  doc.text('Estimación de Consumo Anual de Créditos', margin, 55);

  // Maturity badge on header
  const mColor = MATURITY_COLORS[result.maturityLevel];
  setFill(doc, [255, 255, 255]);
  doc.roundedRect(pageW - margin - 52, 8, 52, 58, 4, 4, 'F');
  setFont(doc, SF_NAVY);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('MADUREZ DIGITAL', pageW - margin - 26, 17, { align: 'center' });
  setFont(doc, mColor);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text(String(result.maturityScore), pageW - margin - 26, 38, { align: 'center' });
  setFont(doc, GRAY_DARK);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('/100', pageW - margin - 26, 44, { align: 'center' });

  // Level pill
  setFill(doc, mColor);
  doc.roundedRect(pageW - margin - 48, 50, 44, 10, 2, 2, 'F');
  setFont(doc, WHITE);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(`Nivel ${result.maturityLevel}: ${result.maturityLabel}`, pageW - margin - 26, 56.5, {
    align: 'center',
    maxWidth: 42,
  });

  // Account info band
  setFill(doc, GRAY_LIGHT);
  doc.rect(0, 72, pageW, 28, 'F');

  // If client uploaded a logo, show it in the account band (right-aligned)
  if (form.logoBase64) {
    try {
      const fmtMatch = form.logoBase64.match(/^data:image\/(\w+);base64,/);
      const fmt2 = fmtMatch ? fmtMatch[1].toUpperCase() : 'PNG';
      const sf2 = ['PNG', 'JPEG', 'JPG', 'WEBP'].includes(fmt2) ? fmt2 : 'PNG';
      doc.addImage(form.logoBase64, sf2, pageW - margin - 36, 74, 0, 20, undefined, 'FAST');
    } catch { /* ignore */ }
  }

  setFont(doc, SF_NAVY);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(form.accountName || 'Sin nombre', margin, 84);
  setFont(doc, GRAY_DARK);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (form.contactName) doc.text(form.contactName, margin, 91);
  doc.text(today, margin, form.contactName ? 96 : 91);

  // Edition badge
  const editionLabel =
    form.edition === 'flex'
      ? 'Data Cloud Flex'
      : form.edition === 'profiles'
      ? 'Data Cloud Profiles'
      : 'Data Cloud Enterprise';
  setFill(doc, SF_BLUE);
  doc.roundedRect(pageW - margin - 52, 77, 52, 10, 2, 2, 'F');
  setFont(doc, WHITE);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(editionLabel, pageW - margin - 26, 83, { align: 'center' });

  // ── Executive Summary ──
  let y = 110;
  setFont(doc, SF_NAVY);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Ejecutivo', margin, y);

  setDraw(doc, SF_BLUE);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, margin + 40, y + 2);

  y += 10;
  setFont(doc, BLACK);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const summaryText = `Basado en los parámetros ingresados para ${form.accountName || 'la organización'}, Salesforce Data 360 requerirá una estimación de ${fmt(result.totalCredits)} créditos anuales, equivalentes a ${result.dscSkus} SKU(s) de Data Services Credits (DSC). El desglose principal incluye: Ingesta ${fmt(result.ingestionCredits)} créditos, Unificación de Identidad ${fmt(result.unificationCredits)} créditos, Segmentación ${fmt(result.segmentationCredits)} créditos y Streaming ${fmt(result.streamingCredits)} créditos. La organización se posiciona en el Nivel ${result.maturityLevel} de madurez digital ("${result.maturityLabel}") con una puntuación de ${result.maturityScore}/100. El beneficio económico anual estimado es de ${fmtMoney(result.totalAnnualBenefit)}.`;
  const summaryLines = doc.splitTextToSize(summaryText, contentW);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 6;

  // ── Top KPI Cards ──
  const kpiData = [
    { label: 'Créditos Totales/Año', value: fmt(result.totalCredits), color: SF_BLUE },
    { label: 'DSC SKUs', value: String(result.dscSkus), color: SF_GREEN },
    { label: 'Créditos Ingesta', value: fmt(result.ingestionCredits), color: SF_ORANGE },
    { label: 'Créditos Streaming', value: fmt(result.streamingCredits), color: [255, 93, 93] as RGB },
  ];
  const kpiW = (contentW - 12) / 4;
  kpiData.forEach((kpi, i) => {
    const kx = margin + i * (kpiW + 4);
    setFill(doc, WHITE);
    setDraw(doc, GRAY_MID);
    doc.setLineWidth(0.3);
    doc.roundedRect(kx, y, kpiW, 24, 2, 2, 'FD');
    // Top accent
    setFill(doc, kpi.color);
    doc.roundedRect(kx, y, kpiW, 2, 1, 1, 'F');
    setFont(doc, GRAY_DARK);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    const labelLines = doc.splitTextToSize(kpi.label, kpiW - 4);
    doc.text(labelLines, kx + kpiW / 2, y + 8, { align: 'center' });
    setFont(doc, kpi.color);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.value, kx + kpiW / 2, y + 18, { align: 'center' });
  });
  y += 32;

  // ── ROI Section ──
  setFont(doc, SF_NAVY);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Beneficio Económico Estimado', margin, y);
  setDraw(doc, SF_BLUE);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, margin + 60, y + 2);
  y += 10;

  const roiItems = [
    { label: 'Ahorro en Ingeniería / Datos', value: fmtMoney(result.engineeringValueSaved), color: SF_GREEN, sub: `${fmt(result.engineeringHoursSaved)} horas/año` },
    { label: 'Reducción Media Waste', value: fmtMoney(result.mediaWasteReduction), color: SF_BLUE, sub: result.mediaWasteReduction > 0 ? 'Canal Paid Media activo' : 'Sin Paid Media' },
    { label: 'Uplift de Conversión', value: fmtMoney(result.conversionUplift), color: SF_ORANGE, sub: '+2.5% en campañas activadas' },
    { label: 'Beneficio Anual Total', value: fmtMoney(result.totalAnnualBenefit), color: SF_NAVY, sub: 'Estimación conservadora', bold: true },
  ];

  roiItems.forEach((item, i) => {
    const isLast = i === roiItems.length - 1;
    if (isLast) {
      setFill(doc, SF_NAVY);
      doc.roundedRect(margin, y, contentW, 18, 2, 2, 'F');
      setFont(doc, WHITE);
    } else {
      setFill(doc, GRAY_LIGHT);
      doc.roundedRect(margin, y, contentW, 14, 2, 2, 'F');
    }
    // Color accent bar
    if (!isLast) {
      setFill(doc, item.color);
      doc.roundedRect(margin, y, 3, 14, 1, 1, 'F');
    }

    const textColor = isLast ? WHITE : BLACK;
    setFont(doc, textColor);
    doc.setFontSize(isLast ? 9 : 8.5);
    doc.setFont('helvetica', isLast ? 'bold' : 'normal');
    doc.text(item.label, margin + (isLast ? 6 : 8), y + (isLast ? 7 : 6));

    setFont(doc, isLast ? WHITE : item.color);
    doc.setFontSize(isLast ? 11 : 9);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, pageW - margin, y + (isLast ? 7 : 6), { align: 'right' });

    if (!isLast) {
      setFont(doc, GRAY_DARK);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(item.sub, margin + 8, y + 11);
    }

    y += isLast ? 22 : 17;
  });

  // ── Maturity breakdown ──
  y += 4;
  if (y < pageH - 50) {
    setFont(doc, SF_NAVY);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Puntuación de Madurez Digital', margin, y);
    setDraw(doc, SF_BLUE);
    doc.line(margin, y + 2, margin + 65, y + 2);
    y += 10;

    const matDims = [
      { label: 'Streaming', score: Math.min(100, ((form.streamEngPercent + form.streamProfPercent) / 2) * 0.5), max: 25 },
      { label: 'Identidad', score: form.identityFragmentation >= 3 ? 20 : form.identityFragmentation === 2 ? 12 : 5, max: 20 },
      { label: 'Segmentación', score: form.segmentCreationTime === 'lt4h' ? 25 : form.segmentCreationTime === '1-2d' ? 15 : form.segmentCreationTime === '1w' ? 8 : 3, max: 25 },
      { label: 'Analítica', score: Math.min(20, (form.calcInsightsDay / 15) * 20), max: 20 },
      { label: 'Canales', score: Math.min(10, form.channels.length * 2.5), max: 10 },
    ];

    matDims.forEach((dim) => {
      setFont(doc, BLACK);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(dim.label, margin, y + 3.5);

      // Bar background
      const barX = margin + 35;
      const barW = contentW - 50;
      setFill(doc, GRAY_MID);
      doc.roundedRect(barX, y, barW, 4, 1, 1, 'F');
      // Bar fill
      setFill(doc, SF_BLUE);
      const fillW = Math.max(2, (dim.score / dim.max) * barW);
      doc.roundedRect(barX, y, fillW, 4, 1, 1, 'F');

      setFont(doc, GRAY_DARK);
      doc.setFontSize(7);
      doc.text(`${Math.round(dim.score)}/${dim.max}`, barX + barW + 2, y + 3.5);
      y += 8;
    });
  }

  // Footer page 1
  setFont(doc, GRAY_DARK);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('Página 1 de 2', pageW / 2, pageH - 8, { align: 'center' });
  setFont(doc, GRAY_DARK);
  doc.setFontSize(6.5);
  doc.text('Salesforce Data Cloud © 2025 — Estimación preliminar sujeta a validación técnica', pageW / 2, pageH - 4, { align: 'center' });

  // ════════════════════════════════════════════════════════════════
  // PAGE 2 – Technical Details
  // ════════════════════════════════════════════════════════════════
  doc.addPage();

  // Header band — page 2
  setFill(doc, SF_NAVY);
  doc.rect(0, 0, pageW, 22, 'F');

  // Official logo on page 2 (small, left side — same white pill approach)
  if (officialLogoPng) {
    try {
      setFill(doc, WHITE);
      doc.roundedRect(margin, 3, 18, 16, 2, 2, 'F');
      doc.addImage(officialLogoPng, 'PNG', margin + 1, 4, 16, 14, undefined, 'FAST');
    } catch { /* ignore */ }
  }

  setFont(doc, WHITE);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  const p2TitleX = officialLogoPng ? margin + 22 : margin;
  doc.text('Detalle Técnico de Créditos', p2TitleX, 14);
  setFont(doc, [150, 190, 240]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${form.accountName || ''} — ${today}`, pageW - margin, 14, { align: 'right' });

  y = 32;

  // ── Credit Table ──
  setFont(doc, SF_NAVY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Desglose de Créditos por Categoría', margin, y);
  setDraw(doc, SF_BLUE);
  doc.line(margin, y + 2, margin + 80, y + 2);
  y += 8;

  // Table header
  setFill(doc, SF_NAVY);
  doc.rect(margin, y, contentW, 8, 'F');
  setFont(doc, WHITE);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const cols = [
    { label: 'Categoría', x: margin + 2, align: 'left' as const },
    { label: 'Volumen (registros)', x: margin + contentW * 0.48, align: 'right' as const },
    { label: 'Créditos', x: margin + contentW * 0.72, align: 'right' as const },
    { label: '% Total', x: margin + contentW, align: 'right' as const },
  ];
  cols.forEach((col) => doc.text(col.label, col.x, y + 5.5, { align: col.align }));
  y += 8;

  const creditRows = [
    { cat: 'Batch Pipeline', vol: result.batchPipelineVol, cred: result.batchPipelineCredits },
    { cat: 'Transform', vol: result.transformVol, cred: result.transformCredits },
    { cat: 'Stream Engagement', vol: result.streamEngVol, cred: result.streamEngCredits },
    { cat: 'Stream Profiles', vol: result.streamProfVol, cred: result.streamProfCredits },
    { cat: 'Stream Transform', vol: result.streamTransformVol, cred: result.streamTransformCredits },
    { cat: 'Unificación / Identity Resolution', vol: result.unificationVol, cred: result.unificationCredits },
    { cat: 'Calculated Insights', vol: result.calcInsightsVol, cred: result.calcInsightsCredits },
    { cat: 'Queries / Data Explorer', vol: result.queryVol, cred: result.queryCredits },
    { cat: 'Segmentación', vol: result.segmentationVol, cred: result.segmentationCredits },
    { cat: 'Activación', vol: result.activationVol, cred: result.activationCredits },
    { cat: 'Data Graphs', vol: 2, cred: result.dataGraphsCredits },
  ];

  creditRows.forEach((row, i) => {
    const bgColor: RGB = i % 2 === 0 ? GRAY_LIGHT : WHITE;
    setFill(doc, bgColor);
    doc.rect(margin, y, contentW, 8, 'F');

    setFont(doc, BLACK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(row.cat, margin + 2, y + 5.5);

    setFont(doc, GRAY_DARK);
    doc.text(fmt(row.vol), margin + contentW * 0.48, y + 5.5, { align: 'right' });

    setFont(doc, SF_NAVY);
    doc.setFont('helvetica', 'bold');
    doc.text(fmt(row.cred), margin + contentW * 0.72, y + 5.5, { align: 'right' });

    setFont(doc, GRAY_DARK);
    doc.setFont('helvetica', 'normal');
    const pct = result.totalCredits > 0 ? ((row.cred / result.totalCredits) * 100).toFixed(1) : '0.0';
    doc.text(`${pct}%`, margin + contentW, y + 5.5, { align: 'right' });

    y += 8;
  });

  // Total row
  setFill(doc, SF_BLUE);
  doc.rect(margin, y, contentW, 9, 'F');
  setFont(doc, WHITE);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL CRÉDITOS / AÑO', margin + 2, y + 6);
  doc.text(fmt(result.totalCredits), margin + contentW * 0.72, y + 6, { align: 'right' });
  doc.text('100%', margin + contentW, y + 6, { align: 'right' });

  y += 16;

  // Edition note
  setFill(doc, GRAY_LIGHT);
  setDraw(doc, SF_BLUE);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 12, 2, 2, 'FD');
  setFont(doc, SF_NAVY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Edición: ${form.edition.toUpperCase()}`, margin + 4, y + 5);
  setFont(doc, GRAY_DARK);
  doc.setFont('helvetica', 'normal');
  const discountText =
    form.edition === 'profiles'
      ? 'Descuento del 15% aplicado a créditos de ingesta y streaming.'
      : form.edition === 'enterprise'
      ? 'Descuento del 30% aplicado a créditos de ingesta y streaming.'
      : 'Sin descuento aplicado. Precio estándar por crédito.';
  doc.text(discountText, margin + 40, y + 5);
  doc.text(`DSC SKUs recomendados: ${result.dscSkus} (×100,000 créditos/SKU)`, margin + 4, y + 10);
  y += 20;

  // ── Input Parameters Summary ──
  setFont(doc, SF_NAVY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Parámetros de Entrada Utilizados', margin, y);
  setDraw(doc, SF_BLUE);
  doc.line(margin, y + 2, margin + 75, y + 2);
  y += 10;

  const params = [
    ['Industria', form.industry],
    ['Perfiles Unificados (N)', fmt(form.profiles)],
    ['Registros de Engagement', fmt(form.engagement)],
    ['% Stream Engagement', `${form.streamEngPercent}%`],
    ['% Stream Perfiles', `${form.streamProfPercent}%`],
    ['Fragmentación Identidad', `Nivel ${form.identityFragmentation}`],
    ['Tiempo de Segmentación', form.segmentCreationTime],
    ['Segmentos Activos', String(form.segments)],
    ['Calc Insights / Día', String(form.calcInsightsDay)],
    ['Queries / Día', String(form.queriesDay)],
    ['Canales Activos', form.channels.length > 0 ? form.channels.join(', ') : 'Ninguno'],
    ['Activaciones / Año', String(form.activationsYr)],
  ];

  const halfLen = Math.ceil(params.length / 2);
  params.forEach((p, i) => {
    const col = i < halfLen ? 0 : 1;
    const row = i < halfLen ? i : i - halfLen;
    const px = margin + col * (contentW / 2 + 2);
    const py = y + row * 8;

    setFill(doc, i % 2 === 0 ? GRAY_LIGHT : WHITE);
    doc.rect(px, py, contentW / 2 - 2, 7, 'F');

    setFont(doc, GRAY_DARK);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(p[0], px + 2, py + 5);

    setFont(doc, SF_NAVY);
    doc.setFont('helvetica', 'bold');
    doc.text(String(p[1]), px + contentW / 2 - 4, py + 5, { align: 'right' });
  });

  y += halfLen * 8 + 12;

  // ── Disclaimer ──
  if (y > pageH - 40) y = pageH - 40;
  setFill(doc, [255, 248, 231]);
  setDraw(doc, [255, 190, 50]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentW, 22, 2, 2, 'FD');
  setFont(doc, [100, 70, 0]);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Aviso Legal / Disclaimer', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const disclaimerText =
    'Estimación preliminar generada automáticamente con base en parámetros ingresados. Los resultados reales pueden variar significativamente según la arquitectura, calidad de datos y configuración específica. Esta herramienta no reemplaza un análisis técnico formal. Se recomienda validar con el equipo de Solution Engineering de Salesforce antes de presentar propuestas formales o contratos.';
  const discLines = doc.splitTextToSize(disclaimerText, contentW - 8);
  doc.text(discLines, margin + 4, y + 12);

  // Footer page 2
  setFont(doc, GRAY_DARK);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('Página 2 de 2', pageW / 2, pageH - 8, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('Salesforce Data Cloud © 2025 — Estimación preliminar sujeta a validación técnica', pageW / 2, pageH - 4, { align: 'center' });

  // Save
  const fileName = `DataCloud_ROI_${(form.accountName || 'Estimacion').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Component export (unused directly — just for import side effects)
export default function PDFExport() {
  return null;
}
