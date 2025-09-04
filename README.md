# Survey & Workflow Application

Angular 20のStandalone Componentsを使用してXMLデータから動的にアンケートUIを生成する機能や、ワークフローに応じた文書回覧、データ統計の閲覧機能などを実装したアプリケーションです。

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

- **フレームワーク**: Angular 20
- **言語**: TypeScript 5.8
- **UIライブラリ**: Angular Material 20
- **フォーム**: Reactive Forms
- **グラフ**: Chart.js 4.5 + ng2-charts
- **スタイル**: SCSS
- **アーキテクチャ**: Standalone Components
- **CDK**: Angular CDK 20

## 📁 プロジェクト構造

```
src/
├── app/
│   ├── components/
│   │   ├── dynamic-survey.component.*     # 動的アンケートコンポーネント
│   │   ├── confirm-dialog.component.ts    # 確認ダイアログ
│   │   ├── survey-preview-dialog.component.ts  # アンケートプレビュー
│   │   ├── workflow-comment-dialog.component.ts  # ワークフローコメント
│   │   ├── workflow-detail-dialog.component.ts  # ワークフロー詳細
│   │   └── workflow-document-dialog.component.ts  # ワークフロー文書
│   ├── models/
│   │   └── survey.model.ts                # データモデル定義
│   ├── pages/
│   │   ├── dashboard/                     # ダッシュボード
│   │   ├── about/                         # アプリケーション情報
│   │   ├── survey/                        # アンケート管理
│   │   ├── survey-editor/                 # アンケートエディター
│   │   ├── workflow/                      # ワークフロー管理
│   │   └── statistics/                    # 統計・分析
│   ├── services/
│   │   ├── xml-parser.service.ts          # XMLパーサーサービス
│   │   ├── survey-editor.service.ts       # アンケートエディターサービス
│   │   ├── survey-file.service.ts         # アンケートファイルサービス
│   │   ├── survey-storage.service.ts      # アンケートストレージサービス
│   │   └── workflow.service.ts            # ワークフローサービス
│   ├── app.config.ts                      # アプリケーション設定
│   ├── app.routes.ts                      # ルーティング設定
│   ├── app.html                           # メインテンプレート
│   ├── app.scss                           # メインスタイル
│   └── app.ts                             # メインコンポーネント
├── assets/
│   └── data/
│       └── sample-survey.xml              # サンプルアンケートXML
└── styles.scss                            # グローバルスタイル
```

## 🚀 セットアップと実行

### 前提条件
- Node.js (v18以上)
- Angular CLI 20

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

実際のサンプルファイル（`src/assets/data/sample-survey.xml`）の例：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<survey id="employee-satisfaction-2024">
  <title>従業員満足度調査 2024</title>
  <description>職場環境と業務満足度に関する調査です。率直なご意見をお聞かせください。</description>
  <metadata>
    <created>2024-01-15</created>
    <version>1.0</version>
    <author>人事部</author>
  </metadata>
  
  <section id="basic-info">
    <title>基本情報</title>
    <description>まずは基本的な情報をお聞かせください。</description>
    
    <question id="department" type="select" required="true">
      <label>所属部署</label>
      <options>
        <option>営業部</option>
        <option>開発部</option>
        <option>人事部</option>
        <option>経理部</option>
        <option>その他</option>
      </options>
    </question>
    
    <question id="years" type="number" required="true">
      <label>勤続年数</label>
      <placeholder>年数を入力してください</placeholder>
      <validation>
        <min>0</min>
        <max>50</max>
      </validation>
    </question>
  </section>
  
  <section id="work-environment">
    <title>職場環境</title>
    <description>職場環境について評価してください。</description>
    
    <question id="workplace-satisfaction" type="radio" required="true">
      <label>職場環境の満足度</label>
      <options>
        <option>非常に満足</option>
        <option>満足</option>
        <option>普通</option>
        <option>不満</option>
        <option>非常に不満</option>
      </options>
    </question>
    
    <question id="improvements" type="textarea" required="false">
      <label>職場環境の改善点</label>
      <placeholder>具体的な改善提案があればお聞かせください</placeholder>
    </question>
  </section>
</survey>
```

## 🔧 カスタマイズ

### 新しい質問タイプの追加
1. `src/app/models/survey.model.ts`で質問タイプを定義
2. `src/app/components/dynamic-survey.component.ts`でUIコンポーネントを実装
3. `src/app/services/xml-parser.service.ts`でパーサーを拡張
4. バリデーションルールを追加

### ワークフローの拡張
1. `src/app/models/survey.model.ts`で新しいステータスを追加
2. `src/app/services/workflow.service.ts`で承認ルールをカスタマイズ
3. `src/app/components/workflow-*.component.ts`で通知機能を実装

### 統計機能の拡張
1. `src/app/pages/statistics/`で新しいメトリクスを追加
2. Chart.jsの設定でグラフの種類を増やす
3. `src/app/services/survey-storage.service.ts`でエクスポート機能を実装

### アンケートエディターの拡張
1. `src/app/pages/survey-editor/`でビジュアルエディター機能を追加
2. `src/app/services/survey-editor.service.ts`で編集機能を拡張
3. リアルタイムプレビュー機能の実装

## 🎯 アプリケーションの特徴

### 動的UI生成
- XML定義に基づく完全に動的なアンケートUI生成
- リアルタイムバリデーション
- レスポンシブデザイン対応

### ワークフロー管理
- 段階的承認プロセス
- コメント機能付きレビューシステム
- 進捗状況の可視化

### データ分析
- リアルタイム統計表示
- インタラクティブなグラフ
- エクスポート機能

### モダンなアーキテクチャ
- Angular 20の最新機能を活用
- Standalone Componentsによる軽量な構造
- TypeScriptによる型安全性

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
