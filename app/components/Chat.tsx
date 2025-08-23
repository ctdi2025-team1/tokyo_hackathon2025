'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Link,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Refresh,
  OpenInNew,
  ContentCopy,
} from '@mui/icons-material';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  error?: boolean;
}

interface ChatResponse {
  message: string;
  sources?: string[];
  error?: boolean;
}

const SAMPLE_QUESTIONS = [
  '今日の親子向けイベントを教えて',
  '渋谷の家庭ごみの最新値は？',
  'ペットボトルはどうやって出すの？',
];

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: content }),
      // });
      // const data: ChatResponse = await response.json();

      // Mock response for development
      const mockResponse: ChatResponse = await new Promise(resolve => {
        setTimeout(() => {
          const responses = {
            'イベント': {
              message: `本日開催中の親子向けイベントを3件お伝えします：

**1. 親子で楽しむ科学実験教室**
- 時間: 10:00-12:00
- 場所: 墨田区立科学館
- 料金: 無料

**2. ベビーカーでお散歩ツアー**  
- 時間: 14:00-16:00
- 場所: 中央区役所前集合
- 料金: 無料

**3. 図書館での読み聞かせ会**
- 時間: 15:30-16:30
- 場所: 墨田区立中央図書館
- 料金: 無料

どちらも親子で楽しめる内容となっています。`,
              sources: [
                'https://www.city.sumida.lg.jp/kuseijoho/sumida_info/opendata/',
                'https://www.city.chuo.lg.jp/kusei/gaiyou/toukeidate/opendata.html',
              ],
            },
            'KPI': {
              message: `渋谷区の最新家庭ごみデータをお伝えします：

**現在値**: 315.7 g/人・日
**前回差**: -12.4g（改善）
**目標値**: 250 g/人・日（2033年まで）

前回より12.4g削減されており、良い傾向です。目標達成にはさらに65.7g/人・日の削減が必要です。

資源回収量は127.3 g/人・日（前回差 +8.9g）で、リサイクル率向上に取り組んでいます。`,
              sources: [
                'https://city-shibuya-data.opendata.arcgis.com/',
                'https://www.city.shibuya.tokyo.jp/kurashi/gomi/gomi_jyoho.html',
              ],
            },
            '分別': {
              message: `ペットボトルの正しい出し方をご案内します：

**分別区分**: 資源（プラスチック）
**出し方**: 
1. キャップとラベルを外す
2. 中身を空にして軽くすすぐ
3. つぶして透明・半透明の袋に入れる
4. 資源回収日（週1回）に指定場所へ

**注意点**:
- 油分や汚れが落ちない場合は可燃ごみへ
- キャップは分別して資源プラスチックへ

正しい分別にご協力ありがとうございます！`,
              sources: [
                'https://city-shibuya-data.opendata.arcgis.com/datasets/ShibuyaOP-121',
              ],
            },
          };

          // Simple keyword matching for demo
          const content_lower = content.toLowerCase();
          if (content_lower.includes('イベント') || content_lower.includes('親子')) {
            resolve(responses['イベント']);
          } else if (content_lower.includes('ごみ') || content_lower.includes('kpi') || content_lower.includes('最新')) {
            resolve(responses['KPI']);
          } else if (content_lower.includes('分別') || content_lower.includes('ペット') || content_lower.includes('出し方')) {
            resolve(responses['分別']);
          } else {
            resolve({
              message: `申し訳ございません。以下の質問にお答えできます：

1. **今日のイベント検索**
   例：「今日の親子向けイベントを教えて」

2. **渋谷区のKPI情報**
   例：「渋谷の家庭ごみの最新値は？」

3. **ごみ分別方法**
   例：「ペットボトルはどうやって出すの？」

お気軽にお尋ねください！`,
              sources: [],
            });
          }
        }, 1500);
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: mockResponse.message,
        sources: mockResponse.sources,
        timestamp: new Date(),
        error: mockResponse.error,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'すみません、現在システムに接続できません。しばらく後にもう一度お試しください。',
        timestamp: new Date(),
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSampleQuestionClick = (question: string) => {
    sendMessage(question);
  };

  const handleRetry = (messageContent: string) => {
    sendMessage(messageContent);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" fontWeight="medium" mb={2}>
        AIアシスタント
      </Typography>

      <Card sx={{ mb: 2, maxHeight: 600, display: 'flex', flexDirection: 'column' }}>
        {/* Messages area */}
        <CardContent sx={{ flex: 1, overflow: 'auto', maxHeight: 400 }}>
          {messages.length === 0 ? (
            <Box textAlign="center" py={4}>
              <SmartToy sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" mb={2}>
                こんにちは！渋谷区のごみ・資源情報や今日のイベントについてお答えします。
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                以下のような質問をお試しください：
              </Typography>
              <Box display="flex" flexDirection="column" gap={1} alignItems="center">
                {SAMPLE_QUESTIONS.map((question, index) => (
                  <Chip
                    key={index}
                    label={question}
                    onClick={() => handleSampleQuestionClick(question)}
                    clickable
                    variant="outlined"
                    sx={{ maxWidth: '100%' }}
                  />
                ))}
              </Box>
            </Box>
          ) : (
            <Box>
              {messages.map((message, index) => (
                <Box key={message.id} mb={2}>
                  <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
                    {message.role === 'user' ? (
                      <Person fontSize="small" color="primary" />
                    ) : (
                      <SmartToy fontSize="small" color="secondary" />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {message.role === 'user' ? 'あなた' : 'AIアシスタント'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {message.timestamp.toLocaleTimeString('ja-JP', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </Box>
                  
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      ml: message.role === 'user' ? 4 : 0,
                      mr: message.role === 'user' ? 0 : 4,
                      bgcolor: message.role === 'user' 
                        ? 'primary.light' 
                        : message.error 
                          ? 'error.light' 
                          : 'grey.50',
                      position: 'relative',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-line',
                        '& strong': { fontWeight: 'bold' },
                        '& **strong**': { fontWeight: 'bold' },
                      }}
                    >
                      {message.content}
                    </Typography>
                    
                    {message.role === 'assistant' && !message.error && (
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(message.content)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        aria-label="回答をコピー"
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    )}
                    
                    {message.error && (
                      <Box mt={2}>
                        <Button
                          size="small"
                          startIcon={<Refresh />}
                          onClick={() => handleRetry(messages[index - 1]?.content || '')}
                        >
                          再試行
                        </Button>
                      </Box>
                    )}
                  </Paper>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <Box mt={1} ml={message.role === 'user' ? 4 : 0}>
                      <Typography variant="caption" color="text.secondary">
                        出典:
                      </Typography>
                      {message.sources.map((source, sourceIndex) => (
                        <Box key={sourceIndex} display="inline" ml={1}>
                          <Link
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="caption"
                            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                          >
                            参考資料 {sourceIndex + 1}
                            <OpenInNew sx={{ fontSize: 12, ml: 0.5 }} />
                          </Link>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
              
              {isLoading && (
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <SmartToy fontSize="small" color="secondary" />
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    回答を生成中...
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <Divider />

        {/* Input area */}
        <CardContent sx={{ pt: 2, pb: 2 }}>
          <form onSubmit={handleSubmit}>
            <Box display="flex" gap={1}>
              <TextField
                ref={inputRef}
                fullWidth
                variant="outlined"
                placeholder="ごみ・リサイクルやイベントについて質問してください..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                multiline
                maxRows={3}
                aria-label="チャット入力"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!inputValue.trim() || isLoading}
                sx={{ 
                  borderRadius: 2,
                  minWidth: 56,
                  height: 56,
                }}
                aria-label="メッセージを送信"
              >
                {isLoading ? <CircularProgress size={24} /> : <Send />}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Typography variant="caption" color="text.secondary">
        このAIアシスタントは渋谷区の公式オープンデータに基づいて回答しています。
        最新情報は各データ出典をご確認ください。
      </Typography>
    </Box>
  );
};

export default Chat;