'use client';

// biome-ignore assist/source/organizeImports: preserve import order for readability
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';

import { fetchGarbageGeoJSON } from '../services/fetchGarbage';
import type { GarbageTotals } from '../services/fetchGarbage';
import { 
  calcPerCapitaPerDay,
  calcDeltaFromTarget,
  getPopulation,
  formatNumber,
  formatDelta,
  TARGET_PER_CAPITA_PER_DAY,
} from '../utils/garbage';
import { formatIsoToDateTimeJP } from '../utils/date';

interface PerCapitaData {
  name: string;
  value: number;
  target: number;
}

const GarbageCard: React.FC = () => {
  const theme = useTheme();
  const [garbageData, setGarbageData] = useState<GarbageTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGarbageGeoJSON();
      setGarbageData(data);
    } catch (err) {
      console.error('Failed to fetch garbage data:', err);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!garbageData) return null;

  const population = getPopulation();
  const perCapitaKg = calcPerCapitaPerDay(garbageData.total, population, garbageData.periodDays);
  const { deltaKg, deltaPct } = calcDeltaFromTarget(perCapitaKg);
  const { pctText, isPositive } = formatDelta(deltaKg, deltaPct);

  // Convert to grams for display
  const perCapitaG = perCapitaKg * 1000;
  const targetG = TARGET_PER_CAPITA_PER_DAY * 1000;
  const deltaG = deltaKg * 1000;
  const gText = `${isPositive ? '+' : ''}${formatNumber(deltaG, 0)} g`;

  // 1人/日バーデータ (in grams)
  const perCapitaData: PerCapitaData[] = [
    {
      name: '現在',
      value: perCapitaG,
      target: targetG,
    },
  ];

  // Colors for bar and target line
  const isAchieved = perCapitaKg <= TARGET_PER_CAPITA_PER_DAY;
  const barColor = isAchieved ? theme.palette.success.main : theme.palette.error.main;
  // Always use green for target line and label for better recognition
  const lineColor = theme.palette.success.main;

  return (
    <Card elevation={2} sx={{ borderRadius: 2 }}>
      <CardContent>
        {/* ヘッダー */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
              ごみ排出量
            </Typography>
            <Typography variant="caption" color="text.secondary">
              最新: {formatIsoToDateTimeJP(garbageData.lastUpdated)}
            </Typography>
          </Box>
        </Box>

        

        {/* 1人/日バー + 基準線 */}
        <Box mb={3}>
          <Typography variant="h6" component="h3" fontWeight="medium" mb={2}>
            1人1日あたり排出量
          </Typography>
          <Box height={120} aria-label="1人1日あたり排出量と目標基準線">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={perCapitaData}
                layout="vertical"
                margin={{ top: 5, right: 110, left: 40, bottom: 25 }}
              >
                <XAxis 
                  type="number"
                  domain={[0, 450]}
                  tickFormatter={(value) => `${value} g`}
                  style={{ fontSize: '12px', fill: theme.palette.text.secondary }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  style={{ fontSize: '12px', fill: theme.palette.text.secondary }}
                />
                <Tooltip
                  formatter={(value: number) => [`${formatNumber(value, 0)} g/人・日`, '排出量']}
                />
                <Bar
                  dataKey="value"
                  fill={barColor}
                  animationBegin={100}
                  animationDuration={750}
                  animationEasing="ease-out"
                  radius={[0, 4, 4, 0]}
                />
                <ReferenceLine
                  x={targetG}
                  stroke={lineColor}
                  strokeDasharray="6 6"
                  strokeWidth={3}
                  label={{
                    value: `目標 ${formatNumber(targetG, 0)} g`,
                    position: 'right',
                    offset: 16,
                    style: { fill: lineColor, fontSize: 12, fontWeight: 600 },
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* 差分表示 */}
          <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={2}>
            <Box display="flex" alignItems="center" gap={1}>
              {isPositive ? (
                <TrendingUp color="error" fontSize="small" />
              ) : (
                <TrendingDown color="success" fontSize="small" />
              )}
              <Typography
                variant="body1"
                fontWeight="medium"
                color={isPositive ? 'error.main' : 'success.main'}
              >
                目標との差: {gText} ({pctText})
              </Typography>
            </Box>
            
            <Chip
              label={perCapitaKg <= TARGET_PER_CAPITA_PER_DAY ? '目標達成' : '目標未達'}
              color={perCapitaKg <= TARGET_PER_CAPITA_PER_DAY ? 'success' : 'error'}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

      </CardContent>
    </Card>
  );
};

export default GarbageCard;