import { NextResponse } from 'next/server';

interface KpiData {
  household_gpd: number;
  recycling_gpd: number;
  deltas: {
    household: number;
    recycling: number;
  };
  lastUpdated: string;
  sources: string[];
  breakdown?: Record<string, number>;
}

// Mock data for development - realistic values based on Shibuya waste data
const generateMockKpiData = (): KpiData => {
  const baseHouseholdGpd = 315.7;
  const baseRecyclingGpd = 127.3;
  
  // Add some random variation to make it feel more realistic
  const householdVariation = (Math.random() - 0.5) * 20; // ±10g variation
  const recyclingVariation = (Math.random() - 0.5) * 10; // ±5g variation
  
  const household_gpd = baseHouseholdGpd + householdVariation;
  const recycling_gpd = baseRecyclingGpd + recyclingVariation;
  
  return {
    household_gpd: Number(household_gpd.toFixed(1)),
    recycling_gpd: Number(recycling_gpd.toFixed(1)),
    deltas: {
      household: Number(((Math.random() - 0.6) * 25).toFixed(1)), // Slightly negative bias for progress
      recycling: Number(((Math.random() - 0.3) * 15).toFixed(1)), // Slightly positive bias for recycling
    },
    lastUpdated: new Date().toISOString(),
    sources: [
      'https://city-shibuya-data.opendata.arcgis.com/',
      'https://www.city.shibuya.tokyo.jp/kurashi/gomi/gomi-number/gomi_jyoho.html',
    ],
    breakdown: {
      'ペットボトル': Number((20 + Math.random() * 10).toFixed(1)),
      '紙類': Number((40 + Math.random() * 15).toFixed(1)),
      'びん': Number((15 + Math.random() * 10).toFixed(1)),
      '缶': Number((18 + Math.random() * 8).toFixed(1)),
      'プラ容器包装': Number((16 + Math.random() * 8).toFixed(1)),
      '紙パック': Number((3 + Math.random() * 3).toFixed(1)),
      'スプレー缶・CB缶': Number((2 + Math.random() * 2).toFixed(1)),
      '蛍光管': Number((1 + Math.random() * 1).toFixed(1)),
      '乾電池': Number((1.5 + Math.random() * 1).toFixed(1)),
    },
  };
};

export async function GET() {
  try {
    // Add artificial delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // TODO: Replace with actual ArcGIS API calls
    // const householdData = await fetchArcGISData(HOUSEHOLD_WASTE_ENDPOINT);
    // const recyclingData = await fetchArcGISData(RECYCLING_DATA_ENDPOINT);
    // const kpiData = processKpiData(householdData, recyclingData);
    
    const kpiData = generateMockKpiData();
    
    // Add cache headers for development
    const response = NextResponse.json(kpiData);
    response.headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    
    return response;
    
  } catch (error) {
    console.error('Failed to fetch KPI data:', error);
    
    // Return fallback data in case of error
    const fallbackData: KpiData = {
      household_gpd: 320.0,
      recycling_gpd: 125.0,
      deltas: {
        household: 0,
        recycling: 0,
      },
      lastUpdated: new Date().toISOString(),
      sources: [
        'https://city-shibuya-data.opendata.arcgis.com/',
        'https://www.city.shibuya.tokyo.jp/kurashi/gomi/gomi-number/gomi_jyoho.html',
      ],
      breakdown: {
        'ペットボトル': 23.5,
        '紙類': 45.2,
        'びん': 18.7,
        '缶': 21.3,
        'プラ容器包装': 18.6,
      },
    };
    
    return NextResponse.json(
      { ...fallbackData, error: 'データの取得に失敗しました。前回のデータを表示しています。', sourceFallback: true },
      { status: 200 }
    );
  }
}