// ごみ排出量計算ユーティリティ

import { SHIBUYA_POPULATION } from '../config/population';

// 目標値（kg/人・日）
export const TARGET_PER_CAPITA_PER_DAY = 0.25;

// 1人1日あたり排出量を計算（純関数）
export function calcPerCapitaPerDay(
  totalKg: number,
  population: number,
  days: number
): number {
  if (population <= 0 || days <= 0) return 0;
  
  const perCapitaPerDay = totalKg / population / days;
  // 小数3桁に丸め
  return Math.round(perCapitaPerDay * 1000) / 1000;
}

// 目標値との差を計算
export function calcDeltaFromTarget(perCapitaKg: number) {
  const deltaKg = Math.round((perCapitaKg - TARGET_PER_CAPITA_PER_DAY) * 1000) / 1000;
  const deltaPct = Math.round((perCapitaKg / TARGET_PER_CAPITA_PER_DAY - 1) * 1000) / 10; // パーセント表示用に10で割る
  
  return { deltaKg, deltaPct };
}

// 人口を取得（昼間・夜間の平均）
export function getPopulation(): number {
  return SHIBUYA_POPULATION;
}

// 数値フォーマット（3桁区切り）
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('ja-JP', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// 差分フォーマット（±表示）
export function formatDelta(deltaKg: number, deltaPct: number): {
  kgText: string;
  pctText: string;
  isPositive: boolean;
} {
  const isPositive = deltaKg >= 0;
  const prefix = isPositive ? '+' : '';
  
  return {
    kgText: `${prefix}${formatNumber(deltaKg, 3)} kg`,
    pctText: `${prefix}${formatNumber(deltaPct, 1)}%`,
    isPositive,
  };
}