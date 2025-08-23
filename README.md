## 🚀 開発の始め方

1.  依存関係をインストールします:
    ```bash
    npm install
    ```
2.  開発サーバーを起動します:
    ```bash
    npm run dev
    ```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、アプリケーションを確認できます。
メインページは `app/page.tsx` です。

## ✨ 主な機能

*   **環境ダッシュボード:** 渋谷区のゴミ排出量やリサイクル状況をグラフで可視化し、削減目標に対する進捗を確認できます。
*   **地域イベント一覧:** 区内や周辺地域で開催されるイベント（特に親子向け）を簡単に探せます。
*   **AIチャット:** ゴミの分別方法、イベント詳細、地域の統計情報などについて、AIに自然な言葉で質問できます。

## 💻 使用技術

*   Next.js
*   React
*   TypeScript
*   Material-UI (MUI)
*   Recharts

---

## 開発ルール

### セットアップとローカル実行
```bash
# 依存関係のインストール (package-lock.jsonに沿う)
npm ci

# 開発サーバー起動
npm run dev

# lintとビルドのチェック
npm run lint && npm run build
```

### Pull Request
- **CI:** Pull Requestは、CI（ビルド＆lint）のチェックをすべてパスする必要があります。

### APIデータ
- **型定義:** APIのデータ構造は `/contracts` ディレクトリで管理します。
- **モックデータ:** 開発用のモックデータは `/mocks` ディレクトリに配置します。
- **バックエンド接続:** 将来的にバックエンドAPIを呼び出す際は、`.env.local` に定義した `API_BASE_URL` を経由して接続します。

