import { MLRecommendation } from '../types/packaging';
import {
  UnitSystem,
  formatOTR,
  formatWVTR,
  formatThickness,
  formatTemperature,
  formatStrength,
} from './unitConversion';

/**
 * Clean string for CSV escaping
 */
function escapeCSV(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports the complete ML recommendation, sustainability metrics, and alternatives to CSV format.
 */
export function exportRecommendationToCSV(
  rec: MLRecommendation,
  unitSystem: UnitSystem = 'metric'
): void {
  const otrFormatted = formatOTR(rec.OTR_cc_m2_day, unitSystem);
  const wvtrFormatted = formatWVTR(rec.WVTR_g_m2_day, unitSystem);
  const thickFormatted = formatThickness(rec.film_thickness_micron, unitSystem);
  const tempFormatted = formatTemperature(rec.seal_temperature_C, unitSystem);
  const strengthFormatted = formatStrength(rec.mechanical_strength_MPa, unitSystem);

  const rows: string[][] = [
    ['PACKWISE AI - PACKAGING SPECIFICATION & DECISION REPORT'],
    ['Report ID', rec.id],
    ['Generated At', new Date(rec.timestamp).toLocaleString()],
    ['Unit Standard', unitSystem === 'imperial' ? 'Imperial (US Standard)' : 'Metric (SI Standard)'],
    ['Commodity Name', rec.commodityName],
    ['Food Category', rec.category],
    [],
    ['=== PHYSIOLOGICAL PROPERTIES & STORAGE CONDITIONS ==='],
    ['Moisture Content (%)', String(rec.inputConditions.moisture_percent)],
    ['pH Level', String(rec.inputConditions.pH)],
    ['Fat Content (%)', String(rec.inputConditions.fat_percent)],
    ['Respiration Rate', rec.inputConditions.respiration_rate],
    ['Respiration Rate (mg CO2/kg/hr)', String(rec.inputConditions.respiration_mg_CO2_kg_hr)],
    ['Storage Temperature', `${formatTemperature(rec.inputConditions.storage_temperature_C, unitSystem).value} ${formatTemperature(rec.inputConditions.storage_temperature_C, unitSystem).unitStr}`],
    ['Relative Humidity (% RH)', String(rec.inputConditions.relative_humidity_percent)],
    ['Storage Environment', rec.inputConditions.storage_type],
    ['Desired Shelf Life (Days)', String(rec.inputConditions.desired_shelf_life_days)],
    ['Transit Duration (Days)', String(rec.inputConditions.transportation_duration_days)],
    [],
    ['=== PRIMARY ML RECOMMENDED PACKAGING SPECIFICATION ==='],
    ['Recommended Material', rec.recommended_material],
    ['Layer Structure', rec.packaging_structure],
    [`Film Thickness (${thickFormatted.unitStr})`, thickFormatted.value],
    [`Oxygen Transmission Rate (${otrFormatted.unitStr})`, otrFormatted.value],
    [`Water Vapor Transmission Rate (${wvtrFormatted.unitStr})`, wvtrFormatted.value],
    ['Sealability Class', rec.sealability],
    [`Recommended Seal Temperature (${tempFormatted.unitStr})`, tempFormatted.value],
    [`Tensile Mechanical Strength (${strengthFormatted.unitStr})`, strengthFormatted.value],
    ['Seal Strength (N / 15mm)', String(rec.seal_strength_N_per_15mm)],
    ['MAP Suitability', rec.MAP_suitability],
    ['Recommended Gas Mix O2 (%)', String(rec.recommended_MAP_O2_percent)],
    ['Recommended Gas Mix CO2 (%)', String(rec.recommended_MAP_CO2_percent)],
    ['Predicted Shelf Life (Days)', String(rec.predicted_shelf_life_days)],
    ['ML Confidence Score (%)', `${rec.confidence_score}% (${rec.confidence_level})`],
    [],
    ['=== SUSTAINABILITY & FOOD WASTE REDUCTION METRICS ==='],
    ['Packaging Environmental Score (0-100)', String(rec.packaging_environmental_score)],
    ['Estimated Carbon Footprint (kg CO2e)', String(rec.carbon_footprint_estimate_kgCO2e)],
    ['Food Waste Risk (%)', String(rec.food_waste_risk_percent)],
    [],
    ['=== 3-WAY COMPARATIVE ALTERNATIVES MATRIX ==='],
    ['Alternative Option', 'Material', 'Layer Structure', `OTR (${otrFormatted.unitStr})`, `WVTR (${wvtrFormatted.unitStr})`, 'Shelf Life (Days)', 'Cost / 1k Packs ($)', 'Sustainability Score', 'Waste Risk (%)'],
    [
      'Recommended Match',
      rec.alternatives.recommended.material,
      rec.alternatives.recommended.structure,
      formatOTR(rec.alternatives.recommended.OTR_cc_m2_day, unitSystem).value,
      formatWVTR(rec.alternatives.recommended.WVTR_g_m2_day, unitSystem).value,
      String(rec.alternatives.recommended.predicted_shelf_life_days),
      String(rec.alternatives.recommended.cost_per_1k_packs),
      String(rec.alternatives.recommended.sustainability_score),
      String(rec.alternatives.recommended.food_waste_risk_percent),
    ],
    [
      'Lower-Cost Option',
      rec.alternatives.lower_cost.material,
      rec.alternatives.lower_cost.structure,
      formatOTR(rec.alternatives.lower_cost.OTR_cc_m2_day, unitSystem).value,
      formatWVTR(rec.alternatives.lower_cost.WVTR_g_m2_day, unitSystem).value,
      String(rec.alternatives.lower_cost.predicted_shelf_life_days),
      String(rec.alternatives.lower_cost.cost_per_1k_packs),
      String(rec.alternatives.lower_cost.sustainability_score),
      String(rec.alternatives.lower_cost.food_waste_risk_percent),
    ],
    [
      'Eco-Friendly Option',
      rec.alternatives.eco_friendly.material,
      rec.alternatives.eco_friendly.structure,
      formatOTR(rec.alternatives.eco_friendly.OTR_cc_m2_day, unitSystem).value,
      formatWVTR(rec.alternatives.eco_friendly.WVTR_g_m2_day, unitSystem).value,
      String(rec.alternatives.eco_friendly.predicted_shelf_life_days),
      String(rec.alternatives.eco_friendly.cost_per_1k_packs),
      String(rec.alternatives.eco_friendly.sustainability_score),
      String(rec.alternatives.eco_friendly.food_waste_risk_percent),
    ],
    [],
    ['=== EXPLAINABLE AI REASONING & FEATURE IMPORTANCE ==='],
    ['Technical Summary', rec.technical_explanation],
    ['MSME Farmer Summary', rec.msme_simple_explanation],
    [],
    ['Key Contributing Drivers', 'Direction', 'Engineering Impact', 'Weight (%)'],
    ...rec.top_contributing_factors.map((f) => [
      f.factor,
      f.direction,
      f.impactDescription,
      String(f.weight),
    ]),
  ];

  const csvContent = '\uFEFF' + rows.map((row) => row.map(escapeCSV).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const cleanName = rec.commodityName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `PackWise_Report_${cleanName}_${unitSystem}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a print-optimized, high-resolution engineering report dialog for PDF generation.
 */
export function exportRecommendationToPDF(
  rec: MLRecommendation,
  isMsmeMode: boolean = false,
  unitSystem: UnitSystem = 'metric'
): void {
  const dateFormatted = new Date(rec.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const otrFormatted = formatOTR(rec.OTR_cc_m2_day, unitSystem);
  const wvtrFormatted = formatWVTR(rec.WVTR_g_m2_day, unitSystem);
  const thickFormatted = formatThickness(rec.film_thickness_micron, unitSystem);
  const tempFormatted = formatTemperature(rec.seal_temperature_C, unitSystem);
  const storageTempFormatted = formatTemperature(rec.inputConditions.storage_temperature_C, unitSystem);

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>PackWise AI Specification Report - ${rec.commodityName}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          line-height: 1.5;
          margin: 0;
          padding: 10px;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #047857;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .brand {
          font-size: 22px;
          font-weight: 900;
          color: #065f46;
          letter-spacing: -0.5px;
        }
        .subbrand {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
        }
        .meta-box {
          text-align: right;
          font-size: 11px;
          color: #475569;
        }
        .title-block {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 16px;
        }
        .commodity-title {
          font-size: 20px;
          font-weight: 800;
          color: #064e3b;
          margin: 0;
        }
        .section-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          color: #0f172a;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
          margin-top: 18px;
          margin-bottom: 10px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 12px;
        }
        .card-label {
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
        }
        .card-val {
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 6px 8px;
          text-align: left;
        }
        th {
          background: #f1f5f9;
          font-weight: 700;
          color: #334155;
        }
        .highlight-row {
          background: #ecfdf5;
          font-weight: 700;
        }
        .badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          background: #d1fae5;
          color: #065f46;
        }
        .footer {
          margin-top: 24px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          font-size: 10px;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">PackWise AI</div>
          <div class="subbrand">Intelligent Food Packaging Decision System • Enterprise Edition</div>
        </div>
        <div class="meta-box">
          <div><strong>Report ID:</strong> ${rec.id.slice(0, 16)}</div>
          <div><strong>Date:</strong> ${dateFormatted}</div>
          <div><strong>Standard:</strong> ${unitSystem === 'imperial' ? 'Imperial (US Units)' : 'Metric (SI Units)'}</div>
          <div><strong>Confidence:</strong> ${rec.confidence_score}% (${rec.confidence_level})</div>
        </div>
      </div>

      <div class="title-block">
        <div class="card-label">Recommended Packaging Dossier</div>
        <h1 class="commodity-title">${rec.commodityName} (${rec.category})</h1>
        <div style="font-size: 12px; color: #065f46; margin-top: 4px; font-weight: 600;">
          Prescribed Material: ${rec.recommended_material}
        </div>
      </div>

      <div class="section-title">1. Recommended Technical Specifications</div>
      <div class="grid-3">
        <div class="card">
          <div class="card-label">Film Architecture</div>
          <div class="card-val" style="font-size: 11px;">${rec.packaging_structure}</div>
        </div>
        <div class="card">
          <div class="card-label">Thickness</div>
          <div class="card-val">${thickFormatted.value} ${thickFormatted.unitStr}</div>
        </div>
        <div class="card">
          <div class="card-label">Predicted Shelf Life</div>
          <div class="card-val" style="color: #047857;">~${rec.predicted_shelf_life_days} Days</div>
        </div>
        <div class="card">
          <div class="card-label">Oxygen Barrier (OTR)</div>
          <div class="card-val">${otrFormatted.value} <span style="font-size: 9px; font-weight: normal;">${otrFormatted.unitStr}</span></div>
        </div>
        <div class="card">
          <div class="card-label">Moisture Barrier (WVTR)</div>
          <div class="card-val">${wvtrFormatted.value} <span style="font-size: 9px; font-weight: normal;">${wvtrFormatted.unitStr}</span></div>
        </div>
        <div class="card">
          <div class="card-label">Sealing Window</div>
          <div class="card-val">${tempFormatted.value}${tempFormatted.unitStr} (${rec.sealability})</div>
        </div>
      </div>

      <div class="section-title">2. Environmental Sustainability & Spoilage Prevention</div>
      <div class="grid-3">
        <div class="card">
          <div class="card-label">Sustainability Score</div>
          <div class="card-val" style="color: #047857;">${rec.packaging_environmental_score} / 100</div>
        </div>
        <div class="card">
          <div class="card-label">Carbon Footprint Index</div>
          <div class="card-val">${rec.carbon_footprint_estimate_kgCO2e} kg CO₂e / kg</div>
        </div>
        <div class="card">
          <div class="card-label">Food Waste Risk</div>
          <div class="card-val" style="color: ${rec.food_waste_risk_percent > 25 ? '#b91c1c' : '#047857'};">
            ${rec.food_waste_risk_percent}%
          </div>
        </div>
      </div>

      <div class="section-title">3. 3-Way Comparative Trade-Off Matrix</div>
      <table>
        <thead>
          <tr>
            <th>Option Type</th>
            <th>Material Structure</th>
            <th>OTR (${otrFormatted.unitStr})</th>
            <th>WVTR (${wvtrFormatted.unitStr})</th>
            <th>Expected Life</th>
            <th>Est. Cost / 1k</th>
            <th>Waste Risk</th>
          </tr>
        </thead>
        <tbody>
          <tr class="highlight-row">
            <td><strong>Recommended</strong></td>
            <td>${rec.alternatives.recommended.material}</td>
            <td>${formatOTR(rec.alternatives.recommended.OTR_cc_m2_day, unitSystem).value}</td>
            <td>${formatWVTR(rec.alternatives.recommended.WVTR_g_m2_day, unitSystem).value}</td>
            <td>~${rec.alternatives.recommended.predicted_shelf_life_days} Days</td>
            <td>$${rec.alternatives.recommended.cost_per_1k_packs.toFixed(1)}</td>
            <td>${rec.alternatives.recommended.food_waste_risk_percent}%</td>
          </tr>
          <tr>
            <td><strong>Lower-Cost</strong></td>
            <td>${rec.alternatives.lower_cost.material}</td>
            <td>${formatOTR(rec.alternatives.lower_cost.OTR_cc_m2_day, unitSystem).value}</td>
            <td>${formatWVTR(rec.alternatives.lower_cost.WVTR_g_m2_day, unitSystem).value}</td>
            <td>~${rec.alternatives.lower_cost.predicted_shelf_life_days} Days</td>
            <td>$${rec.alternatives.lower_cost.cost_per_1k_packs.toFixed(1)}</td>
            <td>${rec.alternatives.lower_cost.food_waste_risk_percent}%</td>
          </tr>
          <tr>
            <td><strong>Eco-Friendly</strong></td>
            <td>${rec.alternatives.eco_friendly.material}</td>
            <td>${formatOTR(rec.alternatives.eco_friendly.OTR_cc_m2_day, unitSystem).value}</td>
            <td>${formatWVTR(rec.alternatives.eco_friendly.WVTR_g_m2_day, unitSystem).value}</td>
            <td>~${rec.alternatives.eco_friendly.predicted_shelf_life_days} Days</td>
            <td>$${rec.alternatives.eco_friendly.cost_per_1k_packs.toFixed(1)}</td>
            <td>${rec.alternatives.eco_friendly.food_waste_risk_percent}%</td>
          </tr>
        </tbody>
      </table>

      <div class="section-title">4. Food Physiological Baseline & Logistics</div>
      <div class="grid-2">
        <div style="font-size: 11px;">
          <div>• <strong>Moisture:</strong> ${rec.inputConditions.moisture_percent}% | <strong>pH:</strong> ${rec.inputConditions.pH} | <strong>Fat:</strong> ${rec.inputConditions.fat_percent}%</div>
          <div>• <strong>Respiration:</strong> ${rec.inputConditions.respiration_rate} (${rec.inputConditions.respiration_mg_CO2_kg_hr} mg/kg/hr)</div>
        </div>
        <div style="font-size: 11px;">
          <div>• <strong>Storage Temp:</strong> ${storageTempFormatted.value} ${storageTempFormatted.unitStr} | <strong>RH:</strong> ${rec.inputConditions.relative_humidity_percent}%</div>
          <div>• <strong>Transit:</strong> ${rec.inputConditions.transportation_duration_days} days | <strong>Target Shelf Life:</strong> ${rec.inputConditions.desired_shelf_life_days} days</div>
        </div>
      </div>

      <div class="section-title">5. Explainable AI Engineering Justification</div>
      <p style="font-size: 11px; color: #334155; line-height: 1.6; margin: 0;">
        ${isMsmeMode ? rec.msme_simple_explanation : rec.technical_explanation}
      </p>

      <div class="footer">
        <span>Verified by PackWise AI Multi-Layered Machine Learning Decision Engine</span>
        <span>Page 1 of 1 • Generated via PackWise Platform</span>
      </div>

      </div>
    </body>
    </html>
  `;

  // Render into hidden iframe to trigger browser PDF print dialog cleanly
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print error', err);
      }
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 4000);
    }, 300);
  }
}
