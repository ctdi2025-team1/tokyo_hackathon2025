// ごみ量データ取得サービス
// データソース: SHIBUYA OPEN DATA (ArcGIS Feature Service)

export interface GarbageRecord {
  OBJECTID: number;
  date?: string;
  year?: number;
  month?: number;
  collectionDate?: string;
  burnable?: number; // 可燃ごみ
  nonBurnable?: number; // 不燃ごみ  
  bulky?: number; // 粗大ごみ
  burnableKg?: number;
  nonBurnableKg?: number;
  bulkyKg?: number;
  [key: string]: unknown;
}

export interface GarbageTotals {
  burnable: number; // kg
  nonBurnable: number; // kg
  bulky: number; // kg
  total: number; // kg
  lastUpdated: string; // ISO string
  dataGranularity: 'daily' | 'weekly' | 'monthly';
  periodDays: number;
}

const GARBAGE_API_URL = 'https://services3.arcgis.com/UtdeFTavkHfI94t2/arcgis/rest/services/131130_garbage_amount/FeatureServer/0/query?outFields=*&where=1%3D1&orderByFields=%E6%97%A5%E4%BB%98%20DESC%2C%20ObjectId%20DESC&resultRecordCount=12&f=geojson';

const REQUEST_TIMEOUT = 6000; // 6秒タイムアウト

// 指数バックオフによるリトライ機能
async function fetchWithRetry(url: string, maxRetries = 1): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = 2 ** attempt * 1000; // 1s, 2s の指数バックオフ
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // lastError はループ内で必ずセットされる想定
  throw (lastError ?? new Error('Unknown fetch error'));
}

// プロパティ名の正規化（日本語・英語の揺れに対応）
function normalizePropertyNames(record: Record<string, unknown>): GarbageRecord {
  const normalized: GarbageRecord = {
    OBJECTID: 0,
  };
  
  for (const [key, value] of Object.entries(record)) {
    const lowerKey = key.toLowerCase();
    
    // OBJECTID
    if (lowerKey.includes('objectid') || lowerKey.includes('id')) {
      normalized.OBJECTID = Number(value) || 0;
    }
    
    // 日付関連
    else if (lowerKey.includes('date') || lowerKey.includes('日付')) {
      normalized.date = String(value);
    }
    else if (lowerKey.includes('year') || lowerKey.includes('年')) {
      normalized.year = Number(value);
    }
    else if (lowerKey.includes('month') || lowerKey.includes('月')) {
      normalized.month = Number(value);
    }
    
    // ごみ種別（単位表記の揺れを吸収）
    else if (/可燃/.test(lowerKey) || /burnable/.test(lowerKey)) {
      const num = Number(value) || 0;
      if (lowerKey.includes('kg') || lowerKey.includes('キロ')) {
        normalized.burnableKg = num;
      } else if (lowerKey.includes('t') || lowerKey.includes('トン')) {
        normalized.burnableKg = num * 1000; // t → kg
      } else {
        normalized.burnable = num;
      }
    }
    else if (/不燃/.test(lowerKey) || /nonburnable/.test(lowerKey)) {
      const num = Number(value) || 0;
      if (lowerKey.includes('kg') || lowerKey.includes('キロ')) {
        normalized.nonBurnableKg = num;
      } else if (lowerKey.includes('t') || lowerKey.includes('トン')) {
        normalized.nonBurnableKg = num * 1000; // t → kg
      } else {
        normalized.nonBurnable = num;
      }
    }
    else if (/粗大/.test(lowerKey) || /bulky/.test(lowerKey)) {
      const num = Number(value) || 0;
      if (lowerKey.includes('kg') || lowerKey.includes('キロ')) {
        normalized.bulkyKg = num;
      } else if (lowerKey.includes('t') || lowerKey.includes('トン')) {
        normalized.bulkyKg = num * 1000; // t → kg
      } else {
        normalized.bulky = num;
      }
    }
  }
  
  return normalized;
}

// 最新レコードを特定
function findLatestRecord(records: GarbageRecord[]): GarbageRecord | null {
  if (records.length === 0) return null;
  
  // 日付があるものを優先して最新を探す
  const withDates = records.filter(r => r.date || (r.year && r.month));
  
  if (withDates.length > 0) {
    return withDates.sort((a, b) => {
      // 日付文字列がある場合
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      
      // 年月がある場合
      if (a.year && a.month && b.year && b.month) {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      }
      
      return 0;
    })[0];
  }
  
  // 日付情報がない場合はOBJECTID最大を最新とみなす
  return records.sort((a, b) => b.OBJECTID - a.OBJECTID)[0];
}

// データ粒度と期間日数を推定
function estimateDataGranularity(record: GarbageRecord): { granularity: 'daily' | 'weekly' | 'monthly', periodDays: number } {
  // 年月情報がある場合は月次データと推定
  if (record.year && record.month) {
    const daysInMonth = new Date(record.year, record.month, 0).getDate();
    return { granularity: 'monthly', periodDays: daysInMonth };
  }
  
  // 日付文字列から推定
  if (record.date) {
    // 月初・月末の日付パターンで月次か判定
    const date = new Date(record.date);
    if (date.getDate() === 1 || date.getDate() > 28) {
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      return { granularity: 'monthly', periodDays: daysInMonth };
    }
  }
  
  // デフォルトは月次（30日）
  return { granularity: 'monthly', periodDays: 30 };
}

// kgに正規化
function normalizeToKg(record: GarbageRecord): { burnable: number, nonBurnable: number, bulky: number } {
  return {
    burnable: record.burnableKg || (record.burnable ? record.burnable * 1000 : 0),
    nonBurnable: record.nonBurnableKg || (record.nonBurnable ? record.nonBurnable * 1000 : 0),
    bulky: record.bulkyKg || (record.bulky ? record.bulky * 1000 : 0),
  };
}

export async function fetchGarbageGeoJSON(): Promise<GarbageTotals> {
  try {
    const response = await fetchWithRetry(GARBAGE_API_URL);
    const geoJsonData = await response.json();
    
    if (!geoJsonData.features || !Array.isArray(geoJsonData.features)) {
      throw new Error('Invalid GeoJSON format: missing features array');
    }
    
    // ArcGIS（渋谷区オープンデータ）の典型スキーマ: 行=カテゴリ（ごみ種類）、値=ごみ収集量_ton
    // 最新日付の行をカテゴリで合算して日次トータルを作る
    const firstProps: Record<string, unknown> = geoJsonData.features[0]?.properties || {};
    const own = (obj: Record<string, unknown>, key: string): boolean => Object.hasOwn(obj, key) === true;
    const hasShibuyaSchema: boolean = Boolean(own(firstProps, 'ごみ種類') && (own(firstProps, 'ごみ収集量_ton') || own(firstProps, 'ごみ収集量')));
    
    if (hasShibuyaSchema) {
      const rows = geoJsonData.features.map((f: { properties?: Record<string, unknown> }) => {
        const props = f.properties || {};
        // biome-ignore lint/complexity/useLiteralKeys: keep import order for clarity
        const dateStr = typeof props['日付'] === 'string' ? (props['日付'] as string) : '';
        // biome-ignore lint/complexity/useLiteralKeys: keep import order for clarity
        const y = Number(props['年']);
        // biome-ignore lint/complexity/useLiteralKeys: keep import order for clarity
        const m = Number(props['月']);
        // biome-ignore lint/complexity/useLiteralKeys: keep import order for clarity
        const dayRaw = (props as Record<string, unknown>)['日'];
        const d = typeof dayRaw === 'number' ? dayRaw : Number(dayRaw);
        const date = dateStr ? new Date(dateStr) : (y && m && d ? new Date(y, m - 1, d) : null);
        // biome-ignore lint/complexity/useLiteralKeys: keep import order for clarity
        const cat = String(props['ごみ種類'] ?? '');
        // biome-ignore lint/complexity/useLiteralKeys: keep import order for clarity
        const tonRaw = (props['ごみ収集量_ton'] ?? props['ごみ収集量']) as unknown;
        const ton = typeof tonRaw === 'number' ? tonRaw : Number(tonRaw);
        return { date, cat, ton: Number.isNaN(ton) ? 0 : ton };
      }).filter((r: { date: Date | null }) => r.date instanceof Date && !Number.isNaN((r.date as Date).getTime()));
      
      if (rows.length === 0) {
        throw new Error('No dated rows in ArcGIS dataset');
      }
      
      const latestTime = Math.max(...rows.map((r: { date: Date }) => (r.date as Date).getTime()));
      const latestDateKey = new Date(latestTime).toDateString();
      
      let burnable = 0;
      let nonBurnable = 0;
      let bulky = 0;
      
      for (const r of rows as Array<{ date: Date; cat: string; ton: number }>) {
        if (!(r.date as Date).toDateString || (r.date as Date).toDateString() !== latestDateKey) continue;
        const kg = r.ton * 1000;
        if (/可燃/.test(r.cat)) burnable += kg;
        else if (/不燃/.test(r.cat)) nonBurnable += kg;
        else if (/粗大/.test(r.cat)) bulky += kg;
      }
      
      return {
        burnable,
        nonBurnable,
        bulky,
        total: burnable + nonBurnable + bulky,
        lastUpdated: new Date(latestTime).toISOString(),
        dataGranularity: 'daily',
        periodDays: 1,
      };
    }
    
    // 汎用フォールバック: レコード1件をkgに正規化
    const records = geoJsonData.features.map((feature: { properties?: Record<string, unknown> }) => 
      normalizePropertyNames(feature.properties || {})
    );
    
    if (records.length === 0) {
      throw new Error('No garbage data found');
    }
    
    // 最新レコードを特定
    const latestRecord = findLatestRecord(records);
    if (!latestRecord) {
      throw new Error('Could not determine latest record');
    }
    
    // データ粒度を推定
    const { granularity, periodDays } = estimateDataGranularity(latestRecord);
    
    // kgに正規化
    const { burnable, nonBurnable, bulky } = normalizeToKg(latestRecord);
    
    return {
      burnable,
      nonBurnable,
      bulky,
      total: burnable + nonBurnable + bulky,
      lastUpdated: new Date().toISOString(),
      dataGranularity: granularity,
      periodDays,
    };
  } catch (error) {
    console.error('Failed to fetch garbage data:', error);
    throw error;
  }
}