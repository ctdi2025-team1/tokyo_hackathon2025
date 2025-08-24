// globals enabled in vitest.config.ts
import {
  calcPerCapitaPerDay,
  calcDeltaFromTarget,
  getPopulation,
  formatNumber,
  formatDelta,
  TARGET_PER_CAPITA_PER_DAY,
} from '../src/utils/garbage';

describe('garbage utilities', () => {
  describe('calcPerCapitaPerDay', () => {
    it('should calculate per capita per day correctly', () => {
      expect(calcPerCapitaPerDay(1000, 100, 10)).toBe(1.0);
      expect(calcPerCapitaPerDay(2500, 1000, 10)).toBe(0.25);
      expect(calcPerCapitaPerDay(7500, 1000, 30)).toBe(0.25);
    });

    it('should round to 3 decimal places', () => {
      expect(calcPerCapitaPerDay(1, 3, 1)).toBe(0.333);
      expect(calcPerCapitaPerDay(2, 3, 1)).toBe(0.667);
      expect(calcPerCapitaPerDay(1, 6, 1)).toBe(0.167);
    });

    it('should handle zero division gracefully', () => {
      expect(calcPerCapitaPerDay(1000, 0, 10)).toBe(0);
      expect(calcPerCapitaPerDay(1000, 100, 0)).toBe(0);
      expect(calcPerCapitaPerDay(1000, 0, 0)).toBe(0);
    });

    it('should handle negative values', () => {
      expect(calcPerCapitaPerDay(1000, -100, 10)).toBe(0);
      expect(calcPerCapitaPerDay(1000, 100, -10)).toBe(0);
    });
  });

  describe('calcDeltaFromTarget', () => {
    it('should calculate delta from target correctly', () => {
      const target = TARGET_PER_CAPITA_PER_DAY; // 0.25
      
      // Equal to target
      const result1 = calcDeltaFromTarget(target);
      expect(result1.deltaKg).toBe(0);
      expect(result1.deltaPct).toBe(0);

      // Above target
      const result2 = calcDeltaFromTarget(0.5);
      expect(result2.deltaKg).toBe(0.25);
      expect(result2.deltaPct).toBe(100); // (0.5/0.25 - 1) * 100

      // Below target  
      const result3 = calcDeltaFromTarget(0.125);
      expect(result3.deltaKg).toBe(-0.125);
      expect(result3.deltaPct).toBe(-50); // (0.125/0.25 - 1) * 100
    });

    it('should round deltaKg to 3 decimal places and deltaPct to 1 decimal place', () => {
      const result = calcDeltaFromTarget(0.333);
      expect(result.deltaKg).toBe(0.083); // Rounded from 0.083...
      expect(result.deltaPct).toBe(33.2); // Rounded from 33.2%
    });
  });

  describe('getPopulation', () => {
    it('should return average population value', () => {
      const expected = Math.round((633452 + 231874) / 2);
      expect(getPopulation()).toBe(expected);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with Japanese locale', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1234.567, 2)).toBe('1,234.57');
    });

    it('should handle decimals correctly', () => {
      expect(formatNumber(123.456, 0)).toBe('123');
      expect(formatNumber(123.456, 1)).toBe('123.5');
      expect(formatNumber(123.456, 3)).toBe('123.456');
    });

    it('should handle zero and negative numbers', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(-1234)).toBe('-1,234');
      expect(formatNumber(-123.45, 2)).toBe('-123.45');
    });
  });

  describe('formatDelta', () => {
    it('should format positive deltas with + prefix', () => {
      const result = formatDelta(0.125, 50.5);
      expect(result.kgText).toBe('+0.125 kg');
      expect(result.pctText).toBe('+50.5%');
      expect(result.isPositive).toBe(true);
    });

    it('should format negative deltas without + prefix', () => {
      const result = formatDelta(-0.125, -25.0);
      expect(result.kgText).toBe('-0.125 kg');
      expect(result.pctText).toBe('-25.0%');
      expect(result.isPositive).toBe(false);
    });

    it('should handle zero correctly', () => {
      const result = formatDelta(0, 0);
      expect(result.kgText).toBe('+0.000 kg');
      expect(result.pctText).toBe('+0.0%');
      expect(result.isPositive).toBe(true);
    });

    it('should format with correct decimal places', () => {
      const result = formatDelta(0.123456, 12.3456);
      expect(result.kgText).toBe('+0.123 kg');
      expect(result.pctText).toBe('+12.3%');
    });
  });
});