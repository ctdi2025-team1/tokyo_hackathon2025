import { NextRequest, NextResponse } from 'next/server';

export interface Event {
  id: string;
  source: 'sumida' | 'chuo' | 'bigsight';
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  allDay: boolean;
  venueName?: string;
  ward?: string;
  address?: string;
  lat?: number;
  lon?: number;
  tags: string[];
  forFamily: boolean;
  fee?: 'free' | 'paid' | 'mixed' | null;
  url?: string;
  updatedAt?: string;
}

interface EventsResponse {
  events: Event[];
  lastUpdated: string;
  sources: string[];
  totalCount: number;
}

// Helper function to get today in JST
const getTodayJST = (): string => {
  const now = new Date();
  const jstOffset = 9 * 60; // JST is UTC+9
  const jstTime = new Date(now.getTime() + (jstOffset * 60 * 1000));
  return jstTime.toISOString().split('T')[0]; // YYYY-MM-DD
};

// Helper function to check if event is ongoing today
const isEventOngoingToday = (event: Event, today: string): boolean => {
  return event.startDate <= today && today <= event.endDate;
};

// Helper function to determine if event is family-friendly
const isFamilyFriendly = (title: string, description?: string, tags?: string[]): boolean => {
  const familyKeywords = [
    '親子', '子連れ', '未就学', '小学生', 'ベビーカー', '親子体験', 
    '赤ちゃん', '乳幼児', 'ファミリー', '家族', 'キッズ', '子育て',
    'こども', '子ども', 'チルドレン', 'ベビー', 'kids', 'family'
  ];
  
  const textToCheck = [
    title.toLowerCase(),
    description?.toLowerCase() || '',
    ...(tags?.map(tag => tag.toLowerCase()) || [])
  ].join(' ');
  
  return familyKeywords.some(keyword => textToCheck.includes(keyword.toLowerCase()));
};

// Generate mock events for development
const generateMockEvents = (): Event[] => {
  const today = getTodayJST();
  
  const mockEvents: Event[] = [
    {
      id: 'sumida:001',
      source: 'sumida',
      title: '親子で楽しむ科学実験教室',
      description: '身近な材料を使って楽しい科学実験を体験しよう！小学生とその保護者が対象です。',
      startDate: today,
      endDate: today,
      startTime: '10:00',
      endTime: '12:00',
      allDay: false,
      venueName: '墨田区立科学館',
      ward: '墨田区',
      address: '東京都墨田区押上1-1-2',
      forFamily: true,
      fee: 'free',
      tags: ['親子', '科学', '体験', '小学生'],
      url: 'https://www.city.sumida.lg.jp/kuseijoho/event/',
    },
    {
      id: 'chuo:002',
      source: 'chuo',
      title: 'ベビーカーでお散歩ツアー',
      description: '中央区の歴史的スポットをベビーカーで巡るガイドツアー。段差の少ない道を選んでご案内します。',
      startDate: today,
      endDate: today,
      startTime: '14:00',
      endTime: '16:00',
      allDay: false,
      venueName: '中央区役所前集合',
      ward: '中央区',
      address: '東京都中央区築地1-1-1',
      forFamily: true,
      fee: 'free',
      tags: ['ベビーカー', '散歩', '歴史', 'ガイドツアー'],
      url: 'https://www.city.chuo.lg.jp/event/',
    },
    {
      id: 'bigsight:003',
      source: 'bigsight',
      title: 'キッズフェスタ2025',
      description: '子どもから大人まで楽しめる大型イベント。ワークショップやステージショーが満載！',
      startDate: today,
      endDate: today,
      startTime: '10:00',
      endTime: '18:00',
      allDay: false,
      venueName: '東京ビッグサイト 東展示棟',
      ward: '江東区',
      address: '東京都江東区有明3-11-1',
      forFamily: true,
      fee: 'paid',
      tags: ['キッズ', 'フェスタ', '大型イベント', 'ワークショップ'],
      url: 'https://www.bigsight.jp/visitor/event/',
    },
    {
      id: 'sumida:004',
      source: 'sumida',
      title: '図書館での読み聞かせ会',
      description: '地域のボランティアによる楽しい読み聞かせ。3歳から小学校低学年まで楽しめます。',
      startDate: today,
      endDate: today,
      startTime: '15:30',
      endTime: '16:30',
      allDay: false,
      venueName: '墨田区立中央図書館',
      ward: '墨田区',
      address: '東京都墨田区向島3-5-6',
      forFamily: true,
      fee: 'free',
      tags: ['読み聞かせ', '図書館', '未就学児', 'ボランティア'],
      url: 'https://www.city.sumida.lg.jp/sisetu_info/library/',
    },
    {
      id: 'chuo:005',
      source: 'chuo',
      title: 'オフィス街美術館巡り',
      description: 'ビジネス街にある美術館の作品鑑賞ツアー。現代アートを中心とした展示をご覧ください。',
      startDate: today,
      endDate: today,
      startTime: '11:00',
      endTime: '17:00',
      allDay: false,
      venueName: '中央区内美術館',
      ward: '中央区',
      forFamily: false,
      fee: 'paid',
      tags: ['美術館', 'アート', '現代アート'],
      url: 'https://www.city.chuo.lg.jp/bunka/',
    },
    {
      id: 'sumida:006',
      source: 'sumida',
      title: 'プログラミング体験教室',
      description: '小学生向けのプログラミング体験。Scratchを使って簡単なゲームを作ってみよう！',
      startDate: today,
      endDate: today,
      startTime: '13:00',
      endTime: '15:00',
      allDay: false,
      venueName: '墨田区IT学習センター',
      ward: '墨田区',
      forFamily: true,
      fee: 'free',
      tags: ['プログラミング', 'IT', 'Scratch', '小学生'],
      url: 'https://www.city.sumida.lg.jp/kuseijoho/event/',
    },
    {
      id: 'chuo:007',
      source: 'chuo',
      title: 'お茶会（一般向け）',
      description: '伝統的な茶道の体験会。初心者歓迎です。',
      startDate: today,
      endDate: today,
      startTime: '13:30',
      endTime: '15:30',
      allDay: false,
      venueName: '中央区文化センター',
      ward: '中央区',
      forFamily: false,
      fee: 'paid',
      tags: ['茶道', '伝統文化'],
      url: 'https://www.city.chuo.lg.jp/bunka/',
    },
  ];

  // Update forFamily based on content analysis
  return mockEvents.map(event => ({
    ...event,
    forFamily: isFamilyFriendly(event.title, event.description, event.tags),
    updatedAt: new Date().toISOString(),
  }));
};

// Sort events according to specification: forFamily desc -> startTime asc -> ward asc
const sortEvents = (events: Event[]): Event[] => {
  return events.sort((a, b) => {
    // First priority: family-friendly events first
    if (a.forFamily !== b.forFamily) {
      return b.forFamily ? 1 : -1;
    }
    
    // Second priority: start time (earliest first)
    if (a.startTime && b.startTime) {
      const timeComparison = a.startTime.localeCompare(b.startTime);
      if (timeComparison !== 0) return timeComparison;
    }
    
    // Third priority: ward name (alphabetical)
    if (a.ward && b.ward) {
      return a.ward.localeCompare(b.ward);
    }
    
    return 0;
  });
};

export async function GET(request: NextRequest) {
  try {
    // Add artificial delay to simulate API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const today = getTodayJST();
    
    // TODO: Replace with actual API calls
    // const sumidaEvents = await fetchSumidaCSV();
    // const chuoEvents = await fetchChuoCSV();
    // const bigsightEvents = await fetchBigsightHTML();
    // const allEvents = [...sumidaEvents, ...chuoEvents, ...bigsightEvents];
    
    const allEvents = generateMockEvents();
    
    // Filter to only today's ongoing events
    const ongoingEvents = allEvents.filter(event => isEventOngoingToday(event, today));
    
    // Sort according to specification
    const sortedEvents = sortEvents(ongoingEvents);
    
    // Limit to 100 events as per specification
    const limitedEvents = sortedEvents.slice(0, 100);
    
    const response: EventsResponse = {
      events: limitedEvents,
      lastUpdated: new Date().toISOString(),
      sources: [
        'https://www.city.sumida.lg.jp/kuseijoho/sumida_info/opendata/stdataset/event.html',
        'https://www.city.chuo.lg.jp/kusei/gaiyou/toukeidate/opendata.html',
        'https://www.bigsight.jp/visitor/event/',
      ],
      totalCount: limitedEvents.length,
    };
    
    // Add cache headers
    const nextResponse = NextResponse.json(response);
    nextResponse.headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    
    return nextResponse;
    
  } catch (error) {
    console.error('Failed to fetch events data:', error);
    
    // Return fallback data
    const fallbackResponse: EventsResponse = {
      events: [],
      lastUpdated: new Date().toISOString(),
      sources: [],
      totalCount: 0,
    };
    
    return NextResponse.json(
      { 
        ...fallbackResponse, 
        error: 'イベントデータの取得に失敗しました。', 
        sourceFallback: true 
      },
      { status: 200 }
    );
  }
}