import { Commodity } from '../types/packaging';

/**
 * Trained & extracted directly from the user's uploaded 20,000-row dataset:
 * (synthetic_food_packaging_dataset_20000_v5.csv)
 * Total Commodities: 89 real food items
 */
export const COMMODITIES_DATABASE: Commodity[] = [
  {
    "id": "comm_almonds",
    "name": "Almonds",
    "category": "Nuts",
    "icon": "🌰",
    "moisture_percent": 5.0,
    "pH": 5.82,
    "fat_percent": 32.9,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 256,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (238 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_apple",
    "name": "Apple",
    "category": "Fresh fruits",
    "icon": "🍎",
    "moisture_percent": 86.9,
    "pH": 5.09,
    "fat_percent": 0.7,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 80,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 42,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (221 samples). Top material: Breathable Film."
  },
  {
    "id": "comm_apple_juice",
    "name": "Apple Juice",
    "category": "Fresh fruits",
    "icon": "🧃",
    "moisture_percent": 0.5,
    "pH": 6.4,
    "fat_percent": 98.7,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 328,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (218 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_banana",
    "name": "Banana",
    "category": "Fresh fruits",
    "icon": "🍌",
    "moisture_percent": 87.5,
    "pH": 4.8,
    "fat_percent": 1.5,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 118,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (230 samples). Top material: LDPE."
  },
  {
    "id": "comm_barley",
    "name": "Barley",
    "category": "Grains",
    "icon": "🌾",
    "moisture_percent": 7.0,
    "pH": 6.67,
    "fat_percent": 30.7,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 249,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (232 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_beef",
    "name": "Beef",
    "category": "Meat",
    "icon": "🥩",
    "moisture_percent": 72.9,
    "pH": 5.75,
    "fat_percent": 6.8,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 29,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (235 samples). Top material: LDPE."
  },
  {
    "id": "comm_beetroot",
    "name": "Beetroot",
    "category": "Fresh vegetables",
    "icon": "🟣",
    "moisture_percent": 74.3,
    "pH": 6.18,
    "fat_percent": 1.7,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 68,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (203 samples). Top material: LDPE."
  },
  {
    "id": "comm_bell_pepper",
    "name": "Bell Pepper",
    "category": "Fresh vegetables",
    "icon": "🫑",
    "moisture_percent": 82.2,
    "pH": 6.75,
    "fat_percent": 0.6,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 115,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (218 samples). Top material: LDPE."
  },
  {
    "id": "comm_biscuits",
    "name": "Biscuits",
    "category": "Snacks",
    "icon": "🍪",
    "moisture_percent": 11.2,
    "pH": 5.3,
    "fat_percent": 16.4,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 80,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 272,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (222 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_bread",
    "name": "Bread",
    "category": "Snacks",
    "icon": "🍞",
    "moisture_percent": 13.1,
    "pH": 5.6,
    "fat_percent": 0.8,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 3,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 282,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (202 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_broccoli",
    "name": "Broccoli",
    "category": "Fresh vegetables",
    "icon": "🥦",
    "moisture_percent": 82.4,
    "pH": 5.49,
    "fat_percent": 1.6,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 80,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 78,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (228 samples). Top material: LDPE."
  },
  {
    "id": "comm_butter",
    "name": "Butter",
    "category": "Dairy",
    "icon": "🧈",
    "moisture_percent": 29.3,
    "pH": 7.09,
    "fat_percent": 73.8,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 76,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 295,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (236 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_cabbage",
    "name": "Cabbage",
    "category": "Fresh vegetables",
    "icon": "🥬",
    "moisture_percent": 92.5,
    "pH": 4.83,
    "fat_percent": 0.1,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 56,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (278 samples). Top material: Micro-perforated Film."
  },
  {
    "id": "comm_cake",
    "name": "Cake",
    "category": "Snacks",
    "icon": "🍰",
    "moisture_percent": 4.1,
    "pH": 5.88,
    "fat_percent": 40.0,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 243,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (204 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_carrot",
    "name": "Carrot",
    "category": "Fresh vegetables",
    "icon": "🥕",
    "moisture_percent": 70.6,
    "pH": 5.56,
    "fat_percent": 0.9,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 3,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 13,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (217 samples). Top material: LDPE."
  },
  {
    "id": "comm_cashews",
    "name": "Cashews",
    "category": "Nuts",
    "icon": "🥠",
    "moisture_percent": 7.3,
    "pH": 6.24,
    "fat_percent": 41.2,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 75,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 142,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (228 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_cauliflower",
    "name": "Cauliflower",
    "category": "Fresh vegetables",
    "icon": "🥗",
    "moisture_percent": 74.6,
    "pH": 3.7,
    "fat_percent": 0.6,
    "respiration_rate": "Very High",
    "respiration_mg_CO2_kg_hr": 85,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 74,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (217 samples). Top material: Micro-perforated Film."
  },
  {
    "id": "comm_cereal",
    "name": "Cereal",
    "category": "Grains",
    "icon": "🧇",
    "moisture_percent": 4.1,
    "pH": 6.82,
    "fat_percent": 9.2,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 86,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (237 samples). Top material: EVOH Multilayer."
  },
  {
    "id": "comm_cheese",
    "name": "Cheese",
    "category": "Dairy",
    "icon": "🧀",
    "moisture_percent": 86.2,
    "pH": 4.58,
    "fat_percent": 54.7,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 76,
    "storage_type": "Ambient",
    "typical_shelf_life_days": 103,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (229 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_chicken",
    "name": "Chicken",
    "category": "Meat",
    "icon": "🍗",
    "moisture_percent": 61.1,
    "pH": 6.37,
    "fat_percent": 34.8,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 80,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 29,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (231 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_chickpeas",
    "name": "Chickpeas",
    "category": "Fresh vegetables",
    "icon": "🧆",
    "moisture_percent": 14.6,
    "pH": 6.98,
    "fat_percent": 36.6,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 222,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (206 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_chocolate",
    "name": "Chocolate",
    "category": "Processed foods",
    "icon": "🍫",
    "moisture_percent": 6.7,
    "pH": 6.59,
    "fat_percent": 8.2,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 123,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (215 samples). Top material: PET."
  },
  {
    "id": "comm_cocoa_powder",
    "name": "Cocoa Powder",
    "category": "Processed foods",
    "icon": "☕",
    "moisture_percent": 6.9,
    "pH": 5.96,
    "fat_percent": 15.2,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 200,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (224 samples). Top material: PET."
  },
  {
    "id": "comm_coconut_milk",
    "name": "Coconut Milk",
    "category": "Dairy",
    "icon": "🥥",
    "moisture_percent": 0.3,
    "pH": 6.56,
    "fat_percent": 98.1,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 197,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (215 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_coffee_powder",
    "name": "Coffee Powder",
    "category": "Processed foods",
    "icon": "♨️",
    "moisture_percent": 14.6,
    "pH": 7.09,
    "fat_percent": 29.9,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 76,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 324,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (211 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_cream",
    "name": "Cream",
    "category": "Dairy",
    "icon": "🧁",
    "moisture_percent": 75.9,
    "pH": 4.02,
    "fat_percent": 30.1,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 75,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 288,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (234 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_cucumber",
    "name": "Cucumber",
    "category": "Fresh vegetables",
    "icon": "🥒",
    "moisture_percent": 72.9,
    "pH": 3.22,
    "fat_percent": 1.9,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 20,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (243 samples). Top material: LDPE."
  },
  {
    "id": "comm_eggplant",
    "name": "Eggplant",
    "category": "Fresh vegetables",
    "icon": "🍆",
    "moisture_percent": 93.5,
    "pH": 4.25,
    "fat_percent": 0.2,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 27,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (218 samples). Top material: LDPE."
  },
  {
    "id": "comm_eggs",
    "name": "Eggs",
    "category": "Meat",
    "icon": "🥚",
    "moisture_percent": 78.6,
    "pH": 6.97,
    "fat_percent": 23.9,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 48,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (223 samples). Top material: LDPE."
  },
  {
    "id": "comm_fish",
    "name": "Fish",
    "category": "Seafood",
    "icon": "🐟",
    "moisture_percent": 60.2,
    "pH": 5.87,
    "fat_percent": 25.9,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 80,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 55,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (245 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_fruit_juice",
    "name": "Fruit Juice",
    "category": "Processed foods",
    "icon": "🍹",
    "moisture_percent": 0.3,
    "pH": 6.2,
    "fat_percent": 97.9,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 301,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (219 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_garlic",
    "name": "Garlic",
    "category": "Fresh vegetables",
    "icon": "🧄",
    "moisture_percent": 92.5,
    "pH": 5.46,
    "fat_percent": 1.0,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 118,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (231 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_grapes",
    "name": "Grapes",
    "category": "Fresh fruits",
    "icon": "🍇",
    "moisture_percent": 74.1,
    "pH": 4.2,
    "fat_percent": 1.4,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 23,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (229 samples). Top material: LDPE."
  },
  {
    "id": "comm_green_beans",
    "name": "Green Beans",
    "category": "Grains",
    "icon": "🫛",
    "moisture_percent": 77.9,
    "pH": 6.79,
    "fat_percent": 1.3,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 107,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (226 samples). Top material: LDPE."
  },
  {
    "id": "comm_guava",
    "name": "Guava",
    "category": "Fresh fruits",
    "icon": "🍏",
    "moisture_percent": 87.2,
    "pH": 6.49,
    "fat_percent": 2.0,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 77,
    "storage_type": "Ambient",
    "typical_shelf_life_days": 84,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (209 samples). Top material: Breathable Film."
  },
  {
    "id": "comm_honey",
    "name": "Honey",
    "category": "Processed foods",
    "icon": "🍯",
    "moisture_percent": 0.2,
    "pH": 6.91,
    "fat_percent": 99.4,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 246,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (215 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_ice_cream",
    "name": "Ice Cream",
    "category": "Dairy",
    "icon": "🍨",
    "moisture_percent": 56.3,
    "pH": 6.92,
    "fat_percent": 17.6,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 80,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 69,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (208 samples). Top material: HDPE."
  },
  {
    "id": "comm_instant_noodles",
    "name": "Instant Noodles",
    "category": "Processed foods",
    "icon": "🍜",
    "moisture_percent": 14.7,
    "pH": 5.21,
    "fat_percent": 23.0,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 149,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (226 samples). Top material: PET."
  },
  {
    "id": "comm_jam",
    "name": "Jam",
    "category": "Processed foods",
    "icon": "🍒",
    "moisture_percent": 0.1,
    "pH": 6.26,
    "fat_percent": 97.9,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 78,
    "storage_type": "Ambient",
    "typical_shelf_life_days": 257,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (229 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_kidney_beans",
    "name": "Kidney Beans",
    "category": "Grains",
    "icon": "🫘",
    "moisture_percent": 3.4,
    "pH": 5.07,
    "fat_percent": 12.5,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 252,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (229 samples). Top material: PET."
  },
  {
    "id": "comm_kiwi",
    "name": "Kiwi",
    "category": "Fresh fruits",
    "icon": "🥝",
    "moisture_percent": 93.0,
    "pH": 4.44,
    "fat_percent": 0.8,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 98,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (242 samples). Top material: Micro-perforated Film."
  },
  {
    "id": "comm_lentils",
    "name": "Lentils",
    "category": "Grains",
    "icon": "🍲",
    "moisture_percent": 3.0,
    "pH": 6.15,
    "fat_percent": 19.3,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 75,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 94,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (239 samples). Top material: PET."
  },
  {
    "id": "comm_maize_flour",
    "name": "Maize Flour",
    "category": "Grains",
    "icon": "🌮",
    "moisture_percent": 13.7,
    "pH": 5.99,
    "fat_percent": 48.5,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 75,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 249,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (224 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_mango",
    "name": "Mango",
    "category": "Fresh fruits",
    "icon": "🥭",
    "moisture_percent": 90.6,
    "pH": 5.8,
    "fat_percent": 1.4,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 31,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (227 samples). Top material: LDPE."
  },
  {
    "id": "comm_mayonnaise",
    "name": "Mayonnaise",
    "category": "Processed foods",
    "icon": "🍶",
    "moisture_percent": 0.2,
    "pH": 6.75,
    "fat_percent": 98.2,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 243,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (242 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_milk",
    "name": "Milk",
    "category": "Dairy",
    "icon": "🥛",
    "moisture_percent": 43.0,
    "pH": 4.53,
    "fat_percent": 45.2,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 76,
    "storage_type": "Ambient",
    "typical_shelf_life_days": 110,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (187 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_milk_powder",
    "name": "Milk Powder",
    "category": "Dairy",
    "icon": "🍼",
    "moisture_percent": 12.5,
    "pH": 6.08,
    "fat_percent": 39.0,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 76,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 144,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (205 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_mushroom",
    "name": "Mushroom",
    "category": "Fresh vegetables",
    "icon": "🍄",
    "moisture_percent": 88.0,
    "pH": 6.71,
    "fat_percent": 0.7,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 26,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (209 samples). Top material: LDPE."
  },
  {
    "id": "comm_mutton",
    "name": "Mutton",
    "category": "Meat",
    "icon": "🍖",
    "moisture_percent": 76.8,
    "pH": 5.8,
    "fat_percent": 21.8,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 17,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (241 samples). Top material: LDPE."
  },
  {
    "id": "comm_oats",
    "name": "Oats",
    "category": "Grains",
    "icon": "🥣",
    "moisture_percent": 3.8,
    "pH": 6.17,
    "fat_percent": 34.7,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Cold Chain",
    "typical_shelf_life_days": 132,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (208 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_olive_oil",
    "name": "Olive Oil",
    "category": "Processed foods",
    "icon": "🫒",
    "moisture_percent": 0.3,
    "pH": 6.89,
    "fat_percent": 99.5,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 76,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 198,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (198 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_onion",
    "name": "Onion",
    "category": "Fresh vegetables",
    "icon": "🧅",
    "moisture_percent": 87.6,
    "pH": 3.21,
    "fat_percent": 1.4,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 121,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (248 samples). Top material: LDPE."
  },
  {
    "id": "comm_orange",
    "name": "Orange",
    "category": "Fresh fruits",
    "icon": "🍊",
    "moisture_percent": 76.6,
    "pH": 5.46,
    "fat_percent": 0.4,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 108,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (240 samples). Top material: HDPE."
  },
  {
    "id": "comm_orange_juice",
    "name": "Orange Juice",
    "category": "Fresh fruits",
    "icon": "🍸",
    "moisture_percent": 0.2,
    "pH": 5.99,
    "fat_percent": 98.8,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 75,
    "storage_type": "Ambient",
    "typical_shelf_life_days": 269,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (228 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_paneer",
    "name": "Paneer",
    "category": "Dairy",
    "icon": "🫓",
    "moisture_percent": 38.9,
    "pH": 5.12,
    "fat_percent": 58.8,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 43,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (259 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_papaya",
    "name": "Papaya",
    "category": "Fresh fruits",
    "icon": "🍈",
    "moisture_percent": 87.3,
    "pH": 4.31,
    "fat_percent": 0.1,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Ambient",
    "typical_shelf_life_days": 100,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (218 samples). Top material: HDPE."
  },
  {
    "id": "comm_pasta",
    "name": "Pasta",
    "category": "Processed foods",
    "icon": "🍝",
    "moisture_percent": 3.3,
    "pH": 6.86,
    "fat_percent": 9.6,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 210,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (237 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_peach",
    "name": "Peach",
    "category": "Fresh fruits",
    "icon": "🍑",
    "moisture_percent": 69.8,
    "pH": 3.41,
    "fat_percent": 1.4,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Cold Chain",
    "typical_shelf_life_days": 84,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (235 samples). Top material: HDPE."
  },
  {
    "id": "comm_peanut_butter",
    "name": "Peanut Butter",
    "category": "Dairy",
    "icon": "🥪",
    "moisture_percent": 0.2,
    "pH": 5.76,
    "fat_percent": 99.4,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 75,
    "storage_type": "Ambient",
    "typical_shelf_life_days": 311,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (226 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_peanuts",
    "name": "Peanuts",
    "category": "Nuts",
    "icon": "🥜",
    "moisture_percent": 7.5,
    "pH": 5.87,
    "fat_percent": 38.4,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 186,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (211 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_pear",
    "name": "Pear",
    "category": "Fresh fruits",
    "icon": "🍐",
    "moisture_percent": 78.3,
    "pH": 5.47,
    "fat_percent": 1.3,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 75,
    "storage_type": "Ambient",
    "typical_shelf_life_days": 43,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (235 samples). Top material: HDPE."
  },
  {
    "id": "comm_peas",
    "name": "Peas",
    "category": "Fresh vegetables",
    "icon": "🟢",
    "moisture_percent": 75.0,
    "pH": 5.32,
    "fat_percent": 0.4,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 83,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (202 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_pickle",
    "name": "Pickle",
    "category": "Processed foods",
    "icon": "🫙",
    "moisture_percent": 0.3,
    "pH": 6.02,
    "fat_percent": 99.5,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 186,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (215 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_pineapple",
    "name": "Pineapple",
    "category": "Fresh fruits",
    "icon": "🍍",
    "moisture_percent": 73.8,
    "pH": 5.14,
    "fat_percent": 0.5,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 76,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 92,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (214 samples). Top material: Micro-perforated Film."
  },
  {
    "id": "comm_pomegranate",
    "name": "Pomegranate",
    "category": "Processed foods",
    "icon": "🫐",
    "moisture_percent": 77.9,
    "pH": 3.75,
    "fat_percent": 1.3,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 78,
    "storage_type": "Cold Chain",
    "typical_shelf_life_days": 77,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (227 samples). Top material: LDPE."
  },
  {
    "id": "comm_popcorn",
    "name": "Popcorn",
    "category": "Fresh vegetables",
    "icon": "🍿",
    "moisture_percent": 8.3,
    "pH": 6.58,
    "fat_percent": 19.3,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 270,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (240 samples). Top material: EVOH Multilayer."
  },
  {
    "id": "comm_potato",
    "name": "Potato",
    "category": "Fresh vegetables",
    "icon": "🥔",
    "moisture_percent": 95.8,
    "pH": 3.66,
    "fat_percent": 1.2,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 24,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (236 samples). Top material: LDPE."
  },
  {
    "id": "comm_potato_chips",
    "name": "Potato Chips",
    "category": "Fresh vegetables",
    "icon": "🍟",
    "moisture_percent": 12.4,
    "pH": 7.05,
    "fat_percent": 32.8,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 75,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (222 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_quinoa",
    "name": "Quinoa",
    "category": "Processed foods",
    "icon": "🥘",
    "moisture_percent": 4.0,
    "pH": 6.82,
    "fat_percent": 27.5,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 74,
    "storage_type": "Ambient",
    "typical_shelf_life_days": 88,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (231 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_rice",
    "name": "Rice",
    "category": "Grains",
    "icon": "🍚",
    "moisture_percent": 4.7,
    "pH": 5.91,
    "fat_percent": 12.0,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 105,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (205 samples). Top material: PET."
  },
  {
    "id": "comm_sausage",
    "name": "Sausage",
    "category": "Meat",
    "icon": "🌭",
    "moisture_percent": 79.8,
    "pH": 5.62,
    "fat_percent": 33.7,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 3,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (206 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_smoked_fish",
    "name": "Smoked Fish",
    "category": "Seafood",
    "icon": "🍣",
    "moisture_percent": 59.1,
    "pH": 5.86,
    "fat_percent": 21.8,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 80,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 36,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (227 samples). Top material: LDPE."
  },
  {
    "id": "comm_soft_drink",
    "name": "Soft Drink",
    "category": "Processed foods",
    "icon": "🥤",
    "moisture_percent": 0.4,
    "pH": 5.91,
    "fat_percent": 97.7,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 293,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (212 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_soy_milk",
    "name": "Soy Milk",
    "category": "Dairy",
    "icon": "🧋",
    "moisture_percent": 57.2,
    "pH": 6.55,
    "fat_percent": 3.3,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 39,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (244 samples). Top material: LDPE."
  },
  {
    "id": "comm_soybean_oil",
    "name": "Soybean Oil",
    "category": "Processed foods",
    "icon": "🫗",
    "moisture_percent": 0.3,
    "pH": 5.83,
    "fat_percent": 99.3,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 78,
    "storage_type": "Ambient",
    "typical_shelf_life_days": 264,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (229 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_spinach",
    "name": "Spinach",
    "category": "Fresh vegetables",
    "icon": "🍃",
    "moisture_percent": 76.9,
    "pH": 5.14,
    "fat_percent": 0.1,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 78,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (206 samples). Top material: LDPE."
  },
  {
    "id": "comm_strawberry",
    "name": "Strawberry",
    "category": "Fresh fruits",
    "icon": "🍓",
    "moisture_percent": 70.3,
    "pH": 5.78,
    "fat_percent": 0.1,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 60,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (234 samples). Top material: LDPE."
  },
  {
    "id": "comm_sunflower_oil",
    "name": "Sunflower Oil",
    "category": "Processed foods",
    "icon": "🌻",
    "moisture_percent": 0.5,
    "pH": 5.79,
    "fat_percent": 98.8,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 76,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 206,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (237 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_sweet_corn",
    "name": "Sweet Corn",
    "category": "Fresh vegetables",
    "icon": "🌽",
    "moisture_percent": 76.2,
    "pH": 6.54,
    "fat_percent": 0.5,
    "respiration_rate": "Medium",
    "respiration_mg_CO2_kg_hr": 28,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 32,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (243 samples). Top material: LDPE."
  },
  {
    "id": "comm_sweet_potato",
    "name": "Sweet Potato",
    "category": "Fresh vegetables",
    "icon": "🍠",
    "moisture_percent": 90.8,
    "pH": 6.05,
    "fat_percent": 1.2,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 78,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 93,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (231 samples). Top material: Micro-perforated Film."
  },
  {
    "id": "comm_tea",
    "name": "Tea",
    "category": "Processed foods",
    "icon": "🫖",
    "moisture_percent": 13.9,
    "pH": 5.26,
    "fat_percent": 14.0,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 257,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (230 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_tofu",
    "name": "Tofu",
    "category": "Processed foods",
    "icon": "🧊",
    "moisture_percent": 59.8,
    "pH": 6.66,
    "fat_percent": 16.8,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 80,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 50,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (233 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_tomato",
    "name": "Tomato",
    "category": "Fresh vegetables",
    "icon": "🍅",
    "moisture_percent": 92.4,
    "pH": 3.2,
    "fat_percent": 0.6,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 88,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (213 samples). Top material: LDPE."
  },
  {
    "id": "comm_tomato_ketchup",
    "name": "Tomato Ketchup",
    "category": "Fresh vegetables",
    "icon": "🥫",
    "moisture_percent": 0.2,
    "pH": 6.12,
    "fat_percent": 99.3,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 76,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 272,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (215 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_tomato_puree",
    "name": "Tomato Puree",
    "category": "Fresh vegetables",
    "icon": "🫕",
    "moisture_percent": 0.1,
    "pH": 5.75,
    "fat_percent": 98.6,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 4,
    "recommended_RH_percent": 79,
    "storage_type": "Cold Chain",
    "typical_shelf_life_days": 198,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (222 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_watermelon",
    "name": "Watermelon",
    "category": "Fresh fruits",
    "icon": "🍉",
    "moisture_percent": 95.6,
    "pH": 4.7,
    "fat_percent": 1.1,
    "respiration_rate": "High",
    "respiration_mg_CO2_kg_hr": 50,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 76,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 51,
    "primary_spoilage_factors": [
      "Microbial spoil",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (210 samples). Top material: Micro-perforated Film."
  },
  {
    "id": "comm_wheat_flour",
    "name": "Wheat Flour",
    "category": "Grains",
    "icon": "🥡",
    "moisture_percent": 3.4,
    "pH": 5.09,
    "fat_percent": 29.4,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 6,
    "recommended_RH_percent": 77,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 199,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Lipid oxidation"
    ],
    "description": "Empirically trained from 20,000 dataset (206 samples). Top material: Metallized PET."
  },
  {
    "id": "comm_whey_powder",
    "name": "Whey Powder",
    "category": "Processed foods",
    "icon": "🏋️",
    "moisture_percent": 14.0,
    "pH": 7.0,
    "fat_percent": 3.8,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 5,
    "recommended_RH_percent": 79,
    "storage_type": "Chilled",
    "typical_shelf_life_days": 276,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (230 samples). Top material: PET/PE Laminate."
  },
  {
    "id": "comm_yogurt",
    "name": "Yogurt",
    "category": "Dairy",
    "icon": "🍧",
    "moisture_percent": 30.3,
    "pH": 5.33,
    "fat_percent": 4.7,
    "respiration_rate": "Low",
    "respiration_mg_CO2_kg_hr": 12,
    "recommended_storage_temp_C": 7,
    "recommended_RH_percent": 77,
    "storage_type": "Ambient",
    "typical_shelf_life_days": 17,
    "primary_spoilage_factors": [
      "Moisture ingress / loss",
      "Respiration senescence"
    ],
    "description": "Empirically trained from 20,000 dataset (242 samples). Top material: PA/PE Vacuum Film."
  }
];

// Custom commodities management for Admin Data Studio
export function getStoredCustomCommodities(): Commodity[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem('packwise_custom_commodities');
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load custom commodities from localStorage', e);
  }
  return [];
}

export function saveCustomCommodities(list: Commodity[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('packwise_custom_commodities', JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Failed to save custom commodities to localStorage', e);
  }
}

export function registerCustomCommodity(comm: Commodity): void {
  const existingIndex = COMMODITIES_DATABASE.findIndex(
    (c) => c.name.toLowerCase() === comm.name.toLowerCase() || c.id === comm.id
  );
  if (existingIndex >= 0) {
    COMMODITIES_DATABASE[existingIndex] = comm;
  } else {
    COMMODITIES_DATABASE.push(comm);
  }
  const currentCustom = getStoredCustomCommodities().filter(
    (c) => c.id !== comm.id && c.name.toLowerCase() !== comm.name.toLowerCase()
  );
  currentCustom.push(comm);
  saveCustomCommodities(currentCustom);
}

export function registerBatchCommodities(list: Commodity[]): number {
  let addedCount = 0;
  const currentCustom = getStoredCustomCommodities();

  list.forEach((comm) => {
    const existingIndex = COMMODITIES_DATABASE.findIndex(
      (c) => c.name.toLowerCase() === comm.name.toLowerCase() || c.id === comm.id
    );
    if (existingIndex >= 0) {
      COMMODITIES_DATABASE[existingIndex] = comm;
    } else {
      COMMODITIES_DATABASE.push(comm);
      addedCount++;
    }

    const cIndex = currentCustom.findIndex(
      (c) => c.id === comm.id || c.name.toLowerCase() === comm.name.toLowerCase()
    );
    if (cIndex >= 0) {
      currentCustom[cIndex] = comm;
    } else {
      currentCustom.push(comm);
    }
  });

  saveCustomCommodities(currentCustom);
  return addedCount;
}

// Hydrate stored custom commodities into database array if running in browser
if (typeof window !== 'undefined') {
  try {
    const saved = getStoredCustomCommodities();
    saved.forEach((comm) => {
      if (!COMMODITIES_DATABASE.some((c) => c.id === comm.id || c.name.toLowerCase() === comm.name.toLowerCase())) {
        COMMODITIES_DATABASE.push(comm);
      }
    });
  } catch {
    // Ignore hydration errors
  }
}

/**
 * Intelligent icon resolution function for commodities
 * Returns a distinct, representative icon for any given food name or category.
 */
export function getCommodityIcon(commodityName: string, category?: string): string {
  const lower = (commodityName || '').toLowerCase().trim();

  // Known item dictionary for high-precision icon matching
  const EXACT_MAP: Record<string, string> = {
    almond: '🌰',
    almonds: '🌰',
    apple: '🍎',
    'apple juice': '🧃',
    banana: '🍌',
    barley: '🌾',
    beef: '🥩',
    beetroot: '🟣',
    'bell pepper': '🫑',
    capsicum: '🫑',
    biscuit: '🍪',
    biscuits: '🍪',
    cookie: '🍪',
    bread: '🍞',
    broccoli: '🥦',
    butter: '🧈',
    ghee: '🧈',
    cabbage: '🥬',
    cake: '🍰',
    carrot: '🥕',
    cashew: '🥠',
    cashews: '🥠',
    cauliflower: '🥗',
    cereal: '🧇',
    cheese: '🧀',
    chicken: '🍗',
    poultry: '🍗',
    chickpea: '🧆',
    chickpeas: '🧆',
    chana: '🧆',
    chocolate: '🍫',
    cocoa: '☕',
    'cocoa powder': '☕',
    coconut: '🥥',
    'coconut milk': '🥥',
    coffee: '♨️',
    'coffee powder': '♨️',
    cream: '🧁',
    cucumber: '🥒',
    kakdi: '🥒',
    eggplant: '🍆',
    brinjal: '🍆',
    egg: '🥚',
    eggs: '🥚',
    fish: '🐟',
    seafood: '🐟',
    'fruit juice': '🍹',
    juice: '🧃',
    garlic: '🧄',
    grape: '🍇',
    grapes: '🍇',
    'green beans': '🫛',
    guava: '🍏',
    amrood: '🍏',
    honey: '🍯',
    shahad: '🍯',
    'ice cream': '🍨',
    kulfi: '🍨',
    noodles: '🍜',
    'instant noodles': '🍜',
    ramen: '🍜',
    jam: '🍒',
    'kidney beans': '🫘',
    rajma: '🫘',
    kiwi: '🥝',
    lentil: '🍲',
    lentils: '🍲',
    dal: '🍲',
    maize: '🌮',
    'maize flour': '🌮',
    cornmeal: '🌮',
    mango: '🥭',
    aam: '🥭',
    mayonnaise: '🍶',
    milk: '🥛',
    'milk powder': '🍼',
    mushroom: '🍄',
    mutton: '🍖',
    lamb: '🍖',
    goat: '🍖',
    oat: '🥣',
    oats: '🥣',
    oatmeal: '🥣',
    olive: '🫒',
    'olive oil': '🫒',
    onion: '🧅',
    pyaz: '🧅',
    orange: '🍊',
    santra: '🍊',
    'orange juice': '🍸',
    paneer: '🫓',
    papaya: '🍈',
    papita: '🍈',
    pasta: '🍝',
    macaroni: '🍝',
    peach: '🍑',
    'peanut butter': '🥪',
    peanut: '🥜',
    peanuts: '🥜',
    groundnut: '🥜',
    moongfali: '🥜',
    pear: '🍐',
    nashpati: '🍐',
    pea: '🟢',
    peas: '🟢',
    matar: '🟢',
    pickle: '🫙',
    achar: '🫙',
    pineapple: '🍍',
    ananas: '🍍',
    pomegranate: '🫐',
    anar: '🫐',
    popcorn: '🍿',
    potato: '🥔',
    aloo: '🥔',
    'potato chips': '🍟',
    chips: '🍟',
    wafers: '🍟',
    quinoa: '🥘',
    rice: '🍚',
    chawal: '🍚',
    sausage: '🌭',
    'smoked fish': '🍣',
    salmon: '🍣',
    soda: '🥤',
    'soft drink': '🥤',
    cola: '🥤',
    'soy milk': '🧋',
    soybean: '🫗',
    'soybean oil': '🫗',
    spinach: '🍃',
    palak: '🍃',
    strawberry: '🍓',
    sunflower: '🌻',
    'sunflower oil': '🌻',
    'sweet corn': '🌽',
    corn: '🌽',
    bhutta: '🌽',
    'sweet potato': '🍠',
    shakarkandi: '🍠',
    tea: '🫖',
    chai: '🫖',
    tofu: '🧊',
    tomato: '🍅',
    tamatar: '🍅',
    ketchup: '🥫',
    'tomato ketchup': '🥫',
    puree: '🫕',
    'tomato puree': '🫕',
    watermelon: '🍉',
    tarbooj: '🍉',
    wheat: '🥡',
    'wheat flour': '🥡',
    atta: '🥡',
    maida: '🥡',
    flour: '🥡',
    whey: '🏋️',
    'whey powder': '🏋️',
    protein: '🏋️',
    yogurt: '🍧',
    dahi: '🍧',
    curd: '🍧',
    saffron: '🌺',
    kesar: '🌺',
    makhana: '⚪',
    ragi: '🌾',
    millet: '🌾',
    cardamom: '🌿',
    elaichi: '🌿',
    cinnamon: '🪵',
    dalchini: '🪵',
    clove: '🌱',
    laung: '🌱',
    pepper: '🧂',
    turmeric: '🫚',
    haldi: '🫚',
    ginger: '🫚',
    adrak: '🫚',
    chili: '🌶️',
    mirch: '🌶️',
    lemon: '🍋',
    nimbu: '🍋',
    lime: '🍋',
    fig: '🟤',
    anjeer: '🟤',
    date: '🟤',
    khajoor: '🟤',
    walnut: '🧠',
    akhrot: '🧠',
    pistachio: '🟢',
    pista: '🟢',
  };

  for (const [key, icon] of Object.entries(EXACT_MAP)) {
    if (lower === key || lower.includes(key)) {
      return icon;
    }
  }

  // Category fallback with distinct options
  const cat = (category || '').toLowerCase();
  if (cat.includes('fruit')) return '🍎';
  if (cat.includes('veg')) return '🥬';
  if (cat.includes('grain') || cat.includes('flour') || cat.includes('pulse')) return '🌾';
  if (cat.includes('meat')) return '🥩';
  if (cat.includes('seafood') || cat.includes('fish')) return '🐟';
  if (cat.includes('dairy')) return '🥛';
  if (cat.includes('snack')) return '🍿';
  if (cat.includes('beverage')) return '🧃';
  if (cat.includes('condiment') || cat.includes('spice')) return '🌿';
  if (cat.includes('nut')) return '🌰';

  return '🍱';
}


