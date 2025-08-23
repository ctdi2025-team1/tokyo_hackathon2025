'use client';

import React, { useState } from 'react';
import {
  Box,
  Chip,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';

export interface ResourceCategory {
  id: string;
  name: string;
  value: number; // g/人・日
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
}

const MAIN_CATEGORIES: ResourceCategory[] = [
  { id: 'pet', name: 'ペットボトル', value: 23.4, color: 'info' },
  { id: 'paper', name: '紙類', value: 45.7, color: 'primary' },
  { id: 'glass', name: 'びん', value: 18.9, color: 'success' },
  { id: 'can', name: '缶', value: 15.2, color: 'warning' },
  { id: 'plastic', name: 'プラ容器包装', value: 24.1, color: 'secondary' },
];

const OTHER_CATEGORIES: ResourceCategory[] = [
  { id: 'paper_pack', name: '紙パック', value: 2.3 },
  { id: 'spray_can', name: 'スプレー缶・CB缶', value: 1.8 },
  { id: 'fluorescent', name: '蛍光管', value: 0.9 },
  { id: 'battery', name: '乾電池', value: 1.4 },
  { id: 'small_appliance', name: '小型家電', value: 3.7 },
  { id: 'textiles', name: '古着・古布', value: 8.2 },
];

interface ResourceChipsProps {
  selectedCategories?: string[];
  onCategorySelect?: (categoryIds: string[]) => void;
}

const ResourceChips: React.FC<ResourceChipsProps> = ({
  selectedCategories = ['pet', 'paper', 'glass', 'can', 'plastic'],
  onCategorySelect,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedCategories);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChipClick = (categoryId: string) => {
    if (MAIN_CATEGORIES.some(cat => cat.id === categoryId)) {
      // Toggle main category
      const newSelection = selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId];
      onCategorySelect?.(newSelection);
    }
  };

  const handleDialogOpen = () => {
    setTempSelected(selectedCategories);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogConfirm = () => {
    onCategorySelect?.(tempSelected);
    setDialogOpen(false);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setTempSelected(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getSelectedValue = () => {
    const allCategories = [...MAIN_CATEGORIES, ...OTHER_CATEGORIES];
    return selectedCategories
      .map(id => allCategories.find(cat => cat.id === id))
      .filter(Boolean)
      .reduce((sum, cat) => sum + (cat?.value || 0), 0);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h3">
          資源内訳（主要5品目）
        </Typography>
        <Typography variant="body2" color="text.secondary">
          選択中: {getSelectedValue().toFixed(1)} g/人・日
        </Typography>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
        {/* Main categories */}
        {MAIN_CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <Chip
              key={category.id}
              label={`${category.name} (${category.value}g)`}
              onClick={() => handleChipClick(category.id)}
              color={isSelected ? category.color : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              clickable
              aria-label={`${category.name}を${isSelected ? '選択解除' : '選択'}`}
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            />
          );
        })}

        {/* "その他..." button */}
        <Chip
          icon={<MoreHoriz />}
          label="その他..."
          onClick={handleDialogOpen}
          variant="outlined"
          clickable
          aria-label="その他の資源カテゴリを選択"
          sx={{
            borderStyle: 'dashed',
            '&:hover': {
              borderStyle: 'solid',
              backgroundColor: theme.palette.action.hover,
            },
          }}
        />
      </Box>

      {/* Selection dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby="resource-selection-dialog-title"
      >
        <DialogTitle id="resource-selection-dialog-title">
          資源カテゴリ選択
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            表示したい資源カテゴリを選択してください
          </Typography>
          
          <Typography variant="subtitle2" mb={1} fontWeight="medium">
            主要品目
          </Typography>
          <FormGroup sx={{ mb: 2 }}>
            {MAIN_CATEGORIES.map((category) => (
              <FormControlLabel
                key={category.id}
                control={
                  <Checkbox
                    checked={tempSelected.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                }
                label={`${category.name} (${category.value} g/人・日)`}
              />
            ))}
          </FormGroup>

          <Typography variant="subtitle2" mb={1} fontWeight="medium">
            その他の品目
          </Typography>
          <FormGroup>
            {OTHER_CATEGORIES.map((category) => (
              <FormControlLabel
                key={category.id}
                control={
                  <Checkbox
                    checked={tempSelected.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                }
                label={`${category.name} (${category.value} g/人・日)`}
              />
            ))}
          </FormGroup>

          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2" color="text.secondary">
              選択中の合計: <strong>{tempSelected
                .map(id => [...MAIN_CATEGORIES, ...OTHER_CATEGORIES].find(cat => cat.id === id))
                .filter(Boolean)
                .reduce((sum, cat) => sum + (cat?.value || 0), 0)
                .toFixed(1)} g/人・日</strong>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>
            キャンセル
          </Button>
          <Button onClick={handleDialogConfirm} variant="contained">
            適用
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResourceChips;