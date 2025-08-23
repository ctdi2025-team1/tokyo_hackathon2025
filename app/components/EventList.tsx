'use client';

// biome-ignore assist/source/organizeImports: keep import order for clarity
import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Link,
  Skeleton,
} from '@mui/material';
import {
  FamilyRestroom,
  MoneyOff,
  Schedule,
  Place,
  Refresh,
  OpenInNew,
} from '@mui/icons-material';
import { formatTimeHHmm, formatIsoToShortJP } from '../../src/utils/date';

export interface Event {
  id: string;
  source: 'sumida' | 'chuo' | 'bigsight';
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  allDay: boolean;
  venueName?: string;
  ward?: string;
  address?: string;
  lat?: number;
  lon?: number;
  tags: string[];
  forFamily: boolean;
  fee?: 'free' | 'paid' | 'mixed' | null;
  url?: string;
  updatedAt?: string;
}

interface EventListProps {
  maxItems?: number;
}

const EventList: React.FC<EventListProps> = ({ maxItems = 20 }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/events/today');
      // const data = await response.json();
      
      // Mock data for development
      const mockEvents: Event[] = [
        {
          id: 'sumida:001',
          source: 'sumida',
          title: '親子で楽しむ科学実験教室',
          description: '身近な材料を使って楽しい科学実験を体験しよう！',
          startDate: '2025-01-20',
          endDate: '2025-01-20',
          startTime: '10:00',
          endTime: '12:00',
          allDay: false,
          venueName: '墨田区立科学館',
          ward: '墨田区',
          address: '東京都墨田区押上1-1-2',
          forFamily: true,
          fee: 'free',
          tags: ['親子', '科学', '体験'],
          url: 'https://example.com/event1',
        },
        {
          id: 'chuo:002',
          source: 'chuo',
          title: 'ベビーカーでお散歩ツアー',
          description: '中央区の歴史的スポットをベビーカーで巡るガイドツアー',
          startDate: '2025-01-20',
          endDate: '2025-01-20',
          startTime: '14:00',
          endTime: '16:00',
          allDay: false,
          venueName: '中央区役所前集合',
          ward: '中央区',
          address: '東京都中央区築地1-1-1',
          forFamily: true,
          fee: 'free',
          tags: ['ベビーカー', '散歩', '歴史'],
          url: 'https://example.com/event2',
        },
        {
          id: 'bigsight:003',
          source: 'bigsight',
          title: 'キッズフェスタ2025',
          description: '子どもから大人まで楽しめる大型イベント',
          startDate: '2025-01-20',
          endDate: '2025-01-22',
          startTime: '10:00',
          endTime: '18:00',
          allDay: false,
          venueName: '東京ビッグサイト',
          ward: '江東区',
          address: '東京都江東区有明3-11-1',
          forFamily: true,
          fee: 'paid',
          tags: ['キッズ', 'フェスタ', '大型イベント'],
          url: 'https://example.com/event3',
        },
        {
          id: 'sumida:004',
          source: 'sumida',
          title: '図書館での読み聞かせ会',
          description: '地域のボランティアによる楽しい読み聞かせ',
          startDate: '2025-01-20',
          endDate: '2025-01-20',
          startTime: '15:30',
          endTime: '16:30',
          allDay: false,
          venueName: '墨田区立中央図書館',
          ward: '墨田区',
          address: '東京都墨田区向島3-5-6',
          forFamily: true,
          fee: 'free',
          tags: ['読み聞かせ', '図書館', '未就学児'],
          url: 'https://example.com/event4',
        },
        {
          id: 'chuo:005',
          source: 'chuo',
          title: 'オフィス街美術館巡り',
          description: 'ビジネス街にある美術館の作品鑑賞',
          startDate: '2025-01-20',
          endDate: '2025-01-20',
          startTime: '11:00',
          endTime: '17:00',
          allDay: false,
          venueName: '中央区内美術館',
          ward: '中央区',
          forFamily: false,
          fee: 'paid',
          tags: ['美術館', 'アート'],
          url: 'https://example.com/event5',
        },
      ];

      setTimeout(() => {
        // Sort: family-friendly first, then by start time, then by ward
        const sortedEvents = mockEvents.sort((a, b) => {
          if (a.forFamily !== b.forFamily) {
            return b.forFamily ? 1 : -1;
          }
          if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime);
          }
          if (a.ward && b.ward) {
            return a.ward.localeCompare(b.ward);
          }
          return 0;
        }).slice(0, maxItems);

        setEvents(sortedEvents);
        setLastUpdated(new Date().toISOString());
        setLoading(false);
      }, 1200);
    } catch {
      setError('イベントデータの取得に失敗しました');
      setLoading(false);
    }
  }, [maxItems]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const formatTime = (time: string) => formatTimeHHmm(time);

  const formatLastUpdated = (isoString: string) => formatIsoToShortJP(isoString);

  const getSourceLabel = (source: string) => {
    const labels = {
      sumida: '墨田区',
      chuo: '中央区',
      bigsight: 'ビッグサイト',
    };
    return labels[source as keyof typeof labels] || source;
  };

  if (loading) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            今日開催中のイベント
          </Typography>
          <CircularProgress size={24} />
        </Box>
        {[...Array(3)].map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: keep import order for clarity
<Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="60%" height={20} />
              <Box display="flex" gap={1} mt={1}>
                <Skeleton variant="rounded" width={80} height={24} />
                <Skeleton variant="rounded" width={60} height={24} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchEvents}>
            再試行
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2" fontWeight="medium">
          今日開催中のイベント
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              最終更新: {formatLastUpdated(lastUpdated)}
            </Typography>
          )}
          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={fetchEvents}
            disabled={loading}
            aria-label="イベントデータを更新"
          >
            更新
          </Button>
        </Box>
      </Box>

      {events.length === 0 ? (
        <Alert severity="info">
          本日開催中のイベントが見つかりませんでした
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {events.map((event) => (
            <Card 
              key={event.id} 
              sx={{ 
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ pb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontWeight: 'medium',
                      lineHeight: 1.3,
                      flex: 1,
                      mr: 2,
                    }}
                  >
                    {event.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getSourceLabel(event.source)}
                  </Typography>
                </Box>

                {event.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, lineHeight: 1.4 }}
                  >
                    {event.description}
                  </Typography>
                )}

                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  {event.forFamily && (
                    <Chip
                      icon={<FamilyRestroom />}
                      label="親子向け"
                      size="small"
                      color="primary"
                      variant="filled"
                    />
                  )}
                  {event.fee === 'free' && (
                    <Chip
                      icon={<MoneyOff />}
                      label="無料"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {event.fee === 'paid' && (
                    <Chip
                      label="有料"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={2}>
                    {event.startTime && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(event.startTime)}
                          {event.endTime && ` - ${formatTime(event.endTime)}`}
                        </Typography>
                      </Box>
                    )}
                    
                    {(event.venueName || event.ward) && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Place fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {event.venueName 
                            ? `${event.venueName}${event.ward ? ` (${event.ward})` : ''}` 
                            : event.ward}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {event.url && (
                    <Button
                      component={Link}
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      endIcon={<OpenInNew />}
                      aria-label={`${event.title}の詳細を新しいタブで開く`}
                    >
                      詳細
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          データ出典: 墨田区オープンデータ、中央区オープンデータ、東京ビッグサイト公式サイト
        </Typography>
      </Box>
    </Box>
  );
};

export default EventList;