import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';

app.use(express.json());

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

import fs from 'fs';

const LEARNED_COMMODITIES_PATH = path.resolve(process.cwd(), 'src/data/learned_commodities.json');

export interface LearnedCommodityRecord {
  commodity: string;
  category: string;
  moisture_percent: number;
  pH: number;
  fat_percent: number;
  respiration_rate: string;
  respiration_mg_CO2_kg_hr: number;
  recommended_storage_temp_C: number;
  recommended_RH_percent: number;
  storage_type: string;
  primary_spoilage_factors: string[];
  typical_shelf_life_days: number;
  confidence: 'High' | 'Medium' | 'Low';
  estimation_reasoning: string;
  queryCount: number;
  learnedAt: string;
  lastRequestedAt: string;
  userConditionsHistory?: {
    storage_temp_C?: number;
    rh_percent?: number;
    desired_shelf_life_days?: number;
    recommended_material?: string;
    timestamp: string;
  }[];
}

function loadLearnedCommodities(): LearnedCommodityRecord[] {
  try {
    if (fs.existsSync(LEARNED_COMMODITIES_PATH)) {
      const raw = fs.readFileSync(LEARNED_COMMODITIES_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read learned commodities file:', err);
  }
  return [];
}

function saveLearnedCommodities(items: LearnedCommodityRecord[]) {
  try {
    fs.writeFileSync(LEARNED_COMMODITIES_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write learned commodities file:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const learnedList = loadLearnedCommodities();
  res.json({
    status: 'ok',
    geminiAvailable: !!ai,
    environment: process.env.NODE_ENV || 'development',
    learnedCommoditiesCount: learnedList.length,
    timestamp: new Date().toISOString(),
  });
});

// API: Get all learned commodities from persistent store
app.get('/api/commodities/learned', (req, res) => {
  const list = loadLearnedCommodities();
  res.json({
    success: true,
    count: list.length,
    data: list,
  });
});

// API: Record user condition & packaging result for continuous self-learning
app.post('/api/commodities/record-condition', (req, res) => {
  try {
    const {
      commodityName,
      storage_temperature_C,
      relative_humidity_percent,
      desired_shelf_life_days,
      recommended_material,
    } = req.body;

    if (!commodityName) {
      return res.status(400).json({ error: 'commodityName required' });
    }

    const learnedList = loadLearnedCommodities();
    const targetName = commodityName.trim().toLowerCase();
    const existing = learnedList.find(
      (item) => item.commodity.toLowerCase() === targetName
    );

    if (existing) {
      if (!existing.userConditionsHistory) {
        existing.userConditionsHistory = [];
      }
      existing.userConditionsHistory.push({
        storage_temp_C: storage_temperature_C,
        rh_percent: relative_humidity_percent,
        desired_shelf_life_days,
        recommended_material,
        timestamp: new Date().toISOString(),
      });
      existing.lastRequestedAt = new Date().toISOString();
      saveLearnedCommodities(learnedList);
    }

    res.json({ success: true, message: 'Condition feedback recorded into knowledge base.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: AI-assisted data resolution for unknown or unlisted commodities with Memory Cache
app.post('/api/gemini/resolve-commodity', async (req, res) => {
  try {
    const { commodityName } = req.body;
    if (!commodityName || typeof commodityName !== 'string') {
      return res.status(400).json({ error: 'Commodity name is required' });
    }

    const learnedList = loadLearnedCommodities();
    const targetName = commodityName.trim().toLowerCase();

    // Check memory first! (Exact match or close substring)
    const existingIndex = learnedList.findIndex(
      (item) => item.commodity.toLowerCase() === targetName ||
                item.commodity.toLowerCase().includes(targetName) ||
                targetName.includes(item.commodity.toLowerCase())
    );

    if (existingIndex !== -1) {
      const existing = learnedList[existingIndex];
      existing.queryCount = (existing.queryCount || 1) + 1;
      existing.lastRequestedAt = new Date().toISOString();
      saveLearnedCommodities(learnedList);

      return res.json({
        success: true,
        data: existing,
        source: 'learned_memory',
        fromMemory: true,
        queryCount: existing.queryCount,
        learnedAt: existing.learnedAt,
        message: `Retrieved from continuous memory store (queried ${existing.queryCount} times). 0 tokens used.`,
      });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini AI service unavailable. API key not configured.',
      });
    }

    const prompt = `You are a food science and postharvest technology specialist assisting an intelligent food packaging recommendation system.
Analyze the commodity: "${commodityName}".

Provide estimated biological and postharvest food properties.
Rules:
1. Never invent or claim lab-certified values. This is an AI-assisted estimate.
2. Provide reasonable scientific ranges based on food science literature.
3. Return ONLY valid JSON with no markdown wrapping or code fences.

Required JSON format:
{
  "commodity": "${commodityName}",
  "category": "Fresh fruits" | "Fresh vegetables" | "Grains" | "Flours" | "Pulses" | "Nuts" | "Dairy" | "Frozen foods" | "Meat" | "Seafood" | "Beverages" | "Oils" | "Bakery products" | "Processed foods" | "Snacks" | "Condiments",
  "moisture_percent": number (0-95),
  "pH": number (2.0-8.5),
  "fat_percent": number (0-85),
  "respiration_rate": "None" | "Low" | "Medium" | "High" | "Very High",
  "respiration_mg_CO2_kg_hr": number (0-80),
  "recommended_storage_temp_C": number (-20 to 25),
  "recommended_RH_percent": number (20-95),
  "storage_type": "Ambient" | "Chilled" | "Frozen" | "Controlled Atmosphere" | "Dry Storage" | "Cold Chain",
  "primary_spoilage_factors": ["string", "string"],
  "typical_shelf_life_days": number,
  "confidence": "High" | "Medium" | "Low",
  "estimation_reasoning": "brief explanation of where these biological baselines come from"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const responseText = response.text || '';
    const cleaned = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const data = JSON.parse(cleaned);

    // Save newly learned commodity to continuous memory store
    const newLearned: LearnedCommodityRecord = {
      commodity: data.commodity || commodityName,
      category: data.category || 'Processed foods',
      moisture_percent: Number(data.moisture_percent) || 50,
      pH: Number(data.pH) || 5.5,
      fat_percent: Number(data.fat_percent) || 5,
      respiration_rate: data.respiration_rate || 'None',
      respiration_mg_CO2_kg_hr: Number(data.respiration_mg_CO2_kg_hr) || 0,
      recommended_storage_temp_C: Number(data.recommended_storage_temp_C) || 15,
      recommended_RH_percent: Number(data.recommended_RH_percent) || 65,
      storage_type: data.storage_type || 'Ambient',
      primary_spoilage_factors: data.primary_spoilage_factors || ['Moisture loss'],
      typical_shelf_life_days: Number(data.typical_shelf_life_days) || 30,
      confidence: data.confidence || 'Medium',
      estimation_reasoning: data.estimation_reasoning || 'AI-assisted food biological profile.',
      queryCount: 1,
      learnedAt: new Date().toISOString(),
      lastRequestedAt: new Date().toISOString(),
      userConditionsHistory: [],
    };

    learnedList.unshift(newLearned);
    saveLearnedCommodities(learnedList);

    res.json({
      success: true,
      data: newLearned,
      source: 'ai_estimated',
      newlyLearned: true,
      queryCount: 1,
      learnedAt: newLearned.learnedAt,
      message: 'New commodity analyzed via Gemini and successfully registered in continuous memory store.',
    });
  } catch (error: any) {
    console.error('Error resolving commodity with Gemini:', error);
    res.status(500).json({
      error: 'Failed to resolve commodity data with AI',
      details: error.message,
    });
  }
});

async function callGeminiGenerate(prompt: string, maxRetries = 1, timeoutMs = 7000): Promise<string> {
  if (!ai) throw new Error('Gemini API client not initialized');
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const apiPromise = ai.models.generateContent({
          model,
          contents: prompt,
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on model ${model}`)), timeoutMs)
        );
        const response = await Promise.race([apiPromise, timeoutPromise]);
        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini (${model}) attempt ${attempt + 1} failed: ${err.message}`);
        // If 503 or overload, switch models immediately without wasting retry
        if (err.message && err.message.includes('503')) {
          break;
        }
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    }
  }
  throw lastError;
}

function generateServerSideDiagnosticFallback(
  problem: string,
  commodity?: string,
  currentPackaging?: string,
  storageCondition?: string
) {
  const p = (problem + ' ' + (commodity || '') + ' ' + (currentPackaging || '')).toLowerCase();

  // 1. Mold / Fungus / Black-Green Spots / Rotting / Decay
  if (p.includes('fungus') || p.includes('mold') || p.includes('mould') || p.includes('phaphund') || p.includes('rot') || p.includes('spoil') || p.includes('black') || p.includes('green') || p.includes('decay') || p.includes('kharab') || p.includes('jam') || p.includes('jelly')) {
    return {
      directAnswer: `To stop mold and fungal spoilage on ${commodity || 'your food product'}, you must immediately eliminate trapped headspace oxygen and moisture pooling. Switch to hot-filling jars at >85°C to create an airtight steam vacuum, or flush pouches with 100% Nitrogen gas before heat sealing.`,
      problemSummary: `Microbial fungal proliferation & surface mould development on ${commodity || 'food product'}.`,
      likelyCause: `Residual headspace oxygen (>2-3%) and ambient water activity created an aerobic incubator for xerophilic moulds (Aspergillus / Penicillium). If high sugar (jams/jellies), condensation on the top surface diluted the surface sugar matrix, allowing fungal spores to germinate.`,
      criticalParameter: 'Headspace Oxygen (OTR) & Hermetic Vacuum / MAP Flush',
      parameterExplanation: 'Aerobic moulds strictly require oxygen to germinate. An OTR > 5 cc/m²/day or improper jar vacuum lid seal allows continuous oxygen re-ingress.',
      suggestedImprovement: 'Hot-fill products at >85°C to pasteurize headspace and create vacuum pull upon cooling, or flush headspace with 100% Nitrogen gas before capping. For pouches, upgrade to EVOH/Nylon high-barrier film.',
      packagingAlternatives: [
        {
          material: 'Glass Jar with Plastisol Lug Cap (Hot Fill + Steam Vacuum)',
          structure: 'Hermetic glass with vacuum indicator safety button',
          whyBetter: 'Absolute gas-tight hermetic seal with negative pressure indicator.'
        },
        {
          material: 'EVOH High-Barrier Retort Pouch',
          structure: '12µm PET / 15µm EVOH / 70µm Retort Cast PP',
          whyBetter: 'OTR < 1.0 cc/m²/day, blocks oxygen ingress completely.'
        }
      ],
      msmeFarmerTip: 'Always fill jars while the product is piping hot (above 85°C) and wipe jar rims clean before twisting the cap tightly. Once closed, turn jars upside down for 3 minutes so the hot product sterilizes the inside of the lid.',
      confidence: 'High'
    };
  }

  // 2. Swelling / Ballooning / Gas Bloating / Fermentation
  if (p.includes('swoll') || p.includes('bloat') || p.includes('balloon') || p.includes('phool') || p.includes('gas') || p.includes('ferment') || p.includes('burst')) {
    return {
      directAnswer: `Your packets are ballooning because wild yeasts or bacteria are actively fermenting inside the pouch and producing carbon dioxide gas. You need a proper pasteurization heating step before packaging, or must use a pouch with a one-way degassing valve.`,
      problemSummary: `Internal gas generation and pouch ballooning from active biological fermentation.`,
      likelyCause: `Osmotolerant wild yeasts or heterofermentative bacteria metabolized sugars in the food, generating carbon dioxide (CO2) gas. Without adequate thermal preservation, antimicrobial hurdle (pH < 4.0), or active venting, the gas expands the flexible pouch until failure.`,
      criticalParameter: 'Thermal Kill Step / Preservative Hurdle & One-Way Degassing Valve',
      parameterExplanation: 'Sealing active fermenting food inside high gas-barrier film without sterilizing active flora inevitably causes hydraulic/pneumatic pouch inflation.',
      suggestedImprovement: 'Implement hot-fill pasteurization, adjust titratable acidity / preservative hurdle, or incorporate a one-way microporous degassing valve (like used in coffee/kimchi pouches).',
      packagingAlternatives: [
        {
          material: 'Degassing Valve Pouch',
          structure: 'PET/PE with mechanical one-way venting valve',
          whyBetter: 'Releases positive CO2 pressure while preventing outside oxygen entry.'
        },
        {
          material: 'Aseptic Foil Multilayer',
          structure: '12µm PET / 9µm AluFoil / 60µm mPE (Post-sterilized)',
          whyBetter: 'Guarantees commercial sterility when combined with thermal processing.'
        }
      ],
      msmeFarmerTip: 'If your product produces gas, do not just make the packet stronger—sterilize the batch before packing! Ensure food temperature exceeds 80°C for at least 10 minutes before sealing.',
      confidence: 'High'
    };
  }

  // 3. Rancidity / Odor / Stale Oil / Off-flavor / Pungency
  if (p.includes('rancid') || p.includes('smell') || p.includes('badboo') || p.includes('oil') || p.includes('fat') || p.includes('stale') || p.includes('odor') || p.includes('khatta') || p.includes('taste') || p.includes('pungent')) {
    return {
      directAnswer: `The bad smell or stale taste is caused by lipid oxidation from light and oxygen penetrating your package. Stop using clear plastic bags immediately; switch to light-proof metallized (Met-PET) pouches and flush with food-grade Nitrogen gas.`,
      problemSummary: `Lipid autoxidation and oxidative rancidity producing volatile aldehydes and off-odors.`,
      likelyCause: `Unsaturated fatty acids in ${commodity || 'the food'} reacted with permeating atmospheric oxygen and UV/visible light wavelengths (300-500 nm), triggering free-radical peroxide breakdown into pungent hexanal and rancid aldehydes.`,
      criticalParameter: 'OTR (Oxygen Transmission Rate) & Light Transmission (% UV Transmittance)',
      parameterExplanation: 'Fats and fried oils require OTR < 2.0 cc/m²/day and 0% light transmission to prevent photo-chemical rancidity.',
      suggestedImprovement: 'Switch from transparent plastic to vacuum Metallized PET (Met-PET) or Aluminum foil laminate. Flush package with 99.5% food-grade Nitrogen gas.',
      packagingAlternatives: [
        {
          material: 'Metallized Polyester (Met-PET / Polyethylene)',
          structure: '12µm Met-PET / 50µm PE',
          whyBetter: 'Blocks 99% of light radiation and reduces oxygen transmission to <1.5 cc/m²/day.'
        },
        {
          material: 'Aluminum Barrier Pouch (PET/Alu/PE)',
          structure: '12µm PET / 7µm Foil / 50µm PE',
          whyBetter: 'Absolute zero light and zero oxygen permeability.'
        }
      ],
      msmeFarmerTip: 'Never sell fried or high-oil foods in clear, transparent polythene bags under retail tube lights. Use shiny silver-lined (metalized) pouches with Nitrogen gas flushing.',
      confidence: 'High'
    };
  }

  // 4. Loss of Crispness / Moisture Ingress / Sogginess / Softness
  if (p.includes('soggy') || p.includes('soft') || p.includes('crisp') || p.includes('crunch') || p.includes('chips') || p.includes('namkeen') || p.includes('biscuit') || p.includes('papad') || p.includes('seelan') || p.includes('moisture') || p.includes('pani')) {
    return {
      directAnswer: `Your product is turning soggy because ambient moisture vapor is leaking through low-grade polybags. Upgrade immediately to high-moisture-barrier Metallized BOPP film (WVTR < 1.0 g/m²/day) and verify your heat-sealer jaws are clean and pressing evenly.`,
      problemSummary: `Loss of crispness and texture collapse due to water vapor sorption.`,
      likelyCause: `Low-moisture food matrix rapidly equilibrated with ambient humidity through film with excessive Water Vapor Transmission Rate (WVTR > 2.0 g/m²/day), pushing water activity past the critical crispness threshold (aw > 0.40).`,
      criticalParameter: 'WVTR (Water Vapor Transmission Rate)',
      parameterExplanation: 'Dry crispy snacks require WVTR < 1.0 g/m²/day to maintain brittle, crispy cell structures over multi-month storage.',
      suggestedImprovement: 'Upgrade from monolayer polybags to co-extruded Metallized BOPP or multilayer barrier laminate. Ensure hermetic heat sealing without wrinkles.',
      packagingAlternatives: [
        {
          material: 'BOPP / Met-BOPP Laminate',
          structure: '20µm Matt BOPP / 18µm Met-BOPP',
          whyBetter: 'Ultra-low WVTR (<0.6 g/m²/day) with high crispness protection.'
        },
        {
          material: 'PET / Foil / Polyethylene',
          structure: '12µm PET / 7µm Foil / 50µm PE',
          whyBetter: 'Total moisture impervious barrier.'
        }
      ],
      msmeFarmerTip: 'Check your sealer heating bars daily. Ensure the sealing jaw applies uniform pressure along the entire pouch width for at least 1.5 seconds at 135-145°C.',
      confidence: 'High'
    };
  }

  // 5. Seal Leaks / Pouch Burst / Delamination during Transit
  if (p.includes('leak') || p.includes('burst') || p.includes('seal') || p.includes('open') || p.includes('phat') || p.includes('transit') || p.includes('transport') || p.includes('vibrat')) {
    return {
      directAnswer: `Seams burst during transit due to seal contamination or too thin of an inner sealant layer. Upgrade your inner sealing layer to at least 50µm Metallocene PE (mPE) which provides superior hot-tack strength and resists transit vibration drops.`,
      problemSummary: `Mechanical seal delamination and seam bursting under transit vibrations or pressure gradients.`,
      likelyCause: `Contamination of sealing jaws by food dust or oil, narrow heat-sealing temperature window, or thin sealant layer (<35µm) unable to absorb flex-cracking and high-altitude expansion pressures.`,
      criticalParameter: 'Seal Strength (N/15mm) & Sealant Layer Thickness (µm)',
      parameterExplanation: 'Seals must withstand >35 N/15mm tensile pull and retain integrity under ambient barometric changes during transport.',
      suggestedImprovement: 'Increase sealant layer thickness to ≥50µm Metallocene PE (mPE) with superior hot-tack strength. Calibrate sealing bar to 140°C.',
      packagingAlternatives: [
        {
          material: 'High-Integrity Co-ex Metallocene Pouch',
          structure: '12µm PET / 15µm PA / 60µm mPE',
          whyBetter: 'Outstanding flex-crack resilience and seal strengths >45 N/15mm.'
        }
      ],
      msmeFarmerTip: 'Keep your pouch sealing zone clean. Dust or grease trapped in the seal seam causes invisible micro-tunnels that burst during transport.',
      confidence: 'High'
    };
  }

  // 6. Condensation / Sweating / Fogging
  if (p.includes('sweat') || p.includes('condens') || p.includes('droplet') || p.includes('fog') || p.includes('bhaap')) {
    return {
      directAnswer: `Moisture droplets are forming because the food's natural respiration vapor cannot escape and condenses on cold plastic walls. Switch to anti-fog coated film or laser micro-perforated film so moisture vapor dissipates without pooling water on produce.`,
      problemSummary: `Internal surface fogging and free water pooling inside packaging.`,
      likelyCause: `High postharvest product transpiration crossing dew point temperature on non-treated hydrophobic plastic walls, generating liquid water droplets that catalyze fungal decay.`,
      criticalParameter: 'Anti-Fog Surfactant & Breathable Micro-Perforations',
      parameterExplanation: 'Anti-fog coatings spread water into an invisible continuous sheet, while micro-perforations equilibrate relative humidity without condensation.',
      suggestedImprovement: 'Switch to antifog coated BOPP or equilibrium laser micro-perforated film (EMAP).',
      packagingAlternatives: [
        {
          material: 'Anti-Fog Micro-Perforated BOPP',
          structure: '30µm BOPP with food-contact antifog additive and 60µm micro-holes',
          whyBetter: 'Prevents droplet formation and balances respiration humidity.'
        }
      ],
      msmeFarmerTip: 'Pre-cool freshly harvested produce before packaging! Packing warm produce into plastic causes immediate sweating inside the pouch.',
      confidence: 'High'
    };
  }

  // 7. General Fallback with Comprehensive Food Science Breakdown
  return {
    directAnswer: `Based on your description, the food degradation rate is exceeding the barrier transmission limits of your current packaging material under current temperature/humidity conditions. Calibrating OTR and WVTR to match your food's water activity and respiration will resolve the issue.`,
    problemSummary: `Packaging barrier mismatch or environmental vulnerability diagnosed for ${commodity || 'submitted food'}.`,
    likelyCause: `The degradation kinetics of ${commodity || 'the food matrix'} exceeded the barrier transmission thresholds of ${currentPackaging || 'the current packaging material'} under storage conditions (${storageCondition || 'ambient'}). Atmospheric gas and vapor gradients triggered quality decline.`,
    criticalParameter: 'Thermodynamic Barrier Calibration (OTR & WVTR)',
    parameterExplanation: 'Every food requires a tailored balance between gas transmission (OTR) and moisture transmission (WVTR) to maintain biochemical equilibrium.',
    suggestedImprovement: 'Conduct head-space gas analysis, determine critical moisture limits, and upgrade to multi-layer barrier laminates.',
    packagingAlternatives: [
      {
        material: 'High-Barrier Co-extruded Laminate',
        structure: '12µm PET / 9µm EVOH / 50µm PE',
        whyBetter: 'Provides universal gas, moisture, and aroma barrier protection.'
      },
      {
        material: 'Metallocene Vacuum Skin Film',
        structure: 'PA/PE Co-extrusion with hermetic sealing',
        whyBetter: 'Minimizes internal headspace and prevents mechanical abrasion.'
      }
    ],
    msmeFarmerTip: 'Store finished inventory away from direct sunlight, maintain consistent room temperature, and verify your seal integrity using a simple water immersion leak test.',
    confidence: 'Medium'
  };
}

// API: Packaging Doctor - Natural language problem diagnosis
app.post('/api/gemini/diagnose-packaging', async (req, res) => {
  const { problemDescription, commodity, currentPackaging, storageCondition } = req.body;
  if (!problemDescription) {
    return res.status(400).json({ error: 'Problem description is required' });
  }

  try {
    if (ai) {
      const prompt = `You are a Senior Food Packaging Scientist and Packaging Doctor diagnostic engine.
A food producer, factory manager, or farmer has reported a packaging issue:
- Problem Description: "${problemDescription}"
- Food Commodity (if specified): "${commodity || 'General food product'}"
- Current Packaging (if known): "${currentPackaging || 'Unknown / Unspecified'}"
- Storage Condition: "${storageCondition || 'Ambient / Normal'}"

Perform a thorough root-cause failure analysis and provide a clear, direct answer.
Break down:
1. Direct clinical answer addressing their specific question or symptom directly
2. Problem identification
3. Likely biochemical / physical cause (e.g. moisture ingress, lipid photo-oxidation, anaerobic fermentation, seal pinhole failure)
4. Relevant packaging parameter (e.g., WVTR, OTR, Seal Integrity, Headspace, Anti-fog coating, Light transmission)
5. Suggested immediate corrective improvement
6. Possible packaging material alternatives with rationale
7. Plain-language MSME / Farmer tip (no jargon, actionable)

Return ONLY valid JSON with no markdown wrapping or code blocks:
{
  "directAnswer": "Clear, direct, authoritative answer directly answering their exact question and telling them what must be done immediately",
  "problemSummary": "concise description of the diagnosed problem",
  "likelyCause": "detailed biochemical or physical root cause",
  "criticalParameter": "primary parameter name (e.g., WVTR - Water Vapor Transmission Rate)",
  "parameterExplanation": "why this parameter caused the observed failure",
  "suggestedImprovement": "specific immediate technical action to fix it",
  "packagingAlternatives": [
    {
      "material": "Material name",
      "structure": "Layer structure description",
      "whyBetter": "Why it solves the failure mode"
    }
  ],
  "msmeFarmerTip": "Simple, non-technical advice for small scale producers",
  "confidence": "High"
}`;

      const responseText = await callGeminiGenerate(prompt, 2);
      const cleaned = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const result = JSON.parse(cleaned);
      return res.json({
        success: true,
        diagnosis: result,
      });
    }
  } catch (error: any) {
    console.warn('Packaging Doctor Gemini API call failed or timed out, applying scientific expert engine fallback:', error.message);
  }

  // Resilient expert scientific diagnostic engine
  const fallback = generateServerSideDiagnosticFallback(
    problemDescription,
    commodity,
    currentPackaging,
    storageCondition
  );
  return res.json({
    success: true,
    diagnosis: fallback,
    source: 'expert_rule_engine',
  });
});

// API: Explainable AI - Deep rationale and small-farmer friendly advisory
app.post('/api/gemini/explain-recommendation', async (req, res) => {
  try {
    const { commodity, recommendation, conditions } = req.body;
    if (!commodity || !recommendation) {
      return res.status(400).json({ error: 'Commodity and recommendation details are required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini AI service unavailable. API key not configured.',
      });
    }

    const prompt = `You are an Explainable AI assistant for an intelligent food packaging system.
Food: ${commodity.name} (Moisture: ${commodity.moisture_percent}%, pH: ${commodity.pH}, Fat: ${commodity.fat_percent}%, Respiration: ${commodity.respiration_rate})
Conditions: Temp ${conditions.temperature_C}°C, RH ${conditions.relative_humidity_percent}%, Desired Shelf Life ${conditions.desired_shelf_life_days} days, Transit ${conditions.transportation_duration_days} days, Storage: ${conditions.storage_type}.
Recommended Packaging: ${recommendation.recommended_material} (${recommendation.film_thickness_micron} µm, OTR: ${recommendation.OTR_cc_m2_day}, WVTR: ${recommendation.WVTR_g_m2_day}, MAP: ${recommendation.MAP_suitability}).

Generate a dual explanation:
1. Technical scientific explanation for packaging engineers (covering gas barrier, water activity equilibrium, shelf life kinetics).
2. Plain-language Small Farmer / MSME explanation (simple analogies, why this protects their profit and prevents spoilage).
3. 3-4 top driving factors.

Return ONLY valid JSON:
{
  "technicalExplanation": "string",
  "msmeSimpleExplanation": "string",
  "topDrivingFactors": ["factor 1", "factor 2", "factor 3"],
  "shelfLifeInsight": "string"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const responseText = response.text || '';
    const cleaned = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const result = JSON.parse(cleaned);
    res.json({
      success: true,
      explanation: result,
    });
  } catch (error: any) {
    console.error('Error generating explanation with Gemini:', error);
    res.status(500).json({
      error: 'Failed to generate explanation',
      details: error.message,
    });
  }
});

// Setup Vite dev middleware or serve static build
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, host, () => {
    console.log(`PackWise AI server listening on http://${host}:${port}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
