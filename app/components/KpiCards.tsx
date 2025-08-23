'use client';

import React, { useState, useEffect } from 'react';
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

interface KpiData {
  household_gpd: number;
  recycling_gpd: number;
  deltas: {
    household: number;
    recycling: number;
  };
  lastUpdated: string;
  sources: string[];
}

interface KpiCardsProps {
  onResourceChipClick?: (category: string) => void;
}

const KpiCards: React.FC<KpiCardsProps> = ({ onResourceChipClick }) => {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKpiData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/kpi/shibuya');
      // const data = await response.json();
      
      // Mock data for development
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
      };
      
      setTimeout(() => {
        setKpiData(mockData);
        setLoading(false);
      }, 1000);
    } catch {
      setError('データの取得に失敗しました');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKpiData();
  }, []);

  const getTrendIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp color="error" fontSize="small" />;
    if (delta < 0) return <TrendingDown color="success" fontSize="small" />;
    return <Remove color="disabled" fontSize="small" />;
  };

  const getTrendColor = (delta: number, isRecycling = false) => {
    if (delta === 0) return 'default';
    // For household waste, decrease is good (success), increase is bad (error)
    // For recycling, increase is good (success), decrease is bad (warning)
    if (isRecycling) {
      return delta > 0 ? 'success' : 'warning';
    } else {
      return delta > 0 ? 'error' : 'success';
    }
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2" fontWeight="medium">
          渋谷区 環境KPI
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

      <Box display="flex" gap={2} sx={{ overflowX: 'auto', pb: 2 }}>
        {/* 家庭ごみカード */}
        <Card sx={{ minWidth: 280, flex: '1 1 auto' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6" component="h3" color="text.secondary">
                家庭ごみ
              </Typography>
              <Tooltip title="2033年目標: 250 g/人・日（渋谷区基本計画）">
                <Info fontSize="small" color="action" />
              </Tooltip>
            </Box>
            
            <Typography variant="h4" component="div" fontWeight="bold" mb={1}>
              {kpiData.household_gpd.toFixed(1)}
              <Typography variant="body2" component="span" color="text.secondary" ml={1}>
                g/人・日
              </Typography>
            </Typography>

            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={getTrendIcon(kpiData.deltas.household)}
                label={`前回差 ${kpiData.deltas.household > 0 ? '+' : ''}${kpiData.deltas.household.toFixed(1)}g`}
                size="small"
                color={getTrendColor(kpiData.deltas.household)}
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>

        {/* 資源回収量カード */}
        <Card sx={{ minWidth: 280, flex: '1 1 auto' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6" component="h3" color="text.secondary">
                資源回収量
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={() => onResourceChipClick?.('all')}
                aria-label="資源内訳を表示"
              >
                内訳 →
              </Button>
            </Box>
            
            <Typography variant="h4" component="div" fontWeight="bold" mb={1}>
              {kpiData.recycling_gpd.toFixed(1)}
              <Typography variant="body2" component="span" color="text.secondary" ml={1}>
                g/人・日
              </Typography>
            </Typography>

            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={getTrendIcon(kpiData.deltas.recycling)}
                label={`前回差 ${kpiData.deltas.recycling > 0 ? '+' : ''}${kpiData.deltas.recycling.toFixed(1)}g`}
                size="small"
                color={getTrendColor(kpiData.deltas.recycling, true)}
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 出典リンク */}
      <Box mt={2}>
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