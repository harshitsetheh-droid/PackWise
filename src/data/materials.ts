import { PackagingMaterial } from '../types/packaging';

export const DEFAULT_PACKAGING_MATERIALS: PackagingMaterial[] = [
  {
    id: 'ldpe',
    name: 'LDPE (Low-Density Polyethylene)',
    code: 'LDPE-STD',
    category: 'Polyolefin',
    structure_layers: 'Monolayer LDPE Film',
    OTR_cc_m2_day: 3500,
    OTR_range: [2500, 5000],
    WVTR_g_m2_day: 15.0,
    WVTR_range: [10.0, 20.0],
    film_thickness_micron: 45,
    thickness_range: [25, 90],
    sealability: 'Excellent',
    seal_temperature_C: 115,
    mechanical_strength_MPa: 24,
    seal_strength_N_per_15mm: 22,
    MAP_suitability: 'Not Recommended',
    cost_index_relative: 2,
    cost_estimate_per_1k_packs_usd: 14.5,
    carbon_index_kgCO2_per_kg: 1.85,
    recyclability: 'Widely Recyclable',
    is_biodegradable: false,
    advantages: [
      'Low cost and exceptional flexibility',
      'Broad heat-sealing temperature window',
      'Good water vapor barrier for general produce',
      'Widely collected in mechanical recycling streams'
    ],
    limitations: [
      'Poor oxygen barrier (high gas permeability)',
      'Low tensile strength against sharp corners',
      'Unsuitable for MAP or vacuum packaging'
    ],
    typical_applications: [
      'Produce bags, bread overwrap, bulk dry grain liners, secondary wrapping'
    ]
  },
  {
    id: 'hdpe',
    name: 'HDPE (High-Density Polyethylene)',
    code: 'HDPE-RIG',
    category: 'Polyolefin',
    structure_layers: 'Monolayer Blown HDPE',
    OTR_cc_m2_day: 1800,
    OTR_range: [1200, 2400],
    WVTR_g_m2_day: 5.5,
    WVTR_range: [3.5, 8.0],
    film_thickness_micron: 50,
    thickness_range: [30, 100],
    sealability: 'Good',
    seal_temperature_C: 132,
    mechanical_strength_MPa: 38,
    seal_strength_N_per_15mm: 26,
    MAP_suitability: 'Not Recommended',
    cost_index_relative: 3,
    cost_estimate_per_1k_packs_usd: 17.0,
    carbon_index_kgCO2_per_kg: 1.95,
    recyclability: 'Widely Recyclable',
    is_biodegradable: false,
    advantages: [
      'Superior moisture barrier compared to LDPE',
      'High tensile stiffness and puncture resistance',
      'Chemical and grease resistance',
      'Full recyclability (Code 2)'
    ],
    limitations: [
      'Milky translucency / haze (poor optical clarity)',
      'Moderate oxygen permeability',
      'Higher seal temperature required'
    ],
    typical_applications: [
      'Cereal box inner liners, milk pouches, bulk pulse sacks, flour packaging'
    ]
  },
  {
    id: 'pet_pe',
    name: 'PET/PE Laminate',
    code: 'PET-PE-LAM',
    category: 'Polyester',
    structure_layers: '12µm Biaxially-Oriented PET / 40µm LDPE Sealant Layer',
    OTR_cc_m2_day: 95,
    OTR_range: [60, 130],
    WVTR_g_m2_day: 4.8,
    WVTR_range: [3.0, 7.5],
    film_thickness_micron: 52,
    thickness_range: [40, 85],
    sealability: 'Very Good',
    seal_temperature_C: 135,
    mechanical_strength_MPa: 95,
    seal_strength_N_per_15mm: 32,
    MAP_suitability: 'Optional',
    cost_index_relative: 4,
    cost_estimate_per_1k_packs_usd: 26.0,
    carbon_index_kgCO2_per_kg: 2.65,
    recyclability: 'Specialty Recycled',
    is_biodegradable: false,
    advantages: [
      'Superb optical clarity and glossy printability',
      'High puncture resistance and tear durability',
      'Reliable hermetic heat seal through PE layer',
      'Moderate barrier to gases and aromas'
    ],
    limitations: [
      'Multi-material laminate requires delamination for recycling',
      'Not suitable for ultra-extended shelf life oxygen-sensitive fats'
    ],
    typical_applications: [
      'Stand-up pouches, dried fruits, candy, pulses, frozen vegetables'
    ]
  },
  {
    id: 'metallized_pet',
    name: 'Metallized PET (Met-PET/PE)',
    code: 'MET-PET',
    category: 'Foil / Metalized',
    structure_layers: '12µm Met-PET (Vacuum Al deposition) / 50µm PE Sealant',
    OTR_cc_m2_day: 1.8,
    OTR_range: [0.8, 3.5],
    WVTR_g_m2_day: 0.9,
    WVTR_range: [0.5, 1.8],
    film_thickness_micron: 62,
    thickness_range: [50, 95],
    sealability: 'Very Good',
    seal_temperature_C: 138,
    mechanical_strength_MPa: 110,
    seal_strength_N_per_15mm: 35,
    MAP_suitability: 'Recommended',
    cost_index_relative: 6,
    cost_estimate_per_1k_packs_usd: 38.0,
    carbon_index_kgCO2_per_kg: 3.10,
    recyclability: 'Specialty Recycled',
    is_biodegradable: false,
    advantages: [
      'Outstanding oxygen barrier (<2 cc/m²/day)',
      'High moisture protection (<1 g/m²/day)',
      'Blocks 99% UV and visible light to prevent rancidity',
      'Reflective metallic sheen with excellent shelf appeal'
    ],
    limitations: [
      'Opaque (product cannot be visually inspected)',
      'Cannot be microwaved due to metal deposit'
    ],
    typical_applications: [
      'Potato chips, roasted nuts, snack foods, ground coffee, spice powders'
    ]
  },
  {
    id: 'aluminum_foil_laminate',
    name: 'Aluminum Foil Laminate (PET/Alu/PE)',
    code: 'ALU-FOIL-TRI',
    category: 'Foil / Metalized',
    structure_layers: '12µm PET / 7µm Aluminum Foil / 60µm LLDPE',
    OTR_cc_m2_day: 0.05,
    OTR_range: [0.01, 0.1],
    WVTR_g_m2_day: 0.04,
    WVTR_range: [0.01, 0.08],
    film_thickness_micron: 79,
    thickness_range: [65, 120],
    sealability: 'Excellent',
    seal_temperature_C: 145,
    mechanical_strength_MPa: 135,
    seal_strength_N_per_15mm: 42,
    MAP_suitability: 'Recommended',
    cost_index_relative: 8,
    cost_estimate_per_1k_packs_usd: 54.0,
    carbon_index_kgCO2_per_kg: 4.80,
    recyclability: 'Non-Recyclable',
    is_biodegradable: false,
    advantages: [
      'Absolute pinhole-free hermetic gas and moisture barrier',
      'Total light transmission block (0% UV/vis)',
      'Enables multi-year dry storage without oxidation',
      'Superb chemical inertness and odor containment'
    ],
    limitations: [
      'High embodied carbon from aluminum smelting',
      'Difficult or impossible to mechanically recycle without specialized delamination',
      'Higher material cost'
    ],
    typical_applications: [
      'Premium roasted coffee beans, pharmaceutical sachets, infant milk formula, MRE rations'
    ]
  },
  {
    id: 'evoh_multilayer',
    name: 'EVOH Multilayer Barrier Film',
    code: 'EVOH-9L',
    category: 'Barrier Multilayer',
    structure_layers: 'PE / Tie / EVOH (Ethylene Vinyl Alcohol) / Tie / PE (7-9 Layer Co-ex)',
    OTR_cc_m2_day: 2.2,
    OTR_range: [0.8, 4.5],
    WVTR_g_m2_day: 2.1,
    WVTR_range: [1.2, 3.8],
    film_thickness_micron: 70,
    thickness_range: [50, 110],
    sealability: 'Very Good',
    seal_temperature_C: 135,
    mechanical_strength_MPa: 68,
    seal_strength_N_per_15mm: 36,
    MAP_suitability: 'Recommended',
    cost_index_relative: 7,
    cost_estimate_per_1k_packs_usd: 46.0,
    carbon_index_kgCO2_per_kg: 2.95,
    recyclability: 'Specialty Recycled',
    is_biodegradable: false,
    advantages: [
      'World-class gas barrier without any metallic foil',
      'Crystal clear transparency for product visibility',
      'Compatible with MAP gas flushes (high CO2/N2 retention)',
      'Thermoformable for rigid and semi-rigid trays'
    ],
    limitations: [
      'EVOH gas barrier degrades if exposed to direct water (requires moisture-barrier outer PE layers)',
      'Requires specialized co-extrusion blown line'
    ],
    typical_applications: [
      'Fresh meat cuts, poultry, fresh pasta, sliced deli meats, refrigerated cheeses'
    ]
  },
  {
    id: 'pa_pe_vacuum',
    name: 'PA/PE Vacuum Skin Film (Polyamide/Polyethylene)',
    code: 'PA-PE-VAC',
    category: 'Barrier Multilayer',
    structure_layers: '20µm BOPA (Nylon) / Tie / 70µm PE Sealant',
    OTR_cc_m2_day: 35,
    OTR_range: [20, 50],
    WVTR_g_m2_day: 3.2,
    WVTR_range: [2.0, 5.0],
    film_thickness_micron: 90,
    thickness_range: [60, 140],
    sealability: 'Excellent',
    seal_temperature_C: 140,
    mechanical_strength_MPa: 145,
    seal_strength_N_per_15mm: 48,
    MAP_suitability: 'Recommended',
    cost_index_relative: 6,
    cost_estimate_per_1k_packs_usd: 42.0,
    carbon_index_kgCO2_per_kg: 3.40,
    recyclability: 'Specialty Recycled',
    is_biodegradable: false,
    advantages: [
      'Exceptional puncture resistance against bones and sharp frozen edges',
      'Deep thermoform draw ratio with zero pinholes',
      'Tight skin-pack contours reducing headspace purge',
      'High freeze-thaw flex crack resistance'
    ],
    limitations: [
      'Nylon absorbs humidity, causing slight dimensional flex',
      'Higher weight per square meter'
    ],
    typical_applications: [
      'Vacuum packed fresh paneer, bone-in poultry, fresh fish fillets, frozen meat blocks'
    ]
  },
  {
    id: 'micro_perforated_film',
    name: 'Micro-Perforated Equilibrium Film',
    code: 'MICRO-PERF-PP',
    category: 'Polyolefin',
    structure_layers: '30µm BOPP with Laser-Drilled 50-100µm Micro-holes',
    OTR_cc_m2_day: 12000,
    OTR_range: [6000, 25000],
    WVTR_g_m2_day: 65.0,
    WVTR_range: [40.0, 110.0],
    film_thickness_micron: 32,
    thickness_range: [25, 45],
    sealability: 'Good',
    seal_temperature_C: 125,
    mechanical_strength_MPa: 120,
    seal_strength_N_per_15mm: 20,
    MAP_suitability: 'Recommended',
    cost_index_relative: 5,
    cost_estimate_per_1k_packs_usd: 29.0,
    carbon_index_kgCO2_per_kg: 2.10,
    recyclability: 'Widely Recyclable',
    is_biodegradable: false,
    advantages: [
      'Tailored gas exchange prevents anaerobic fermentation in high-respiring produce',
      'Regulates moisture vapor transmission to prevent condensation fogging',
      'Prevents product decay from suffocation',
      'Mono-material PP allows clean mechanical recycling'
    ],
    limitations: [
      'Zero barrier against external odors or microbes if holes are too coarse',
      'Completely unsuitable for dry, oily, or shelf-stable foods'
    ],
    typical_applications: [
      'Fresh strawberries, baby spinach, fresh button mushrooms, broccoli florets, asparagus'
    ]
  },
  {
    id: 'breathable_film',
    name: 'Breathable Selective Membrane Film',
    code: 'BREATH-PE',
    category: 'Polyolefin',
    structure_layers: 'Microporous Calcium Carbonate Filled PE Membrane',
    OTR_cc_m2_day: 7500,
    OTR_range: [4500, 12000],
    WVTR_g_m2_day: 42.0,
    WVTR_range: [25.0, 65.0],
    film_thickness_micron: 35,
    thickness_range: [25, 55],
    sealability: 'Fair',
    seal_temperature_C: 120,
    mechanical_strength_MPa: 42,
    seal_strength_N_per_15mm: 18,
    MAP_suitability: 'Recommended',
    cost_index_relative: 4,
    cost_estimate_per_1k_packs_usd: 24.0,
    carbon_index_kgCO2_per_kg: 1.90,
    recyclability: 'Widely Recyclable',
    is_biodegradable: false,
    advantages: [
      'Continuous selective diffusion without macroscopic holes',
      'Allows excess moisture vapor out while maintaining controlled O2/CO2 balance',
      'Prevents insect and dust intrusion'
    ],
    limitations: [
      'Moderate tensile strength and tear propagation',
      'Semi-opaque chalky appearance'
    ],
    typical_applications: [
      'Fresh tomatoes, green capsicum, grapes, mangoes in transit'
    ]
  },
  {
    id: 'biodegradable_pla_pbat',
    name: 'Biodegradable Compostable Film (PLA / PBAT)',
    code: 'BIO-PLA-PBAT',
    category: 'Biodegradable',
    structure_layers: 'Bio-based Polylactic Acid (PLA) / Polybutyrate Adipate Terephthalate (PBAT) Blend',
    OTR_cc_m2_day: 450,
    OTR_range: [250, 800],
    WVTR_g_m2_day: 35.0,
    WVTR_range: [20.0, 55.0],
    film_thickness_micron: 40,
    thickness_range: [25, 75],
    sealability: 'Good',
    seal_temperature_C: 110,
    mechanical_strength_MPa: 34,
    seal_strength_N_per_15mm: 22,
    MAP_suitability: 'Optional',
    cost_index_relative: 6,
    cost_estimate_per_1k_packs_usd: 39.0,
    carbon_index_kgCO2_per_kg: 1.15,
    recyclability: 'Industrial Compostable',
    is_biodegradable: true,
    advantages: [
      '100% certified industrially compostable (EN 13432 / ASTM D6400)',
      'Substantially reduced fossil-fuel polymer footprint (-60%)',
      'Naturally breathable for fresh farm produce',
      'Zero microplastic persistence in soil'
    ],
    limitations: [
      'Low moisture barrier (WVTR ~35 g/m²/day) accelerates staling in dry snacks',
      'Limited heat resistance (<50°C)',
      'Must not contaminate conventional mechanical PE/PET recycling bins'
    ],
    typical_applications: [
      'Organic farm produce, artisanal bakery, dry pulses short-chain distribution'
    ]
  },
  {
    id: 'paper_ldpe_laminate',
    name: 'Paper-LDPE Barrier Pouch',
    code: 'PAP-LDPE',
    category: 'Bio-based / Paper',
    structure_layers: '60 gsm Bleached Kraft Paper / 20µm LDPE Extrusion Coating',
    OTR_cc_m2_day: 850,
    OTR_range: [500, 1400],
    WVTR_g_m2_day: 8.5,
    WVTR_range: [5.0, 14.0],
    film_thickness_micron: 85,
    thickness_range: [60, 110],
    sealability: 'Good',
    seal_temperature_C: 125,
    mechanical_strength_MPa: 55,
    seal_strength_N_per_15mm: 24,
    MAP_suitability: 'Not Recommended',
    cost_index_relative: 4,
    cost_estimate_per_1k_packs_usd: 25.0,
    carbon_index_kgCO2_per_kg: 1.45,
    recyclability: 'Specialty Recycled',
    is_biodegradable: false,
    advantages: [
      'Renewable wood fiber exterior with natural rustic tactile aesthetic',
      'Opaque barrier protecting light-sensitive compounds',
      'Internal LDPE layer prevents oil bleed-through and ensures heat sealing'
    ],
    limitations: [
      'Paper fibers lose rigidity in high condensation or liquid leaks',
      'Moderate barrier unsuitable for prolonged meat or wet dairy storage'
    ],
    typical_applications: [
      'Flour sacks, artisanal pulses, tea leaves, bakery items, dry spices'
    ]
  },
  {
    id: 'bopp_opp',
    name: 'BOPP (Biaxially Oriented Polypropylene)',
    code: 'BOPP-STD',
    category: 'Polyolefin',
    structure_layers: 'Biaxially Oriented Monolayer Polypropylene',
    OTR_cc_m2_day: 1500,
    OTR_range: [1000, 2200],
    WVTR_g_m2_day: 4.2,
    WVTR_range: [2.5, 6.5],
    film_thickness_micron: 30,
    thickness_range: [20, 50],
    sealability: 'Fair',
    seal_temperature_C: 130,
    mechanical_strength_MPa: 140,
    seal_strength_N_per_15mm: 19,
    MAP_suitability: 'Optional',
    cost_index_relative: 3,
    cost_estimate_per_1k_packs_usd: 18.5,
    carbon_index_kgCO2_per_kg: 1.90,
    recyclability: 'Widely Recyclable',
    is_biodegradable: false,
    advantages: [
      'Crystal-clear clarity and gloss for attractive presentation',
      'Excellent moisture barrier at minimal thickness',
      'High tensile strength and dimensional stability'
    ],
    limitations: [
      'Narrow heat seal window without co-extruded seal layer',
      'Moderate oxygen barrier'
    ],
    typical_applications: [
      'Biscuits, dry pasta overwrap, confectionery, crisp wraps'
    ]
  },
  {
    id: 'microperforated_bopp',
    name: 'Laser Micro-Perforated Anti-Fog BOPP',
    code: 'BOPP-AF-MP',
    category: 'Polyolefin',
    structure_layers: '30µm BOPP / Antifog Surfactant / 60µm Laser Micro-Holes',
    OTR_cc_m2_day: 12000,
    OTR_range: [8000, 20000],
    WVTR_g_m2_day: 45.0,
    WVTR_range: [30.0, 70.0],
    film_thickness_micron: 30,
    thickness_range: [25, 45],
    sealability: 'Good',
    seal_temperature_C: 125,
    mechanical_strength_MPa: 130,
    seal_strength_N_per_15mm: 22,
    MAP_suitability: 'Recommended',
    cost_index_relative: 3,
    cost_estimate_per_1k_packs_usd: 21.0,
    carbon_index_kgCO2_per_kg: 1.95,
    recyclability: 'Widely Recyclable',
    is_biodegradable: false,
    advantages: [
      'Equilibrium modified atmosphere (EMAP) prevents anaerobic rot',
      'Anti-fog surfactant coating prevents droplet condensation and sweating',
      'Keeps freshly harvested fruits and berries crisp and firm'
    ],
    limitations: [
      'Micro-perforations make it unsuitable for moisture-sensitive dry snacks',
      'Cannot hold nitrogen gas without leakage'
    ],
    typical_applications: [
      'Fresh Strawberries, baby spinach, cherry tomatoes, exotic mushrooms, cut salad greens'
    ]
  },
  {
    id: 'bope_mono_pe',
    name: 'Circular Mono-Material Barrier Pouch (BOPE/PE)',
    code: 'MONO-PE-REC',
    category: 'Polyolefin',
    structure_layers: '25µm BOPE / Solventless Primer / 50µm Low-Seal MDO-PE',
    OTR_cc_m2_day: 12.0,
    OTR_range: [5.0, 25.0],
    WVTR_g_m2_day: 1.2,
    WVTR_range: [0.8, 2.0],
    film_thickness_micron: 75,
    thickness_range: [60, 95],
    sealability: 'Excellent',
    seal_temperature_C: 118,
    mechanical_strength_MPa: 110,
    seal_strength_N_per_15mm: 42,
    MAP_suitability: 'Recommended',
    cost_index_relative: 4,
    cost_estimate_per_1k_packs_usd: 28.0,
    carbon_index_kgCO2_per_kg: 2.10,
    recyclability: 'Widely Recyclable',
    is_biodegradable: false,
    advantages: [
      '100% Recyclable in standard Polyethylene Stream (Code 4 / PE Circular Economy)',
      'High moisture and gas barrier matching traditional non-recyclable multi-layers',
      'Hermetic heat seal with metallocene PE layer'
    ],
    limitations: [
      'Higher material raw resin cost (+15-20% vs unoriented PE)',
      'Requires precise sealing temperature control'
    ],
    typical_applications: [
      'Premium coffee, roasted nuts, muesli, pet food, frozen foods, organic namkeen'
    ]
  },
  {
    id: 'alox_siox_clear_barrier',
    name: 'AlOx / SiOx Coated Transparent High-Barrier PET',
    code: 'PET-ALOX-CLR',
    category: 'Polyester',
    structure_layers: '12µm AlOx-Coated PET / 50µm Cast Polypropylene (CPP)',
    OTR_cc_m2_day: 1.5,
    OTR_range: [0.8, 3.0],
    WVTR_g_m2_day: 1.1,
    WVTR_range: [0.6, 2.2],
    film_thickness_micron: 62,
    thickness_range: [50, 85],
    sealability: 'Very Good',
    seal_temperature_C: 140,
    mechanical_strength_MPa: 125,
    seal_strength_N_per_15mm: 36,
    MAP_suitability: 'Recommended',
    cost_index_relative: 5,
    cost_estimate_per_1k_packs_usd: 34.0,
    carbon_index_kgCO2_per_kg: 2.80,
    recyclability: 'Specialty Recycled',
    is_biodegradable: false,
    advantages: [
      'Glass-like transparency allowing consumers to inspect food quality',
      'Extreme oxygen and aroma barrier matching aluminum foil',
      'Microwave safe and passes through industrial metal detectors'
    ],
    limitations: [
      'Inorganic ceramic coating is susceptible to micro-cracks under severe flexing',
      'Higher cost than vacuum metalized film'
    ],
    typical_applications: [
      'Ready meals, pasteurized gravies, infant cereals, sensitive dried fruits, processed cheese'
    ]
  },
  {
    id: 'retort_pouch_multilayer',
    name: 'High-Performance Retort Pouch (PET/Alu/R-CPP)',
    code: 'RETORT-4PLY',
    category: 'Foil / Metalized',
    structure_layers: '12µm PET / 15µm BOPA (Nylon) / 9µm AluFoil / 70µm Retort Cast PP',
    OTR_cc_m2_day: 0.05,
    OTR_range: [0.01, 0.1],
    WVTR_g_m2_day: 0.05,
    WVTR_range: [0.01, 0.1],
    film_thickness_micron: 106,
    thickness_range: [90, 130],
    sealability: 'Excellent',
    seal_temperature_C: 185,
    mechanical_strength_MPa: 165,
    seal_strength_N_per_15mm: 55,
    MAP_suitability: 'Recommended',
    cost_index_relative: 5,
    cost_estimate_per_1k_packs_usd: 48.0,
    carbon_index_kgCO2_per_kg: 6.80,
    recyclability: 'Non-Recyclable',
    is_biodegradable: false,
    advantages: [
      'Withstands high-pressure steam autoclaving / retorting at 121°C for 30 minutes',
      'Enables 24-36 months ambient shelf-life without refrigeration or chemical preservatives',
      'Absolute gas, light, moisture, and microbial hermetic barrier'
    ],
    limitations: [
      'Multi-material laminate cannot be recycled in mechanical streams',
      'Requires industrial retort chamber processing equipment'
    ],
    typical_applications: [
      'Ready-to-eat ambient curries, cooked dal makhani, military MRE rations, paneer butter masala, pet wet meals'
    ]
  },
  {
    id: 'natureflex_cellulose',
    name: 'NatureFlex™ Renewable Cellulose Bio-Film',
    code: 'BIO-CELL-NAT',
    category: 'Biodegradable',
    structure_layers: 'Transparent NatureFlex Bio-Barrier / Plant-based Sealant',
    OTR_cc_m2_day: 5.0,
    OTR_range: [3.0, 12.0],
    WVTR_g_m2_day: 5.5,
    WVTR_range: [3.0, 9.0],
    film_thickness_micron: 35,
    thickness_range: [25, 45],
    sealability: 'Good',
    seal_temperature_C: 110,
    mechanical_strength_MPa: 85,
    seal_strength_N_per_15mm: 20,
    MAP_suitability: 'Optional',
    cost_index_relative: 4,
    cost_estimate_per_1k_packs_usd: 31.0,
    carbon_index_kgCO2_per_kg: 0.95,
    recyclability: 'Home Compostable',
    is_biodegradable: true,
    advantages: [
      'Home compostable certified (TÜV OK Compost HOME) and marine degradable',
      'Derived from sustainably managed FSC wood pulp with 70% lower carbon footprint',
      'Excellent aroma barrier and dead-fold twist property for confectionery'
    ],
    limitations: [
      'Permeability increases in continuous tropical rain humidity (>90% RH)',
      'Cannot be sealed at excessive jaw temperatures'
    ],
    typical_applications: [
      'Artisanal chocolates, organic tea bags, premium dried herbs, natural snack bars'
    ]
  },
  {
    id: 'rpet_thermoformed_tray',
    name: 'Recycled rPET Thermoformed Clamshell & Pad',
    code: 'RPET-TRAY-80',
    category: 'Polyester',
    structure_layers: '80% Post-Consumer Recycled rPET Sheet / Absorbent Pulp Pad',
    OTR_cc_m2_day: 450,
    OTR_range: [300, 700],
    WVTR_g_m2_day: 12.0,
    WVTR_range: [8.0, 18.0],
    film_thickness_micron: 280,
    thickness_range: [200, 350],
    sealability: 'Good',
    seal_temperature_C: 145,
    mechanical_strength_MPa: 65,
    seal_strength_N_per_15mm: 28,
    MAP_suitability: 'Optional',
    cost_index_relative: 3,
    cost_estimate_per_1k_packs_usd: 24.0,
    carbon_index_kgCO2_per_kg: 1.40,
    recyclability: 'Widely Recyclable',
    is_biodegradable: false,
    advantages: [
      'Diverts post-consumer plastic bottles directly away from oceans and landfills',
      'Rigid crush-proof walls protect fragile soft berries during transport bumps',
      'Vented micro-slots permit rapid cold air penetration in cooling pre-chambers'
    ],
    limitations: [
      'Heavier tare weight than flexible pouches',
      'Requires nesting space during bulk warehousing'
    ],
    typical_applications: [
      'Fresh strawberries, raspberries, grapes, cherry tomatoes, sliced melon trays'
    ]
  }
];

export let PACKAGING_MATERIALS: PackagingMaterial[] = [...DEFAULT_PACKAGING_MATERIALS];

export function getStoredMaterials(): PackagingMaterial[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem('packwise_materials_registry');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load materials from localStorage', e);
  }
  return [...DEFAULT_PACKAGING_MATERIALS];
}

export function savePackagingMaterial(newMat: PackagingMaterial): void {
  const current = getStoredMaterials();
  const existingIdx = current.findIndex((m) => m.id === newMat.id);
  if (existingIdx >= 0) {
    current[existingIdx] = newMat;
  } else {
    current.push(newMat);
  }
  syncMaterials(current);
}

export function updatePackagingMaterial(updatedMat: PackagingMaterial): void {
  savePackagingMaterial(updatedMat);
}

export function deletePackagingMaterial(materialId: string): void {
  const current = getStoredMaterials();
  const filtered = current.filter((m) => m.id !== materialId);
  syncMaterials(filtered);
}

export function resetPackagingMaterials(): void {
  syncMaterials([...DEFAULT_PACKAGING_MATERIALS]);
}

function syncMaterials(list: PackagingMaterial[]) {
  PACKAGING_MATERIALS.length = 0;
  PACKAGING_MATERIALS.push(...list);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('packwise_materials_registry', JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Failed to save materials to localStorage', e);
  }
}

// Hydrate on module load in browser
if (typeof window !== 'undefined') {
  try {
    const stored = getStoredMaterials();
    PACKAGING_MATERIALS.length = 0;
    PACKAGING_MATERIALS.push(...stored);
  } catch {}
}
