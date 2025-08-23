'use client';

// biome-ignore assist/source/organizeImports: manual import order for readability
import type React from 'react';

import {
  Chat as ChatIcon,
  Dashboard,
  Event,
  KeyboardArrowUp,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Container,
  Divider,
  Fab,
  Paper,
  Toolbar,
  Typography,
  useScrollTrigger,
  Zoom,
} from '@mui/material';

import Chat from './components/Chat';
import EventList from './components/EventList';
import KpiCards from './components/KpiCards';
import ResourcePieChart from './components/ResourceChips';

interface ScrollToTopProps {
  children: React.ReactElement;
}

function ScrollToTop({ children }: ScrollToTopProps) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = ((event.target as HTMLDivElement).ownerDocument || document).querySelector(
      '#back-to-top-anchor',
    );
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

export default function Home() {

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };



  return (
    <>
      {/* App Bar */}
      <AppBar 
        position="sticky" 
        elevation={2}
      >
        <Toolbar>
          <Dashboard sx={{ mr: 2, color: '#FFFFFF' }} />
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#FFFFFF' }}>
          （仮）「渋谷ダッシュボード＋イベント」
          </Typography>
          <Box display={{ xs: 'none', sm: 'flex' }} gap={2}>
            <Typography
              component="button"
              variant="button"
              onClick={() => scrollToSection('kpi-section')}
              sx={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                '&:hover': { 
                  textDecoration: 'underline',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                },
                color: '#FFFFFF',
                fontWeight: 'medium',
                px: 2,
                py: 1,
                transition: 'all 0.2s ease-in-out',
              }}
            >
              先週のゴミの量を確認
            </Typography>
            <Typography
              component="button"
              variant="button"
              onClick={() => scrollToSection('events-section')}
              sx={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                '&:hover': { 
                  textDecoration: 'underline',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                },
                color: '#FFFFFF',
                fontWeight: 'medium',
                px: 2,
                py: 1,
                transition: 'all 0.2s ease-in-out',
              }}
            >
              イベント
            </Typography>
            <Typography
              component="button"
              variant="button"
              onClick={() => scrollToSection('chat-section')}
              sx={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                '&:hover': { 
                  textDecoration: 'underline',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                },
                color: '#FFFFFF',
                fontWeight: 'medium',
                px: 2,
                py: 1,
                transition: 'all 0.2s ease-in-out',
              }}
            >
              AI質問
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Scroll to top anchor */}
      <div id="back-to-top-anchor" />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography 
            variant="h3" 
            component="h2" 
            fontWeight="medium" 
            color="primary" 
            gutterBottom
          >
            渋谷区 環境＆イベント情報
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            今出ているゴミと削減目標を確認しよう！
          </Typography>
        </Box>

        {/* KPI Section */}
        <Paper 
          id="kpi-section" 
          elevation={1} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(66, 165, 245, 0.08) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(25, 118, 210, 0.12)',
          }}
        >
          <KpiCards />
        </Paper>

        {/* Resource Breakdown Section */}
        <Paper 
          id="resource-section" 
          elevation={1} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, rgba(255, 64, 129, 0.03) 0%, rgba(255, 128, 171, 0.08) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(255, 64, 129, 0.12)',
          }}
        >
          <ResourcePieChart title="資源ごみ内訳" />
        </Paper>

        <Divider sx={{ my: 4 }} />

        {/* Events Section */}
        <Box id="events-section" mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <Event color="secondary" />
            <Typography variant="h4" component="h2" fontWeight="medium">
              今日のイベント
            </Typography>
          </Box>
          <EventList maxItems={10} />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Chat Section */}
        <Box id="chat-section" mb={4}>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <ChatIcon color="primary" />
            <Typography variant="h4" component="h2" fontWeight="medium">
              質問・相談
            </Typography>
          </Box>
          <Chat />
        </Box>

        {/* Footer */}
        <Box mt={8} pt={4} borderTop={1} borderColor="divider">
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
            © 2025 渋谷ダッシュボード - 公式オープンデータに基づく環境・イベント情報
          </Typography>
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            データ出典: SHIBUYA OPEN DATA, 墨田区オープンデータ, 中央区オープンデータ, 東京ビッグサイト
          </Typography>
        </Box>
      </Container>

      {/* Scroll to Top Button */}
      <ScrollToTop>
        <Fab size="small" aria-label="トップに戻る">
          <KeyboardArrowUp />
        </Fab>
      </ScrollToTop>
    </>
  );
}
