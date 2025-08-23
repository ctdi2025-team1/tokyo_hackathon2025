'use client';

// biome-ignore assist/source/organizeImports: <explanation>
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  Refresh,
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