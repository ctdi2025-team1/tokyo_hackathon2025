import { NextRequest, NextResponse } from 'next/server';

interface SeparationInfo {
  category: string;
  how_to: string;
  notes: string;
  source: string;
}

interface SeparationResponse extends SeparationInfo {
  query: string;
  found: boolean;
}

// Mock separation data based on Shibuya waste separation guidelines
const separationDatabase: Record<string, SeparationInfo> = {
  'ペットボトル': {
    category: '資源',
    how_to: 'キャップとラベルを外して、中をすすいでから資源の日に出してください。',
    notes: 'PETマークがついているもの。汚れが落ちないものは燃えるごみへ。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  'ペット': {
    category: '資源',
    how_to: 'キャップとラベルを外して、中をすすいでから資源の日に出してください。',
    notes: 'PETマークがついているもの。汚れが落ちないものは燃えるごみへ。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  'ペット容器': {
    category: '資源',
    how_to: 'キャップとラベルを外して、中をすすいでから資源の日に出してください。',
    notes: 'PETマークがついているもの。汚れが落ちないものは燃えるごみへ。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  '紙類': {
    category: '資源',
    how_to: '新聞・雑誌・段ボール・紙パックなどは種類別にまとめて紐で縛り、資源の日に出してください。',
    notes: '濡れた紙、汚れた紙、感熱紙、写真などは燃えるごみへ。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  '新聞': {
    category: '資源',
    how_to: '新聞紙は折りたたんで紐で縛り、資源の日に出してください。',
    notes: 'チラシも一緒に出せます。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  '雑誌': {
    category: '資源',
    how_to: '雑誌は重ねて紐で縛り、資源の日に出してください。',
    notes: 'ビニール製のカバーは外してください。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  '段ボール': {
    category: '資源',
    how_to: '段ボールは平たく折りたたんで紐で縛り、資源の日に出してください。',
    notes: 'テープやホッチキスの針は取り除いてください。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  '紙パック': {
    category: '資源',
    how_to: '中をすすいで乾かし、開いてから資源の日に出してください。',
    notes: '内側がアルミコーティングされているものは燃えるごみへ。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  'びん': {
    category: '資源',
    how_to: 'キャップを外し、中をすすいでから資源の日に出してください。色別に分ける必要はありません。',
    notes: '割れたガラスは新聞紙などに包んで燃えないごみへ。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  'ガラス瓶': {
    category: '資源',
    how_to: 'キャップを外し、中をすすいでから資源の日に出してください。色別に分ける必要はありません。',
    notes: '割れたガラスは新聞紙などに包んで燃えないごみへ。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  '缶': {
    category: '資源',
    how_to: '中をすすいでから資源の日に出してください。アルミ缶とスチール缶を分ける必要はありません。',
    notes: '一斗缶など大きなものは燃えないごみへ。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  'アルミ缶': {
    category: '資源',
    how_to: '中をすすいでから資源の日に出してください。スチール缶と分ける必要はありません。',
    notes: '潰れていても問題ありません。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  'スチール缶': {
    category: '資源',
    how_to: '中をすすいでから資源の日に出してください。アルミ缶と分ける必要はありません。',
    notes: '大きなスチール缶は燃えないごみへ。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  'プラ容器包装': {
    category: '資源',
    how_to: 'プラマークがついた容器包装は、軽くすすいでから資源の日に出してください。',
    notes: '汚れが落ちないものは燃えるごみへ。商品そのものは対象外です。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  'プラスチック': {
    category: 'プラ容器包装または燃えるごみ',
    how_to: 'プラマークがついた容器包装は資源へ。それ以外のプラスチック製品は燃えるごみへ。',
    notes: '判断が難しい場合は区のホームページでご確認ください。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  'スプレー缶': {
    category: '資源（有害ごみ）',
    how_to: '中身を完全に使い切り、穴を開けずに資源の日に出してください。',
    notes: '中身が残っている場合は区にご相談ください。火気に注意。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  'CB缶': {
    category: '資源（有害ごみ）',
    how_to: 'カセットボンベは中身を完全に使い切り、穴を開けずに資源の日に出してください。',
    notes: '中身が残っている場合は区にご相談ください。火気に注意。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  '蛍光管': {
    category: '資源（有害ごみ）',
    how_to: '割れないよう購入時の箱に入れるか、新聞紙などに包んで資源の日に出してください。',
    notes: 'LED電球は燃えないごみへ。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  '乾電池': {
    category: '資源（有害ごみ）',
    how_to: '透明な袋に入れて資源の日に出してください。',
    notes: '充電式電池は回収協力店へお持ちください。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  '燃えるごみ': {
    category: '燃えるごみ',
    how_to: '燃えるごみの日（週2回）に、渋谷区指定の有料ごみ袋に入れて出してください。',
    notes: '生ごみは水切りをしっかりと。一袋の重さは5kg以内。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
  '燃えないごみ': {
    category: '燃えないごみ',
    how_to: '燃えないごみの日（月1回）に、渋谷区指定の有料ごみ袋に入れて出してください。',
    notes: '一袋の重さは5kg以内。危険なものは新聞紙などに包んでください。',
    source: 'https://city-shibuya-data.opendata.arcgis.com/datasets/ad768fb1a8674334a7dd17884f002975_0',
  },
};

// Helper function to search for items (exact match, partial match, synonyms)
const searchSeparationInfo = (query: string): SeparationInfo | null => {
  const normalizedQuery = query.trim().toLowerCase();
  
  // Exact match
  for (const [key, value] of Object.entries(separationDatabase)) {
    if (key.toLowerCase() === normalizedQuery) {
      return value;
    }
  }
  
  // Partial match
  for (const [key, value] of Object.entries(separationDatabase)) {
    if (key.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const item = searchParams.get('item');
    
    if (!item) {
      return NextResponse.json(
        { error: '検索する品目を指定してください。' },
        { status: 400 }
      );
    }
    
    // Add artificial delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const separationInfo = searchSeparationInfo(item);
    
    if (!separationInfo) {
      const response: SeparationResponse = {
        query: item,
        found: false,
        category: '不明',
        how_to: '該当する品目が見つかりませんでした。渋谷区のホームページでご確認いただくか、区役所にお問い合わせください。',
        notes: '分からないものは燃えるごみとして出すか、区にご相談ください。',
        source: 'https://www.city.shibuya.tokyo.jp/kurashi/gomi/',
      };
      
      return NextResponse.json(response, { status: 200 });
    }
    
    const response: SeparationResponse = {
      query: item,
      found: true,
      ...separationInfo,
    };
    
    // Add cache headers
    const nextResponse = NextResponse.json(response);
    nextResponse.headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    
    return nextResponse;
    
  } catch (error) {
    console.error('Failed to search separation info:', error);
    
    const fallbackResponse: SeparationResponse = {
      query: request.nextUrl.searchParams.get('item') || '',
      found: false,
      category: 'エラー',
      how_to: 'データの取得に失敗しました。渋谷区のホームページでご確認ください。',
      notes: '',
      source: 'https://www.city.shibuya.tokyo.jp/kurashi/gomi/',
    };
    
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}