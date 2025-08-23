'use client';

// KPIカード: 家庭ごみと資源回収の最新値と前回差を表示するコンポーネント

// biome-ignore assist/source/organizeImports: keep import order for clarity
import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  TrendingDown,
  Remove,
  Delete,
  Recycling,
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
  breakdown?: Record<string, number>;
  error?: string;
  sourceFallback?: boolean;
}

interface KpiCardsProps {
  showResourceChips?: boolean;
}

const KpiCards: React.FC<KpiCardsProps> = ({ showResourceChips = true }) => {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<string>('total');

  // KPIデータを取得（今はモック）。API接続時はここを差し替える。
  const fetchKpiData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
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
          'https://www.city.shibuya.tokyo.jp/kurashi/gomi/gomi_jyoho.html',
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
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKpiData();
  }, [fetchKpiData]);


  // 変化量からトレンドアイコンを返す
  const renderTrendIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp fontSize="small" />;
    if (delta < 0) return <TrendingDown fontSize="small" />;
    return <Remove fontSize="small" />;
  };

  // 変化量からChipの色を決定
  const getTrendChipColor = (delta: number, isHousehold = false) => {
    if (delta === 0) return 'default';
    // For household waste, decrease is good (green), increase is bad (red)
    // For recycling, increase is good (green), decrease is bad (red)
    if (isHousehold) {
      return delta < 0 ? 'success' : 'error';
    } else {
      return delta > 0 ? 'success' : 'error';
    }
  };

  // ±付きの差分表記
  const formatDeltaWithSign = (delta: number) => {
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)}g`;
  };

  const mainResourceTypes = ['ペットボトル', '紙類', 'びん', '缶', 'プラ容器包装'];

  if (loading) {
    return (
      <Box>
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            KPIデータを読み込み中...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error && !kpiData) {
    return (
      <Alert 
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchKpiData} startIcon={<Refresh />}>
            再試行
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!kpiData) {
    return (
      <Alert severity="warning">
        KPIデータが利用できません
      </Alert>
    );
  }

  return (
    <Box>
      {/* Show warning if using fallback data */}
      {(kpiData.error || kpiData.sourceFallback) && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchKpiData}
              startIcon={<Refresh />}
            >
              更新
            </Button>
          }
        >
          {kpiData.error || 'フォールバックデータを表示しています。最新取得に失敗。前回データを表示中'}
        </Alert>
      )}

      {/* KPI Mini Cards */}
      <Box display="flex" gap={2} mb={3} sx={{ overflowX: 'auto', pb: 1 }}>
        {/* Household Waste Card */}
        <Card sx={{ minWidth: 280, flex: 1 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Delete color="error" />
                <Typography variant="h6" component="h3" fontWeight="medium">
                  家庭ごみ
                </Typography>
              </Box>
              <IconButton size="small" onClick={fetchKpiData} disabled={loading}>
                {loading ? <CircularProgress size={16} /> : <Refresh />}
              </IconButton>
            </Box>
            
            <Typography variant="h4" component="div" fontWeight="bold" mb={1}>
              {kpiData.household_gpd.toFixed(1)}
              <Typography component="span" variant="body1" color="text.secondary" ml={1}>
                g/人・日
              </Typography>
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Chip
                icon={renderTrendIcon(kpiData.deltas.household)}
                label={`前回差 ${formatDeltaWithSign(kpiData.deltas.household)}`}
                size="small"
                color={getTrendChipColor(kpiData.deltas.household, true)}
                variant="filled"
              />
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              目標: 250g/人・日（2033年まで）
            </Typography>
          </CardContent>
        </Card>

        {/* Recycling Card */}
        <Card sx={{ minWidth: 280, flex: 1 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Recycling color="success" />
                <Typography variant="h6" component="h3" fontWeight="medium">
                  資源回収量
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="h4" component="div" fontWeight="bold" mb={1}>
              {kpiData.recycling_gpd.toFixed(1)}
              <Typography component="span" variant="body1" color="text.secondary" ml={1}>
                g/人・日
              </Typography>
            </Typography>
            
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Chip
                icon={renderTrendIcon(kpiData.deltas.recycling)}
                label={`前回差 ${formatDeltaWithSign(kpiData.deltas.recycling)}`}
                size="small"
                color={getTrendChipColor(kpiData.deltas.recycling, false)}
                variant="filled"
              />
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              リサイクル率向上中
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Resource Breakdown Chips */}
      {showResourceChips && kpiData.breakdown && (
        <Box>
          <Typography variant="h6" component="h4" gutterBottom sx={{ fontWeight: 'medium' }}>
            資源内訳チップ
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            <Chip
              label={`合計: ${kpiData.recycling_gpd.toFixed(1)}g`}
              onClick={() => setSelectedResource('total')}
              color={selectedResource === 'total' ? 'primary' : 'default'}
              variant={selectedResource === 'total' ? 'filled' : 'outlined'}
              clickable
            />
            {mainResourceTypes.map((type) => (
              kpiData.breakdown?.[type] !== undefined && (
                <Chip
                  key={type}
                  label={`${type}: ${kpiData.breakdown[type].toFixed(1)}g`}
                  onClick={() => setSelectedResource(type)}
                  color={selectedResource === type ? 'primary' : 'default'}
                  variant={selectedResource === type ? 'filled' : 'outlined'}
                  clickable
                />
              )
            ))}
            <Chip
              label="その他..."
              variant="outlined"
              clickable
              onClick={() => {
                // TODO: Implement bottom sheet for all resource types
                console.log('Show all resource types in bottom sheet');
              }}
            />
          </Box>

          {selectedResource !== 'total' && kpiData.breakdown?.[selectedResource] && (
            <Typography variant="body2" color="text.secondary">
              選択中: {selectedResource} - {kpiData.breakdown[selectedResource].toFixed(1)} g/人・日
            </Typography>
          )}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
    </Box>
  );
};

export default KpiCards;