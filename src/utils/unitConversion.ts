/**
 * Unit conversion utilities for flexible packaging engineering.
 * Metric (ISO / ASTM standard SI): cc/m²/day, g/m²/day, microns (µm), °C, MPa
 * Imperial (US standard): cc/100in²/day, g/100in²/day, mils (gauge), °F, psi
 */

export type UnitSystem = 'metric' | 'imperial';

// 1 m² = 1,550 in² = 15.5 × (100 in²)
// Therefore: 1 cc/(100in²·day) = 15.5 cc/(m²·day)
const METRIC_TO_IMPERIAL_AREA_FACTOR = 15.5;

export function formatOTR(val: number, unit: UnitSystem): { value: string; unitStr: string } {
  if (unit === 'imperial') {
    const imperialVal = val / METRIC_TO_IMPERIAL_AREA_FACTOR;
    return {
      value: imperialVal < 1 ? imperialVal.toFixed(3) : imperialVal.toFixed(1),
      unitStr: 'cc/100in²/day',
    };
  }
  return {
    value: val > 100 ? Math.round(val).toLocaleString() : val.toFixed(1),
    unitStr: 'cc/m²/day',
  };
}

export function formatWVTR(val: number, unit: UnitSystem): { value: string; unitStr: string } {
  if (unit === 'imperial') {
    const imperialVal = val / METRIC_TO_IMPERIAL_AREA_FACTOR;
    return {
      value: imperialVal < 0.05 ? imperialVal.toFixed(4) : imperialVal.toFixed(2),
      unitStr: 'g/100in²/day',
    };
  }
  return {
    value: val.toFixed(1),
    unitStr: 'g/m²/day',
  };
}

export function formatThickness(val: number, unit: UnitSystem): { value: string; unitStr: string } {
  if (unit === 'imperial') {
    const mils = val / 25.4;
    return {
      value: mils.toFixed(2),
      unitStr: 'mils',
    };
  }
  return {
    value: String(val),
    unitStr: 'µm',
  };
}

export function formatTemperature(val: number, unit: UnitSystem): { value: string; unitStr: string } {
  if (unit === 'imperial') {
    const fahrenheit = Math.round((val * 9) / 5 + 32);
    return {
      value: String(fahrenheit),
      unitStr: '°F',
    };
  }
  return {
    value: String(val),
    unitStr: '°C',
  };
}

export function formatStrength(val: number, unit: UnitSystem): { value: string; unitStr: string } {
  if (unit === 'imperial') {
    const psi = Math.round(val * 145.038);
    return {
      value: psi.toLocaleString(),
      unitStr: 'psi',
    };
  }
  return {
    value: String(val),
    unitStr: 'MPa',
  };
}
