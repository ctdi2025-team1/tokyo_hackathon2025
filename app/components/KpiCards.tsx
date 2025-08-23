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
  burnable_gpd: number;
  non_burnable_gpd: number;
  bulky_gpd: number;
  deltas: {
    burnable: number;
    non_burnable: number;
    bulky: number;
  };
  lastUpdated: string;
  sources: string[];
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
      
      // Mock data for development with zero values as requested
      const mockData: KpiData = {
        burnable_gpd: 0,
        non_burnable_gpd: 0,
        bulky_gpd: 0,
        deltas: {
          burnable: 0,
          non_burnable: 0,
          bulky: 0,
        },
        lastUpdated: new Date().toISOString(),
        sources: [
          'https://city-shibuya-data.opendata.arcgis.com/',
          'https://www.city.shibuya.tokyo.jp/kurashi/gomi/',
        ],
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
      name: '🔥 燃えるごみ',
      value: kpiData.burnable_gpd,
      target: 400,
      delta: kpiData.deltas.burnable,
      color: '#ff6b6b',
      targetColor: '#ff8e53'
    },
    {
      name: '🧱 燃えないごみ',
      value: kpiData.non_burnable_gpd,
      target: 50,
      delta: kpiData.deltas.non_burnable,
      color: '#4ecdc4',
      targetColor: '#45b7aa'
    },
    {
      name: '📦 粗大ゴミ',
      value: kpiData.bulky_gpd,
      target: 30,
      delta: kpiData.deltas.bulky,
      color: '#ffe66d',
      targetColor: '#ffb74d'
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
            {/* 可燃ごみカード */}
            <Card sx={{ flex: 1, border: '2px solid #ff6b6b', borderRadius: '12px' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h3" sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                    🔥 燃えるごみ
                  </Typography>
                  <Tooltip title="目標: 400g">
                    <Info fontSize="small" color="action" />
                  </Tooltip>
                </Box>
                
                <Typography variant="h4" component="div" fontWeight="bold" mb={1} sx={{ color: '#2d3748' }}>
                  {kpiData.burnable_gpd.toFixed(1)}
                  <Typography variant="body2" component="span" color="text.secondary" ml={1}>
                    グラム
                  </Typography>
                </Typography>

                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Chip
                    icon={getTrendIcon(kpiData.deltas.burnable)}
                    label={`前回より ${kpiData.deltas.burnable > 0 ? '+' : ''}${kpiData.deltas.burnable.toFixed(1)}g`}
                    size="small"
                    color={getTrendColor(kpiData.deltas.burnable)}
                    variant="outlined"
                  />
                  <Chip
                    label={`目標まで あと${(400 - kpiData.burnable_gpd).toFixed(1)}g`}
                    size="small"
                    color={kpiData.burnable_gpd <= 400 ? 'success' : 'warning'}
                    variant="filled"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* 不燃ごみカード */}
            <Card sx={{ flex: 1, border: '2px solid #4ecdc4', borderRadius: '12px' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h3" sx={{ color: '#4ecdc4', fontWeight: 'bold' }}>
                    🧱 燃えないごみ
                  </Typography>
                  <Tooltip title="目標: 50g">
                    <Info fontSize="small" color="action" />
                  </Tooltip>
                </Box>
                
                <Typography variant="h4" component="div" fontWeight="bold" mb={1} sx={{ color: '#2d3748' }}>
                  {kpiData.non_burnable_gpd.toFixed(1)}
                  <Typography variant="body2" component="span" color="text.secondary" ml={1}>
                    グラム
                  </Typography>
                </Typography>

                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Chip
                    icon={getTrendIcon(kpiData.deltas.non_burnable)}
                    label={`前回より ${kpiData.deltas.non_burnable > 0 ? '+' : ''}${kpiData.deltas.non_burnable.toFixed(1)}g`}
                    size="small"
                    color={getTrendColor(kpiData.deltas.non_burnable)}
                    variant="outlined"
                  />
                  <Chip
                    label={`目標まで あと${(50 - kpiData.non_burnable_gpd).toFixed(1)}g`}
                    size="small"
                    color={kpiData.non_burnable_gpd <= 50 ? 'success' : 'warning'}
                    variant="filled"
                  />
                </Box>
              </CardContent>
            </Card>

            {/* 粗大ごみカード */}
            <Card sx={{ flex: 1, border: '2px solid #ffe66d', borderRadius: '12px' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h3" sx={{ color: '#ff8f00', fontWeight: 'bold' }}>
                    📦 粗大ごみ
                  </Typography>
                  <Tooltip title="目標: 30g">
                    <Info fontSize="small" color="action" />
                  </Tooltip>
                </Box>
                
                <Typography variant="h4" component="div" fontWeight="bold" mb={1} sx={{ color: '#2d3748' }}>
                  {kpiData.bulky_gpd.toFixed(1)}
                  <Typography variant="body2" component="span" color="text.secondary" ml={1}>
                    グラム
                  </Typography>
                </Typography>

                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Chip
                    icon={getTrendIcon(kpiData.deltas.bulky)}
                    label={`前回より ${kpiData.deltas.bulky > 0 ? '+' : ''}${kpiData.deltas.bulky.toFixed(1)}g`}
                    size="small"
                    color={getTrendColor(kpiData.deltas.bulky)}
                    variant="outlined"
                  />
                  <Chip
                    label={`目標まで あと${(30 - kpiData.bulky_gpd).toFixed(1)}g`}
                    size="small"
                    color={kpiData.bulky_gpd <= 30 ? 'success' : 'warning'}
                    variant="filled"
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