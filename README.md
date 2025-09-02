# Survey & Workflow Application

Angular Direct Componentを用いてXMLデータから動的にアンケートUIを生成する機能や、ワークフローに応じた文書回覧、データ統計の閲覧機能などを実装したアプリケーションです。

## 🚀 主要機能

### 1. 動的アンケートUI生成
- XMLデータを解析して、質問形式やバリデーションルールに応じたUIを自動生成
- 対応する質問タイプ：
  - テキスト入力
  - 数値入力
  - 選択肢（ドロップダウン）
  - ラジオボタン
  - チェックボックス
  - テキストエリア
  - 日付入力
- バリデーション機能（必須項目、数値範囲、正規表現パターン）

### 2. ワークフロー管理
- 文書の承認フローを段階的に管理
- 各ステップの進捗状況を可視化
- 承認・却下・コメント追加機能
- ステータス管理（下書き、レビュー中、承認済み、却下）

### 3. データ統計・分析
- アンケート回答数の統計
- ワークフロー文書数の統計
- 平均応答時間の計算
- 完了率の算出
- 月次トレンドの可視化
- 分析インサイトの提供

## 🛠️ 技術スタック

- **フレームワーク**: Angular 17
- **言語**: TypeScript
- **UIライブラリ**: Angular Material
- **フォーム**: Reactive Forms
- **グラフ**: Chart.js
- **スタイル**: SCSS
- **アーキテクチャ**: Standalone Components

## 📁 プロジェクト構造

```
src/
├── app/
│   ├── components/
│   │   └── dynamic-survey.component.ts    # 動的アンケートコンポーネント
│   ├── models/
│   │   └── survey.model.ts                # データモデル定義
│   ├── pages/
│   │   ├── dashboard/
│   │   │   └── dashboard.component.ts     # ダッシュボード
│   │   ├── survey/
│   │   │   └── survey.component.ts        # アンケート管理
│   │   ├── workflow/
│   │   │   └── workflow.component.ts      # ワークフロー管理
│   │   └── statistics/
│   │       └── statistics.component.ts    # 統計・分析
│   ├── services/
│   │   └── xml-parser.service.ts          # XMLパーサーサービス
│   ├── app.config.ts                      # アプリケーション設定
│   ├── app.routes.ts                      # ルーティング設定
│   └── app.ts                             # メインコンポーネント
├── assets/
│   └── data/
│       └── sample-survey.xml              # サンプルアンケートXML
└── styles.scss                            # グローバルスタイル
```

## 🚀 セットアップと実行

### 前提条件
- Node.js (v18以上)
- Angular CLI

### インストール
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
ng serve

# ブラウザで http://localhost:4200 を開く
```

### ビルド
```bash
# 本番用ビルド
ng build

# 開発用ビルド
ng build --configuration development
```

## 📋 使用方法

### 1. アンケートの作成
1. XMLファイルでアンケートの構造を定義
2. 質問、選択肢、バリデーションルールを設定
3. アプリケーションでXMLファイルを読み込み
4. 動的にUIが生成される

### 2. ワークフローの管理
1. 新規文書を作成
2. 承認フローのステップを定義
3. 各ステップの担当者を設定
4. 承認・却下の処理を実行

### 3. データの分析
1. アンケート回答データの収集
2. ワークフローの進捗状況の追跡
3. 統計情報の可視化
4. インサイトの確認

## 📊 サンプルXML形式

```xml
<?xml version="1.0" encoding="UTF-8"?>
<survey id="sample-survey">
  <title>サンプルアンケート</title>
  <description>アンケートの説明</description>
  
  <section id="section-1">
    <title>セクションタイトル</title>
    <description>セクションの説明</description>
    
    <question id="q1" type="text" required="true">
      <label>質問ラベル</label>
      <placeholder>プレースホルダーテキスト</placeholder>
    </question>
    
    <question id="q2" type="radio" required="true">
      <label>選択肢の質問</label>
      <options>
        <option>選択肢1</option>
        <option>選択肢2</option>
      </options>
    </question>
  </section>
</survey>
```

## 🔧 カスタマイズ

### 新しい質問タイプの追加
1. `survey.model.ts`で質問タイプを定義
2. `dynamic-survey.component.ts`でUIコンポーネントを実装
3. バリデーションルールを追加

### ワークフローの拡張
1. 新しいステータスを追加
2. 承認ルールをカスタマイズ
3. 通知機能を実装

### 統計機能の拡張
1. 新しいメトリクスを追加
2. グラフの種類を増やす
3. エクスポート機能を実装

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📞 サポート

質問や問題がある場合は、GitHubのIssuesページで報告してください。
