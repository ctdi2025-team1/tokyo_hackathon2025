# 渋谷ダッシュボード + イベント MVP

子育て世帯が東京で開催されているイベントを見つけ、渋谷のごみ・資源回収KPIを追跡できるWebアプリケーション

## アプリケーションの主な画面と機能

本アプリケーションは、以下の主要な画面コンポーネントで構成されています。

*   **KPIカード (`KpiCards.tsx`)**
    *   渋谷区のゴミ排出量やリサイクル率などのKPIを、トレンドを示す矢印と共にカード形式で表示します。
    *   データは日次で更新され、区民一人当たりのグラム数で示されます。

*   **イベントリスト (`EventList.tsx`)**
    *   本日、東京で開催されるイベントを一覧で表示します。
    *   特に親子で参加しやすいイベントには「親子向け」バッジが表示され、一目でわかるようになっています。

*   **AIチャット (`Chat.tsx`)**
    *   ごみの分別方法など、暮らしに関する質問にAIが回答します。
    *   「ペットボトルの捨て方は？」のように自然な言葉で質問できます。

## 🚀 クイックスタート

### 必要な環境
- Node.js 20 LTS
- npm または pnpm

### セットアップ
```bash
# 依存関係のインストール
npm ci

# 開発サーバー起動
npm run dev

# ブラウザでアクセス
open http://localhost:3000
```

### 環境変数設定
`.env.local` ファイルを作成し、以下の環境変数を設定してください：
```bash
# Gemini AI用（必須）
GOOGLE_API_KEY=your_google_api_key

# ArcGIS データセット識別子
ARCGIS_DATASET_IDS=dataset_id_1,dataset_id_2
```

## 📁 プロジェクト構造

```
├── app/
│   ├── page.tsx                 # メインページ（シングルページレイアウト）
│   ├── layout.tsx               # アプリケーションレイアウト
│   ├── components/              # UIコンポーネント
│   │   ├── KpiCards.tsx         # KPIミニカード（トレンド指標付き）
│   │   ├── EventList.tsx        # イベントリスト（親子向けバッジ付き）
│   │   ├── Chat.tsx             # AIアシスタント付きチャット
│   │   └── ...
│   └── api/                     # APIエンドポイント
│       ├── events/today/        # 本日のイベント取得
│       ├── kpi/shibuya/         # 渋谷区KPIデータ
│       ├── separation/          # ごみ分別情報
│       └── chat/                # AIチャット機能
├── src/
│   ├── components/              # 共通コンポーネント
│   ├── services/                # データ取得サービス
│   ├── utils/                   # ユーティリティ関数
│   └── config/                  # 設定ファイル
├── tests/                       # テストファイル
└── lib/                         # ライブラリ関数（予定）
```

## 🛠️ 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# Lint実行
npm run lint

# テスト実行
npm test

```

## ✨ 主な機能

### フロントエンド機能
- **環境KPIダッシュボード**: 渋谷区のゴミ排出量・リサイクル状況の可視化
- **イベント一覧**: 親子向けイベントの検索・表示
- **AIチャット**: 自然言語での質問・回答機能
- **レスポンシブデザイン**: モバイル・デスクトップ対応

### APIエンドポイント
- `GET /api/events/today` - 本日開催のイベント一覧
- `GET /api/kpi/shibuya` - 渋谷区KPIデータ（g/人・日換算）
- `GET /api/separation?item={アイテム名}` - ごみ分別方法検索
- `POST /api/chat` - AIチャット機能（関数呼び出し対応）

## 🔗 バックエンド連携

### APIの型定義
フロントエンドで使用するAPI型定義：

```typescript
// イベントデータ
interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  isFamilyFriendly: boolean;
  source: 'sumida' | 'chuo' | 'bigsight';
  url?: string;
}

// KPIデータ
interface KPIData {
  metric: string;
  value: number;
  unit: 'g/人・日';
  trend: number;
  lastUpdated: string;
}

// 分別情報
interface SeparationInfo {
  item: string;
  category: string;
  instructions: string;
}
```

### データソース
- **渋谷KPIデータ**: SHIBUYA OPEN DATA (ArcGIS Feature Service)
- **イベントデータ**: 墨田区・中央区CSV、東京ビッグサイト公式リスト
- **ごみ分別**: ShibuyaOP-121データセット

### キャッシュ戦略
- 外部API呼び出しは6秒タイムアウト
- 指数バックオフによる1回リトライ
- 24時間フォールバックキャッシュ
- 最終更新時刻をUIに表示

## 💻 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **UI**: Material-UI v7 with Material 3 Expressive テーマ
- **グラフ**: Recharts
- **スタイル**: Emotion, Tailwind CSS

### 開発・テスト
- **テスト**: Vitest + Testing Library + MSW
- **E2E**: Playwright
- **Lint**: ESLint


### テスト対象
- 日時ユーティリティ（JST、月日数）
- 単位変換とKPI計算
- イベントフィルタリングとソート
- UIコンポーネント


### KPI計算ロジック
```typescript
// g/人・日の計算式
const dailyPerPersonGrams = totalGrams / (monthlyDays * avgPopulation);

// 昼夜平均人口
const avgPopulation = (daytimePopulation * 10 + nighttimePopulation * 14) / 24;

// トレンド計算
const trend = currentMonth - previousMonth;
```

### エラーハンドリング
- フォールバックデータの提供
- ユーザーフレンドリーなエラーメッセージ
- 手動更新機能



