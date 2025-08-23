// 日付フォーマットの共通ユーティリティ
// すべての表示は日本語ロケール前提で扱う

export function formatIsoToDateTimeJP(isoString: string): string {
  // 例: 2025/1/20 12:34
  const date = new Date(isoString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatIsoToShortJP(isoString: string): string {
  // 例: 1月20日 12:34
  const date = new Date(isoString);
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeHHmm(time: string): string {
  // 渡された 'HH:mm' 文字列をそのまま 0-5 で切り出す
  return time.substring(0, 5);
}


