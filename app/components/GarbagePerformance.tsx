
'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { CheckCircle, TrendingDown, TrackChanges } from '@mui/icons-material';

interface GarbageInfo {
  goal?: number;
  lastYearEmissions?: number;
  thisYearEmissions?: number;
}

interface GarbagePerformanceProps {
  garbageInfo: GarbageInfo;
}

const GarbagePerformance: React.FC<GarbagePerformanceProps> = ({ garbageInfo }) => {
  const { goal, lastYearEmissions, thisYearEmissions } = garbageInfo;

  if (!goal && !lastYearEmissions) {
    return null;
  }

  const hasPerformanceData = lastYearEmissions && thisYearEmissions;
  const reduction = hasPerformanceData ? lastYearEmissions - thisYearEmissions : 0;
  const goalAchieved = hasPerformanceData && goal ? reduction >= goal : false;

  return (
    <Box sx={{ ml: 2, width: '200px', flexShrink: 0 }}>
      <Typography variant="subtitle2" gutterBottom>
        ごみ削減
      </Typography>
      
      {goal && (
        <Chip
          icon={<TrackChanges />}
          label={`目標: ${goal}kg削減`}
          size="small"
          sx={{ mb: 1 }}
        />
      )}

      {hasPerformanceData && (
        <Box>
          <Typography variant="caption">
            昨年: {lastYearEmissions}kg → 今年: {thisYearEmissions}kg
          </Typography>
          <Box sx={{ my: 1 }}>
            <Box sx={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
              <Box sx={{ width: `${(reduction / lastYearEmissions) * 100}%`, height: '100%', backgroundColor: goalAchieved ? 'success.main' : 'primary.main' }} />
            </Box>
          </Box>
          <Chip
            icon={goalAchieved ? <CheckCircle /> : <TrendingDown />}
            label={`削減量: ${reduction.toFixed(1)}kg`}
            size="small"
            color={goalAchieved ? 'success' : 'default'}
          />
        </Box>
      )}
    </Box>
  );
};

export default GarbagePerformance;
