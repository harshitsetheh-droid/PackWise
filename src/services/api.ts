import { PackagingDiagnosis, Commodity } from '../types/packaging';

/**
 * Service to communicate with server-side Gemini endpoints,
 * with resilient offline fallback algorithms.
 */

export interface ResolvedCommodityResult {
  commodity: Partial<Commodity>;
  confidence: 'High' | 'Medium' | 'Low';
  source: 'ai_estimated' | 'learned_memory';
  estimated: boolean;
  fromMemory?: boolean;
  queryCount?: number;
  learnedAt?: string;
  newlyLearned?: boolean;
  message?: string;
  reasoning: string;
}

export async function resolveCommodityWithAI(commodityName: string): Promise<ResolvedCommodityResult> {
  try {
    const res = await fetch('/api/gemini/resolve-commodity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commodityName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        const isFromMemory = Boolean(data.fromMemory || data.source === 'learned_memory');
        return {
          commodity: {
            name: data.data.commodity || commodityName,
            category: data.data.category || 'Processed foods',
            moisture_percent: Number(data.data.moisture_percent) || 50,
            pH: Number(data.data.pH) || 5.5,
            fat_percent: Number(data.data.fat_percent) || 5,
            respiration_rate: data.data.respiration_rate || 'None',
            respiration_mg_CO2_kg_hr: Number(data.data.respiration_mg_CO2_kg_hr) || 0,
            recommended_storage_temp_C: Number(data.data.recommended_storage_temp_C) || 15,
            recommended_RH_percent: Number(data.data.recommended_RH_percent) || 65,
            storage_type: data.data.storage_type || 'Ambient',
            typical_shelf_life_days: Number(data.data.typical_shelf_life_days) || 30,
            primary_spoilage_factors: data.data.primary_spoilage_factors || ['Moisture loss', 'Microbial growth'],
            description: isFromMemory
              ? `Learned profile for ${commodityName} (queried ${data.data.queryCount || 1}x, saved in knowledge memory).`
              : `AI-resolved profile for ${commodityName}.`,
            icon: isFromMemory ? '🧠' : '✨',
            fromMemory: isFromMemory,
            queryCount: data.data.queryCount || 1,
            learnedAt: data.data.learnedAt || data.learnedAt,
          },
          confidence: data.data.confidence || (isFromMemory ? 'High' : 'Medium'),
          source: isFromMemory ? 'learned_memory' : 'ai_estimated',
          estimated: !isFromMemory,
          fromMemory: isFromMemory,
          queryCount: data.data.queryCount || 1,
          learnedAt: data.data.learnedAt || data.learnedAt,
          newlyLearned: Boolean(data.newlyLearned),
          message: data.message,
          reasoning: data.data.estimation_reasoning || (isFromMemory ? 'Retrieved from PackWise continuous self-learning memory store.' : 'Derived via postharvest food property heuristics.'),
        };
      }
    }
  } catch (err) {
    console.warn('Backend AI resolve request failed, applying local food-class heuristic fallback', err);
  }

  // Resilient heuristic fallback if network fails
  const lower = commodityName.toLowerCase();
  const isFruit = lower.includes('fruit') || lower.includes('berry') || lower.includes('melon') || lower.includes('orange');
  const isVeg = lower.includes('leaf') || lower.includes('herb') || lower.includes('onion') || lower.includes('carrot');
  const isSnack = lower.includes('chip') || lower.includes('crisp') || lower.includes('cracker') || lower.includes('biscuit');
  const isMeat = lower.includes('meat') || lower.includes('beef') || lower.includes('pork') || lower.includes('fish');

  if (isFruit || isVeg) {
    return {
      commodity: {
        name: commodityName,
        category: isFruit ? 'Fresh fruits' : 'Fresh vegetables',
        moisture_percent: 88,
        pH: isFruit ? 3.8 : 5.8,
        fat_percent: 0.3,
        respiration_rate: 'High',
        respiration_mg_CO2_kg_hr: 25,
        recommended_storage_temp_C: 4,
        recommended_RH_percent: 90,
        storage_type: 'Cold Chain',
        typical_shelf_life_days: 14,
        primary_spoilage_factors: ['Moisture transpiration', 'Fungal decay'],
        description: `Heuristic fallback profile for ${commodityName}.`,
        icon: '🌱',
      },
      confidence: 'Medium',
      source: 'ai_estimated',
      estimated: true,
      reasoning: 'Estimated based on botanical fresh produce category defaults.',
    };
  }

  if (isSnack) {
    return {
      commodity: {
        name: commodityName,
        category: 'Snacks',
        moisture_percent: 2.5,
        pH: 6.0,
        fat_percent: 28.0,
        respiration_rate: 'None',
        respiration_mg_CO2_kg_hr: 0,
        recommended_storage_temp_C: 22,
        recommended_RH_percent: 50,
        storage_type: 'Dry Storage',
        typical_shelf_life_days: 120,
        primary_spoilage_factors: ['Moisture caking / loss of crispness', 'Lipid rancidity'],
        description: `Heuristic fallback profile for dry snack ${commodityName}.`,
        icon: '🍿',
      },
      confidence: 'Medium',
      source: 'ai_estimated',
      estimated: true,
      reasoning: 'Estimated based on processed dry snack food properties.',
    };
  }

  return {
    commodity: {
      name: commodityName,
      category: isMeat ? 'Meat' : 'Processed foods',
      moisture_percent: isMeat ? 72 : 45,
      pH: 5.6,
      fat_percent: isMeat ? 12 : 6,
      respiration_rate: 'None',
      respiration_mg_CO2_kg_hr: 0,
      recommended_storage_temp_C: isMeat ? 2 : 18,
      recommended_RH_percent: isMeat ? 88 : 60,
      storage_type: isMeat ? 'Chilled' : 'Ambient',
      typical_shelf_life_days: isMeat ? 7 : 30,
      primary_spoilage_factors: ['Oxidation', 'Microbial growth'],
      description: `Default baseline profile for ${commodityName}.`,
      icon: '🍱',
    },
    confidence: 'Low',
    source: 'ai_estimated',
    estimated: true,
    reasoning: 'Estimated generic baseline. Manual review recommended.',
  };
}

export async function diagnosePackagingProblem(
  problem: string,
  commodity?: string,
  currentPackaging?: string,
  storageCondition?: string
): Promise<PackagingDiagnosis> {
  try {
    const res = await fetch('/api/gemini/diagnose-packaging', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemDescription: problem,
        commodity,
        currentPackaging,
        storageCondition,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.diagnosis) {
        return data.diagnosis;
      }
    }
  } catch (err) {
    console.warn('Packaging Doctor API failed, falling back to local expert rules', err);
  }

  // Multilingual & Multi-failure diagnostic heuristic fallback
  const text = (problem + ' ' + (commodity || '') + ' ' + (currentPackaging || '')).toLowerCase();

  // 1. Mold / Fungus / Black-Green Spots / Rotting / Decay / Phaphundi
  if (
    text.includes('fungus') ||
    text.includes('mold') ||
    text.includes('mould') ||
    text.includes('phaphund') ||
    text.includes('rot') ||
    text.includes('spoil') ||
    text.includes('black') ||
    text.includes('green') ||
    text.includes('decay') ||
    text.includes('kharab') ||
    text.includes('jam') ||
    text.includes('jelly')
  ) {
    return {
      problemSummary: `Microbial fungal proliferation & surface mould development on ${commodity || 'food product'}.`,
      likelyCause:
        'Residual headspace oxygen (>2-3%) and ambient water activity created an aerobic incubator for moulds. For jams/jellies, surface condensation diluted the protective sugar concentration, allowing spores to germinate.',
      criticalParameter: 'Headspace Oxygen (OTR) & Hermetic Vacuum / MAP Flush',
      parameterExplanation:
        'Aerobic moulds strictly require oxygen to germinate. An OTR > 5 cc/m²/day or improper jar vacuum lid seal allows continuous oxygen re-ingress.',
      suggestedImprovement:
        'Hot-fill products at >85°C to pasteurize headspace and create vacuum pull upon cooling, or flush headspace with 100% Nitrogen gas before capping. For pouches, upgrade to EVOH/Nylon high-barrier film.',
      packagingAlternatives: [
        {
          material: 'Glass Jar with Plastisol Lug Cap (Hot Fill + Steam Vacuum)',
          structure: 'Hermetic glass with vacuum indicator safety button',
          whyBetter: 'Absolute gas-tight hermetic seal with negative pressure indicator.',
        },
        {
          material: 'EVOH High-Barrier Retort Pouch',
          structure: '12µm PET / 15µm EVOH / 70µm Retort Cast PP',
          whyBetter: 'OTR < 1.0 cc/m²/day, blocks oxygen ingress completely.',
        },
      ],
      msmeFarmerTip:
        'Always fill jars while the product is piping hot (above 85°C) and wipe jar rims clean before twisting the cap tightly. Once closed, turn jars upside down for 3 minutes so the hot product sterilizes the inside of the lid.',
      confidence: 'High',
    };
  }

  // 2. Swelling / Ballooning / Gas Bloating / Fermentation
  if (
    text.includes('swoll') ||
    text.includes('bloat') ||
    text.includes('balloon') ||
    text.includes('phool') ||
    text.includes('gas') ||
    text.includes('ferment') ||
    text.includes('burst')
  ) {
    return {
      problemSummary: 'Internal gas generation and pouch ballooning from active biological fermentation.',
      likelyCause:
        'Osmotolerant wild yeasts or bacteria metabolized sugars in the food, generating CO2 gas. Without adequate thermal preservation, antimicrobial hurdle (pH < 4.0), or active venting, the gas expands the flexible pouch.',
      criticalParameter: 'Thermal Kill Step / Preservative Hurdle & One-Way Degassing Valve',
      parameterExplanation:
        'Sealing active fermenting food inside high gas-barrier film without sterilizing active flora inevitably causes hydraulic/pneumatic pouch inflation.',
      suggestedImprovement:
        'Implement hot-fill pasteurization, adjust titratable acidity / preservative hurdle, or incorporate a one-way microporous degassing valve.',
      packagingAlternatives: [
        {
          material: 'Degassing Valve Pouch',
          structure: 'PET/PE with mechanical one-way venting valve',
          whyBetter: 'Releases positive CO2 pressure while preventing outside oxygen entry.',
        },
        {
          material: 'Aseptic Foil Multilayer',
          structure: '12µm PET / 9µm AluFoil / 60µm mPE (Post-sterilized)',
          whyBetter: 'Guarantees commercial sterility when combined with thermal processing.',
        },
      ],
      msmeFarmerTip:
        'If your product produces gas, do not just make the packet stronger—sterilize the batch before packing! Ensure food temperature exceeds 80°C for at least 10 minutes before sealing.',
      confidence: 'High',
    };
  }

  // 3. Rancidity / Odor / Stale Oil / Off-flavor / Pungency
  if (
    text.includes('rancid') ||
    text.includes('smell') ||
    text.includes('badboo') ||
    text.includes('oil') ||
    text.includes('fat') ||
    text.includes('stale') ||
    text.includes('odor') ||
    text.includes('khatta') ||
    text.includes('taste') ||
    text.includes('pungent')
  ) {
    return {
      problemSummary: 'Lipid autoxidation and oxidative rancidity producing volatile off-odors.',
      likelyCause:
        'Unsaturated fatty acids reacted with permeating atmospheric oxygen and UV/visible light wavelengths, triggering peroxide breakdown into pungent hexanal and rancid aldehydes.',
      criticalParameter: 'OTR (Oxygen Transmission Rate) & Light Transmission (% UV Transmittance)',
      parameterExplanation:
        'Fats and fried oils require OTR < 2.0 cc/m²/day and 0% light transmission to prevent photo-chemical rancidity.',
      suggestedImprovement:
        'Switch from transparent plastic to vacuum Metallized PET (Met-PET) or Aluminum foil laminate. Flush package with 99.5% food-grade Nitrogen gas.',
      packagingAlternatives: [
        {
          material: 'Metallized Polyester (Met-PET / Polyethylene)',
          structure: '12µm Met-PET / 50µm PE',
          whyBetter: 'Blocks 99% of light radiation and reduces oxygen transmission to <1.5 cc/m²/day.',
        },
        {
          material: 'Aluminum Barrier Pouch (PET/Alu/PE)',
          structure: '12µm PET / 7µm Foil / 50µm PE',
          whyBetter: 'Absolute zero light and zero oxygen permeability.',
        },
      ],
      msmeFarmerTip:
        'Never sell fried or high-oil foods in clear, transparent polythene bags under retail tube lights. Use shiny silver-lined (metalized) pouches with Nitrogen gas flushing.',
      confidence: 'High',
    };
  }

  // 4. Loss of Crispness / Moisture Ingress / Sogginess / Softness
  if (
    text.includes('soggy') ||
    text.includes('soft') ||
    text.includes('crisp') ||
    text.includes('crunch') ||
    text.includes('chips') ||
    text.includes('namkeen') ||
    text.includes('biscuit') ||
    text.includes('papad') ||
    text.includes('seelan') ||
    text.includes('moisture') ||
    text.includes('pani')
  ) {
    return {
      problemSummary: 'Loss of crispness due to moisture absorption from atmosphere.',
      likelyCause:
        'Hygroscopic food matrix rapidly absorbed water vapor through high-WVTR packaging or micro-pinholes, exceeding critical water activity (aw > 0.40).',
      criticalParameter: 'WVTR (Water Vapor Transmission Rate)',
      parameterExplanation:
        'WVTR defines how much water vapor penetrates the film. Low moisture dry foods demand WVTR < 1.0 g/m²/day.',
      suggestedImprovement:
        'Upgrade from standard single-layer film to Metallized PET or co-extruded high-barrier film. Inspect seal jaw temperature.',
      packagingAlternatives: [
        {
          material: 'Metallized PET (Met-PET/PE)',
          structure: '12µm Met-PET / 50µm PE',
          whyBetter: 'Reduces WVTR by over 90% (to ~0.9 g/m²/day) and blocks light-induced rancidity.',
        },
        {
          material: 'Aluminum Foil Laminate',
          structure: '12µm PET / 7µm Foil / 60µm PE',
          whyBetter: 'Absolute zero vapor penetration for ultra-extended shelf life.',
        },
      ],
      msmeFarmerTip:
        'Avoid thin transparent polythene bags for crispy snacks. Switch to silver-lined (metalized) pouches and ensure your impulse sealer clamps evenly for at least 1.5 seconds.',
      confidence: 'High',
    };
  }

  // 5. Seal Leaks / Pouch Burst / Delamination
  if (
    text.includes('leak') ||
    text.includes('burst') ||
    text.includes('seal') ||
    text.includes('open') ||
    text.includes('phat') ||
    text.includes('transit') ||
    text.includes('transport')
  ) {
    return {
      problemSummary: 'Seal delamination or channel leak along pouch seams during transit.',
      likelyCause:
        'Insufficient seal temperature, contaminated seal area (oil/powder dust), or low seal strength under transport vibrations.',
      criticalParameter: 'Seal Strength (N/15mm) & Seal Temperature (°C)',
      parameterExplanation:
        'Seals must withstand hydraulic and pneumatic expansion stresses during road transit and high-altitude shipment.',
      suggestedImprovement:
        'Increase sealant layer thickness to ≥50µm (mPE/metallocene), clean filling nozzles to prevent lip contamination, and calibrate heating bar to 135-145°C.',
      packagingAlternatives: [
        {
          material: 'PA/PE High-Integrity Vacuum Skin',
          structure: '20µm Nylon / 70µm Metallocene PE',
          whyBetter: 'Heavy duty seal strength (>45 N/15mm) with extreme puncture resilience.',
        },
      ],
      msmeFarmerTip:
        'Clean your sealing bar daily with a brass brush. Check if product powder or oil is getting trapped in the seal seam, which creates hidden micro-tunnels.',
      confidence: 'High',
    };
  }

  // 6. Condensation / Sweating / Fogging
  if (
    text.includes('sweat') ||
    text.includes('condens') ||
    text.includes('droplet') ||
    text.includes('fog') ||
    text.includes('bhaap')
  ) {
    return {
      problemSummary: 'Internal condensation fogging and accelerated fungal decay in fresh produce.',
      likelyCause:
        'Food respiration generated water vapor trapped inside an impermeable barrier, causing liquid water pooling (dew point crossing) and anaerobic fermentation.',
      criticalParameter: 'Breathability & Micro-Perforations / Anti-Fog Coating',
      parameterExplanation:
        'Fresh produce continues respiring; sealing them in airtight film suffocates the tissue, causing foul odors and mold blooms.',
      suggestedImprovement:
        'Switch immediately to laser micro-perforated BOPP or breathable selective membrane film with anti-fog additive.',
      packagingAlternatives: [
        {
          material: 'Micro-Perforated Equilibrium Film',
          structure: '30µm BOPP with 50-80µm micro-holes',
          whyBetter: 'Balances gas exchange and vents excess humidity without dehydration.',
        },
        {
          material: 'Breathable Selective Membrane',
          structure: 'Calcium carbonate microporous PE',
          whyBetter: 'Allows gradual moisture breathability without liquid droplets.',
        },
      ],
      msmeFarmerTip:
        'Never pack freshly harvested produce while still warm from the sun. Pre-cool first, and use bags with tiny pinholes so the fruit can "breathe" instead of sweating inside.',
      confidence: 'High',
    };
  }

  // 7. Default general diagnosis
  return {
    problemSummary: 'Packaging barrier degradation or incompatibility under current storage conditions.',
    likelyCause:
      'Atmospheric gases (O2 / H2O) or mechanical vibrations have exceeded the protective threshold of the current package.',
    criticalParameter: 'Barrier Envelope (OTR & WVTR)',
    parameterExplanation:
      'Matching the food degradation kinetics with barrier transmission is critical to maintaining shelf stability.',
    suggestedImprovement:
      'Evaluate food moisture, fat content, and storage temperature to select a calibrated multilayer structure.',
    packagingAlternatives: [
      {
        material: 'PET/PE Barrier Laminate',
        structure: '12µm PET / 50µm PE',
        whyBetter: 'Versatile mechanical and moderate moisture-oxygen barrier.',
      },
    ],
    msmeFarmerTip:
      'Store finished packages away from direct sunlight and avoid stacking heavy boxes directly on top of flexible pouches.',
    confidence: 'Medium',
  };
}

/**
 * Fetch all learned commodities saved in persistent server-side store
 */
export async function fetchLearnedCommodities(): Promise<Commodity[]> {
  try {
    const res = await fetch('/api/commodities/learned');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data.map((item: any, idx: number) => ({
          id: `learned_${item.commodity.toLowerCase().replace(/\s+/g, '_')}_${idx}`,
          name: item.commodity,
          category: item.category || 'Processed foods',
          moisture_percent: Number(item.moisture_percent) || 50,
          pH: Number(item.pH) || 5.5,
          fat_percent: Number(item.fat_percent) || 5,
          respiration_rate: item.respiration_rate || 'None',
          respiration_mg_CO2_kg_hr: Number(item.respiration_mg_CO2_kg_hr) || 0,
          recommended_storage_temp_C: Number(item.recommended_storage_temp_C) || 15,
          recommended_RH_percent: Number(item.recommended_RH_percent) || 65,
          storage_type: item.storage_type || 'Ambient',
          typical_shelf_life_days: Number(item.typical_shelf_life_days) || 30,
          primary_spoilage_factors: item.primary_spoilage_factors || ['Moisture loss'],
          description: `Remembered knowledge item. Searched ${item.queryCount || 1} times by community.`,
          icon: '🧠',
          isCustom: true,
          fromMemory: true,
          queryCount: item.queryCount || 1,
          learnedAt: item.learnedAt,
        }));
      }
    }
  } catch (err) {
    console.warn('Could not fetch learned commodities:', err);
  }
  return [];
}

/**
 * Record user conditions feedback for continuous learning
 */
export async function recordUserConditionFeedback(data: {
  commodityName: string;
  storage_temperature_C: number;
  relative_humidity_percent: number;
  desired_shelf_life_days: number;
  recommended_material?: string;
}): Promise<void> {
  try {
    await fetch('/api/commodities/record-condition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn('Failed to record condition feedback:', err);
  }
}
