import { NextRequest, NextResponse } from 'next/server';
import type { Event as TodayEvent } from '../events/today/route';

interface ChatMessage {
  message: string;
}

interface ChatResponse {
  response: string;
  sources?: string[];
  toolsUsed?: string[];
  timestamp: string;
}

// Mock tool functions that would call our APIs
const getEventsToday = async (): Promise<TodayEvent[]> => {
  try {
    // In a real implementation, this would call our events API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/events/today`);
    const data = await response.json();
    return (data.events || []) as TodayEvent[];
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
};

const getKPIShibuya = async () => {
  try {
    // In a real implementation, this would call our KPI API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/kpi/shibuya`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch KPI data:', error);
    return null;
  }
};

const getSeparationInfo = async (item: string) => {
  try {
    // In a real implementation, this would call our separation API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/separation?item=${encodeURIComponent(item)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch separation info:', error);
    return null;
  }
};

// Simple intent detection for demo purposes
const detectIntent = (message: string): 'events' | 'kpi' | 'separation' | 'general' => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('イベント') || lowerMessage.includes('催し') || lowerMessage.includes('開催') || lowerMessage.includes('今日')) {
    return 'events';
  }
  
  if (lowerMessage.includes('ごみ') || lowerMessage.includes('ゴミ') || lowerMessage.includes('廃棄') || lowerMessage.includes('kpi') || lowerMessage.includes('環境')) {
    return 'kpi';
  }
  
  if (lowerMessage.includes('分別') || lowerMessage.includes('出し方') || lowerMessage.includes('捨て方')) {
    return 'separation';
  }
  
  return 'general';
};

// Extract item name from separation query
const extractItemName = (message: string): string => {
  const patterns = [
    /(.+?)の(分別|出し方|捨て方)/,
    /(.+?)は(どこに|どう)/,
    /(.+?)について/,
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // If no pattern matches, return the message itself (cleaned up)
  return message.replace(/の(分別|出し方|捨て方|について).*/, '').trim();
};

// Generate responses based on intent and data
const generateResponse = async (message: string, intent: string): Promise<ChatResponse> => {
  const sources: string[] = [];
  const toolsUsed: string[] = [];
  
  switch (intent) {
    case 'events': {
      toolsUsed.push('getEventsToday');
      const events: TodayEvent[] = await getEventsToday();
      
      if (events.length === 0) {
        return {
          response: '申し訳ございませんが、本日開催中のイベント情報を取得できませんでした。後ほど再度お試しください。',
          sources: ['https://www.city.sumida.lg.jp/kuseijoho/sumida_info/opendata/stdataset/event.html'],
          toolsUsed,
          timestamp: new Date().toISOString(),
        };
      }
      
      const familyEvents = events.filter((event: TodayEvent) => event.forFamily);
      const allEventsCount = events.length;
      const familyEventsCount = familyEvents.length;
      
      let response = `本日は${allEventsCount}件のイベントが開催されています。`;
      
      if (familyEventsCount > 0) {
        response += `そのうち親子向けのイベントは${familyEventsCount}件です。\n\n主な親子向けイベント:\n`;
        familyEvents.slice(0, 3).forEach((event: TodayEvent, index: number) => {
          response += `${index + 1}. ${event.title}`;
          if (event.startTime) response += ` (${event.startTime}開始)`;
          if (event.ward) response += ` - ${event.ward}`;
          response += '\n';
        });
      }
      
      sources.push('https://www.city.sumida.lg.jp/kuseijoho/sumida_info/opendata/stdataset/event.html');
      sources.push('https://www.city.chuo.lg.jp/kusei/gaiyou/toukeidate/opendata.html');
      sources.push('https://www.bigsight.jp/visitor/event/');
      
      return {
        response,
        sources,
        toolsUsed,
        timestamp: new Date().toISOString(),
      };
    }
    
    case 'kpi': {
      toolsUsed.push('getKPIShibuya');
      const kpiData = await getKPIShibuya();
      
      if (!kpiData) {
        return {
          response: '申し訳ございませんが、渋谷区の環境データを取得できませんでした。後ほど再度お試しください。',
          sources: ['https://city-shibuya-data.opendata.arcgis.com/'],
          toolsUsed,
          timestamp: new Date().toISOString(),
        };
      }
      
      const response = `渋谷区の最新環境データをお知らせします：

🏠 **家庭ごみ**: ${kpiData.household_gpd}g/人・日
   前回より${kpiData.deltas.household > 0 ? '+' : ''}${kpiData.deltas.household}g
   目標（2033年）: 250g/人・日まであと${(kpiData.household_gpd - 250).toFixed(1)}g

♻️ **資源回収**: ${kpiData.recycling_gpd}g/人・日
   前回より${kpiData.deltas.recycling > 0 ? '+' : ''}${kpiData.deltas.recycling}g
   目標: 150g/人・日${kpiData.recycling_gpd >= 150 ? '（達成済み！）' : `まであと${(150 - kpiData.recycling_gpd).toFixed(1)}g`}

データは公式オープンデータに基づいています。`;
      
      sources.push('https://city-shibuya-data.opendata.arcgis.com/');
      sources.push('https://www.city.shibuya.tokyo.jp/kurashi/gomi/gomi-number/gomi_jyoho.html');
      
      return {
        response,
        sources,
        toolsUsed,
        timestamp: new Date().toISOString(),
      };
    }
    
    case 'separation': {
      const itemName = extractItemName(message);
      toolsUsed.push('getSeparationInfo');
      const separationInfo = await getSeparationInfo(itemName);
      
      if (!separationInfo || !separationInfo.found) {
        return {
          response: `「${itemName}」の分別方法を見つけることができませんでした。\n\n渋谷区のホームページでご確認いただくか、区役所にお問い合わせください。一般的には、判断に迷うものは燃えるごみとして出すことをお勧めします。`,
          sources: ['https://www.city.shibuya.tokyo.jp/kurashi/gomi/'],
          toolsUsed,
          timestamp: new Date().toISOString(),
        };
      }
      
      const response = `「${itemName}」の分別方法をお答えします：

**分別区分**: ${separationInfo.category}
**出し方**: ${separationInfo.how_to}
${separationInfo.notes ? `**注意事項**: ${separationInfo.notes}` : ''}

この情報は渋谷区公式オープンデータに基づいています。`;
      
      sources.push(separationInfo.source);
      
      return {
        response,
        sources,
        toolsUsed,
        timestamp: new Date().toISOString(),
      };
    }
    
    default: {
      return {
        response: `渋谷区の環境・イベント情報についてお答えします。以下について質問できます：

1. **今日のイベント**: 「今日のイベントを教えて」「親子向けのイベントは？」
2. **環境データ**: 「渋谷のごみの量は？」「リサイクルの状況は？」
3. **ごみ分別**: 「ペットボトルの分別方法は？」「○○はどう捨てる？」

具体的にお聞かせください！`,
        sources: [
          'https://city-shibuya-data.opendata.arcgis.com/',
          'https://www.city.shibuya.tokyo.jp/kurashi/gomi/',
        ],
        toolsUsed,
        timestamp: new Date().toISOString(),
      };
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatMessage = await request.json();
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'メッセージを入力してください。' },
        { status: 400 }
      );
    }
    
    // Add artificial delay to simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const intent = detectIntent(body.message);
    const response = await generateResponse(body.message, intent);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    const fallbackResponse: ChatResponse = {
      response: '申し訳ございませんが、一時的にサービスにアクセスできません。しばらく時間をおいて再度お試しください。\n\n渋谷区の公式サイトでも情報をご確認いただけます。',
      sources: ['https://www.city.shibuya.tokyo.jp/'],
      toolsUsed: [],
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}