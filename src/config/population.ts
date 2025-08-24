// 渋谷区人口データ（2025年度）
// 出典：https://www.city.shibuya.tokyo.jp/kurashi/jinko/jinko.html
// 夜間人口：令和7年8月1日現在（住民基本台帳）
// 昼間人口：令和2年国勢調査ベース（東京都統計）

const NIGHTTIME_POPULATION = Number(process.env.SHIBUYA_NIGHTTIME_POPULATION) || 231_874;
const DAYTIME_POPULATION = Number(process.env.SHIBUYA_DAYTIME_POPULATION) || 633_452;

// 昼間人口と夜間人口の平均を使用
export const SHIBUYA_POPULATION = Math.round((DAYTIME_POPULATION + NIGHTTIME_POPULATION) / 2);

export const POPULATION_SOURCES = {
  daytime: 'https://www.toukei.metro.tokyo.lg.jp/jsuikei/js-index.htm',
  nighttime: 'https://www.city.shibuya.tokyo.jp/kurashi/jinko/jinko.html',
} as const;