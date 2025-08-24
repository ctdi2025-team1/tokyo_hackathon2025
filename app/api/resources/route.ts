import { NextResponse } from 'next/server';

export interface ResourceData {
  id: string;
  name: string;
  value: number; // g/人・日
  percentage: number; // パーセンテージ
  color: string;
}

// モックデータ用の型（percentage を除外）
type BaseResourceItem = Omit<ResourceData, 'percentage'>;

// リモートの JSON が未設定の場合に返すモックデータ
const MOCK_RESOURCE_DATA: BaseResourceItem[] = [
  { id: 'others', name: 'その他', value: 600, color: '#616161' },
  { id: 'glass', name: 'びん', value: 800, color: '#ed6c02' },
  { id: 'plastic', name: 'プラ容器包装', value: 2100, color: '#d32f2f' },
  { id: 'pet', name: 'ペットボトル', value: 1200, color: '#1976d2' },
  { id: 'paper', name: '紙類', value: 3200, color: '#2e7d32' },
  { id: 'can', name: '缶', value: 1500, color: '#9c27b0' },
];


export async function GET() {
  try {
    // 実データの JSON 取得: 環境変数 RESOURCE_JSON_URL があれば利用、なければモックにフォールバック
    const resourceUrl = process.env.RESOURCE_JSON_URL || process.env.NEXT_PUBLIC_RESOURCE_JSON_URL;

    if (!resourceUrl) {
      const total = MOCK_RESOURCE_DATA.reduce((sum: number, item: BaseResourceItem) => sum + item.value, 0);
      const dataWithPercentage = MOCK_RESOURCE_DATA.map((item: BaseResourceItem) => ({
        ...item,
        percentage: Math.round((item.value / total) * 100 * 10) / 10,
      }));
      return NextResponse.json({
        data: dataWithPercentage,
        lastUpdated: new Date().toISOString(),
        total: total,
        unit: 'g/人・日'
      });
    }

    const response = await fetch(resourceUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch resource data: ${response.status}`);
    }
    const raw = await response.json();

    // 受信 JSON を集計して UI 用のカテゴリに変換
    type RawRecord = Record<string, unknown>;

    // 数値(カンマ区切り含む)を number に変換
    const parseAmount = (value: unknown): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const cleaned = value.replace(/[,\s]/g, '');
        const num = Number(cleaned);
        return Number.isFinite(num) ? num : 0;
      }
      return 0;
    };

    // 品目名を取り出す（日本語キー/英語キー双方対応）
    const getItemName = (rec: RawRecord): string => {
      const candidates = ['品目', 'item', '種別', 'category', 'name'];
      for (const key of candidates) {
        if (rec[key] != null && typeof rec[key] === 'string') return String(rec[key]);
      }
      return '';
    };

    // 数量を取り出す（日本語キー/英語キー双方対応）
    const getAmount = (rec: RawRecord): number => {
      const candidates = ['数量', 'value', 'amount', '合計', '量'];
      for (const key of candidates) {
        if (rec[key] != null) return parseAmount(rec[key]);
      }
      return 0;
    };

    // カテゴリの色情報（UI と整合）
    const COLORS: Record<string, string> = {
      pet: '#1976d2',
      paper: '#2e7d32',
      glass: '#ed6c02',
      can: '#9c27b0',
      plastic: '#d32f2f',
      others: '#616161',
    };

    // 品目→カテゴリへのマッピング
    const mapToCategory = (itemName: string): { id: string; name: string } => {
      if (/ペットボトル/.test(itemName)) return { id: 'pet', name: 'ペットボトル' };
      if (/びん|瓶/.test(itemName)) return { id: 'glass', name: 'びん' };
      if (/スプレー缶/.test(itemName)) return { id: 'can', name: '缶' };
      if (/缶/.test(itemName)) return { id: 'can', name: '缶' };
      if (/雑誌|新聞|段ボール|段箱|紙/.test(itemName)) return { id: 'paper', name: '紙類' };
      if (/プラ|プラスチック/.test(itemName)) return { id: 'plastic', name: 'プラ容器包装' };
      return { id: 'others', name: 'その他' };
    };

    // 集計
    const accumulator = new Map<string, { id: string; name: string; value: number }>();
    const rows: RawRecord[] = Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);

    for (const rec of rows) {
      const itemName = getItemName(rec);
      if (!itemName) continue;
      const amount = getAmount(rec);
      const { id, name } = mapToCategory(itemName);
      const current = accumulator.get(id) || { id, name, value: 0 };
      current.value += amount;
      accumulator.set(id, current);
    }

    // 配列に変換し、割合を付与
    const aggregated = Array.from(accumulator.values());
    const total = aggregated.reduce((sum, item) => sum + item.value, 0);
    
    // 表示順序を定義（逆順）
    const displayOrder = ['others', 'glass', 'plastic', 'pet', 'paper', 'can'];
    
    const dataWithPercentage: ResourceData[] = aggregated
      .filter(item => item.value > 0)
      .map(item => ({
        id: item.id,
        name: item.name,
        value: item.value,
        percentage: total > 0 ? Math.round((item.value / total) * 100 * 10) / 10 : 0,
        color: COLORS[item.id] || COLORS.others,
      }))
      .sort((a, b) => displayOrder.indexOf(a.id) - displayOrder.indexOf(b.id));

    return NextResponse.json({
      data: dataWithPercentage,
      lastUpdated: new Date().toISOString(),
      total: total,
      unit: 'g/人・日'
    });
  } catch (error) {
    console.error('Error fetching resource data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource data' },
      { status: 500 }
    );
  }
}