import createCache from '@emotion/cache';

export function createEmotionCache() {
  return createCache({ 
    key: 'mui-style',
    prepend: true,
  });
}