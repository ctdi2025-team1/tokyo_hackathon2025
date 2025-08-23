// 日付フォーマットの共通ユーティリティ
// すべての表示は日本語ロケール前提で扱う

/**
 * ISO文字列を指定オプションで日本語ロケールにフォーマット
 * 注意: 無効な日付が渡された場合の挙動は元コードと同一（例外を投げる可能性）
 */
function formatIsoJP(isoString: string, options: Intl.DateTimeFormatOptions): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ja-JP', options);
}

export function formatIsoToDateTimeJP(isoString: string): string {
  // 例: 2025/1/20 12:34
  return formatIsoJP(isoString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatIsoToShortJP(isoString: string): string {
  // 例: 1月20日 12:34
  return formatIsoJP(isoString, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeHHmm(time: string): string {
  // 'HH:mm' 文字列を 0-5 で切り出して返す（入力を信頼）
  return time.substring(0, 5);
}


