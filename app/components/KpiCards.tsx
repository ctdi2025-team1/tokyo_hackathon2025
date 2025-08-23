'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Refresh,
  Info,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

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

const KpiCards: React.FC = () => {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKpiData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/kpi/shibuya');
      // const data = await response.json();
      
      // Mock data for development - using realistic values
      const mockData: KpiData = {
        household_gpd: 315.7,
        recycling_gpd: 127.3,
        deltas: {
          household: -12.4,
          recycling: 8.9,
        },
        lastUpdated: new Date().toISOString(),
        sources: [
          'https://city-shibuya-data.opendata.arcgis.com/',
          'https://www.city.shibuya.tokyo.jp/kurashi/gomi/',
        ],
        breakdown: {
          'ペットボトル': 23.5,
          '紙類': 45.2,
          'びん': 18.7,
          '缶': 21.3,
          'プラ容器包装': 18.6,
        },
      };
      
      setTimeout(() => {
        setKpiData(mockData);
        setLoading(false);
      }, 1000);
    } catch {
      setError('データの取得に失敗しました');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKpiData();
  }, [fetchKpiData]);

  const getTrendIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp color="error" fontSize="small" />;
    if (delta < 0) return <TrendingDown color="success" fontSize="small" />;
    return <Remove color="disabled" fontSize="small" />;
  };

  const getTrendColor = (delta: number) => {
    if (delta === 0) return 'default';
    // For both household and business waste, decrease is good (success), increase is bad (error)
    return delta > 0 ? 'error' : 'success';
  };

  const formatLastUpdated = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchKpiData}>
            再試行
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!kpiData) return null;

  // Chart data for bar visualization with targets for each waste type
  const chartData = [
    {
      name: '🏠 家庭ごみ',
      value: kpiData.household_gpd,
      target: 250,
      delta: kpiData.deltas.household,
      color: '#ff6b6b',
      targetColor: '#ff8e53'
    },
    {
      name: '♻️ 資源回収',
      value: kpiData.recycling_gpd,
      target: 150,
      delta: kpiData.deltas.recycling,
      color: '#4ecdc4',
      targetColor: '#45b7aa'
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" fontWeight="medium">
          渋谷区 環境データ
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="caption" color="text.secondary">
            最終更新: {formatLastUpdated(kpiData.lastUpdated)}
          </Typography>
          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={fetchKpiData}
            disabled={loading}
            aria-label="データを更新"
          >
            更新
          </Button>
        </Box>
      </Box>

      {/* Main Chart Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
              🗂️ ゴミダッシュボード
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              ゴミの量(t)
            </Typography>
          </Box>
          
          <Box sx={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="horizontal"
                data={chartData}
                margin={{
                  top: 20,
                  right: 100,
                  left: 80,
                  bottom: 30,
                }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12 }}
                  label={{ value: 't', position: 'insideBottom', offset: -10 }}
                  domain={[0, 450]}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={70}
                />
                <Bar 
                  dataKey="value" 
                  fill="#4299e1"
                  radius={[0, 8, 8, 0]}
                  name="現在の量"
                />
                <Bar 
                  dataKey="target" 
                  fill="#a0aec0"
                  radius={[0, 8, 8, 0]}
                  name="目標"
                  fillOpacity={0.8}
                  stroke="#718096"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>

        {/* KPI Cards */}
        <Box sx={{ width: '100%' }}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            {/* 家庭ごみカード */}
            <Card sx={{ 
              flex: 1, 
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', 
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
              border: 'none',
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                    🏠 家庭ごみ
                  </Typography>
                  <Tooltip title="目標: 250g/人・日（2033年まで）">
                    <Info fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </Tooltip>
                </Box>
                
                <Typography variant="h4" component="div" fontWeight="bold" mb={1} sx={{ color: 'white' }}>
                  {kpiData.household_gpd.toFixed(1)}
                  <Typography variant="body2" component="span" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} ml={1}>
                    g/人・日
                  </Typography>
                </Typography>

                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Chip
                    icon={getTrendIcon(kpiData.deltas.household)}
                    label={`前回より ${kpiData.deltas.household > 0 ? '+' : ''}${kpiData.deltas.household.toFixed(1)}g`}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                    variant="outlined"
                  />
                  <Chip
                    label={`目標まで あと${(kpiData.household_gpd - 250).toFixed(1)}g`}
                    size="small"
                    sx={{ 
                      backgroundColor: kpiData.household_gpd <= 250 ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 193, 7, 0.9)',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* 資源回収カード */}
            <Card sx={{ 
              flex: 1, 
              background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)', 
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(78, 205, 196, 0.3)',
              border: 'none',
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                    ♻️ 資源回収
                  </Typography>
                  <Tooltip title="目標: 150g/人・日（リサイクル率向上）">
                    <Info fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
                  </Tooltip>
                </Box>
                
                <Typography variant="h4" component="div" fontWeight="bold" mb={1} sx={{ color: 'white' }}>
                  {kpiData.recycling_gpd.toFixed(1)}
                  <Typography variant="body2" component="span" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} ml={1}>
                    g/人・日
                  </Typography>
                </Typography>

                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Chip
                    icon={getTrendIcon(kpiData.deltas.recycling)}
                    label={`前回より ${kpiData.deltas.recycling > 0 ? '+' : ''}${kpiData.deltas.recycling.toFixed(1)}g`}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                    variant="outlined"
                  />
                  <Chip
                    label={`目標まで ${kpiData.recycling_gpd >= 150 ? '達成' : `あと${(150 - kpiData.recycling_gpd).toFixed(1)}g`}`}
                    size="small"
                    sx={{ 
                      backgroundColor: kpiData.recycling_gpd >= 150 ? 'rgba(76, 175, 80, 0.9)' : 'rgba(33, 150, 243, 0.9)',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* 出典リンク */}
      <Box mt={3}>
        <Typography variant="caption" color="text.secondary">
          データ出典:
          {kpiData.sources.map((source, index) => (
            <React.Fragment key={source}>
              {index > 0 && ', '}
              <Typography
                component="a"
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                variant="caption"
                color="primary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                aria-label={`出典リンク ${index + 1}`}
              >
                SHIBUYA OPEN DATA
              </Typography>
            </React.Fragment>
          ))}
        </Typography>
      </Box>
    </Box>
  );
};

export default KpiCards;