'use client';

// biome-ignore assist/source/organizeImports: keep import order for clarity
// biome-ignore lint/style/useImportType: keep import order for clarity
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export interface ResourceData {
  id: string;
  name: string;
  value: number; // g/人・日
  percentage: number;
  color: string;
}

interface ResourcePieChartProps {
  title?: string;
}

const ResourcePieChart: React.FC<ResourcePieChartProps> = ({
  title = '資源内訳'
}) => {
  const [data, setData] = useState<ResourceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [total, setTotal] = useState<number>(0);

  const fetchResourceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/resources');
      // const result = await response.json();
      
      // Mock data for development
      const mockResourceData: ResourceData[] = [
        { id: 'pet', name: 'ペットボトル', value: 23.5, percentage: 18.5, color: '#ff6b6b' },
        { id: 'paper', name: '紙類', value: 45.2, percentage: 35.5, color: '#4ecdc4' },
        { id: 'glass', name: 'びん', value: 18.7, percentage: 14.7, color: '#ffe66d' },
        { id: 'can', name: '缶', value: 21.3, percentage: 16.7, color: '#95e1d3' },
        { id: 'plastic', name: 'プラ容器包装', value: 18.6, percentage: 14.6, color: '#a8e6cf' },
      ];
      
      const mockTotal = mockResourceData.reduce((sum, item) => sum + item.value, 0);
      
      setTimeout(() => {
        setData(mockResourceData);
        setLastUpdated(new Date().toLocaleString('ja-JP'));
        setTotal(mockTotal);
        setLoading(false);
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResourceData();
  }, [fetchResourceData]);

  const renderTooltip = (props: { active?: boolean; payload?: Array<{ payload: ResourceData }> }) => {
    if (props.active && props.payload && props.payload.length > 0) {
      const data = props.payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: 1,
            borderColor: 'grey.300',
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.value.toFixed(1)} g/人・日
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.percentage}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (error) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
          <IconButton onClick={fetchResourceData} size="small">
            <Refresh />
          </IconButton>
        </Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h3">
          {title}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            合計: {total.toFixed(1)} g/人・日
          </Typography>
          <IconButton 
            onClick={fetchResourceData} 
            size="small"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : <Refresh />}
          </IconButton>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box height={300} width="100%">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {lastUpdated && (
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
              最終更新: {lastUpdated}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default ResourcePieChart;