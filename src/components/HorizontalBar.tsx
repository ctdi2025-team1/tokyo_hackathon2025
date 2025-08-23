'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';
import { formatNumber } from '../utils/garbage';

interface HorizontalBarData {
  name: string;
  value: number;
  unit: string;
  color: string;
}

interface HorizontalBarProps {
  data: HorizontalBarData[];
  title: string;
  showAnimation?: boolean;
  height?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: HorizontalBarData;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1,
          boxShadow: 2,
        }}
      >
        <Typography variant="body2" fontWeight="medium">
          {data.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatNumber(data.value)} {data.unit}
        </Typography>
      </Box>
    );
  }
  return null;
};

const HorizontalBar: React.FC<HorizontalBarProps> = ({
  data,
  title,
  showAnimation = true,
  height = 200,
}) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography
        variant="h6"
        component="h3"
        fontWeight="medium"
        mb={2}
        color="text.primary"
      >
        {title}
      </Typography>
      
      <Box height={height} aria-label={`${title}の横向き棒グラフ`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              tickFormatter={(value) => formatNumber(value)}
              style={{ fontSize: '12px', fill: theme.palette.text.secondary }}
            />
            <YAxis 
              type="category" 
              dataKey="name"
              width={55}
              style={{ fontSize: '12px', fill: theme.palette.text.secondary }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill={(entry) => entry.color}
              animationBegin={0}
              animationDuration={showAnimation ? 750 : 0}
              animationEasing="ease-out"
              radius={[0, 4, 4, 0]}
            >
              {data.map((entry, index) => (
                <Bar key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default HorizontalBar;