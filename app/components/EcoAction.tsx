
'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { getEcoAction } from '../../src/utils/ecoActions';

interface EcoActionProps {
  attributes: string[];
}

const EcoAction: React.FC<EcoActionProps> = ({ attributes }) => {
  const ecoAction = getEcoAction(attributes);

  if (!ecoAction) {
    return null;
  }

  return (
    <Box sx={{ ml: 2, width: '200px', flexShrink: 0 }}>
      <Typography variant="subtitle2" gutterBottom>
        エコアクション
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
        {attributes.map((attr) => (
          <Chip key={attr} label={attr} size="small" />
        ))}
      </Box>
      <Chip
        label={ecoAction}
        size="small"
        color="success"
        variant="outlined"
      />
    </Box>
  );
};

export default EcoAction;
