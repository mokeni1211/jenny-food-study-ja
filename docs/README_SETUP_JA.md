# Qualtrics版 Study 1 セットアップ手順

## 何をどこに置くか

| ファイル／内容 | 設置場所 |
|---|---|
| `static/img/` 47ファイル | GitHub Pagesまたは名古屋大学Webホスティングなど、HTTPSで一般公開できる静的領域 |
| `experiment_question.html` | QualtricsのDescriptive Text質問本文（HTML表示） |
| `experiment_question.js` | 同じ質問のQuestion options → Add JavaScript |
| `embedded_data_fields.txt`記載の10項目 | Qualtrics Survey Flow最上部のEmbedded Data |
| 同意・通常質問 | Qualtricsの標準質問として作成 |
| `end_of_survey.html` | QualtricsのCustom End of Survey Message |

実験回答そのものはQualtricsへ保存されます。静的ホスティングには食品画像だけを置き、回答は送りません。

## 1. 画像を公開する

`static/`フォルダを、その構造を変えずにHTTPSの静的サイトへアップロードします。公開後、例えば次のURLで画像が表示できることを確認します。

```text
https://example.ac.jp/food-study/img/cb_1.jpeg
https://example.ac.jp/food-study/img/lid_bg.jpg
```

この例の場合、`experiment_question.js`の設定は次です。

```javascript
var ASSET_BASE_URL = "https://example.ac.jp/food-study";
```

末尾の`/`はあってもなくても動作します。URLは必ずHTTPSにしてください。

### GitHub Pagesを使う場合

公開リポジトリに`static/`の中身を置き、GitHub Pagesを有効にします。食品画像とプログラム資産は公開されますが、参加者回答はGitHubへ送られません。倫理・大学規則上、GitHubから画像を配信してよいかを確認してください。アクセス時のIPアドレス等がGitHub側のWebログに残る可能性があります。

### 名古屋大学Webホスティングを使う場合

公開ディレクトリ内に`food-study/img/`を作り、47画像をアップロードします。PHPやデータベースは不要です。IPアクセスログの保存方針は大学へ確認してください。

## 2. Survey Flowを作る

Survey Flow最上部にEmbedded Data要素を追加し、`embedded_data_fields.txt`の10項目を登録します。値は空欄のままです。この要素を実験ブロックより前に置きます。

**重要（Qualtricsの新しい回答画面）：** フィールド名の`__js_`は省略しないでください。JavaScriptは`setJSEmbeddedData()`を使い、例えば`experiment_complete`をSurvey Flowの`__js_experiment_complete`に保存します。従来の`experiment_...`という名前の10項目は削除するか、この10項目で置き換えてください。

## 3. 通常質問を作る

`survey_blueprint_ja.md`の順に、同意、参加前質問、食品認識、食品選好をQualtrics標準質問で作成します。

## 4. 実験質問を作る

1. Descriptive Text質問を作成する。
2. Rich Content EditorをHTML表示に切り替え、`experiment_question.html`を貼る。
3. Question options → Add JavaScriptを開く。
4. 自動生成されたコードをすべて消す。
5. `experiment_question.js`全体を貼る。
6. `ASSET_BASE_URL`を公開した画像フォルダの親URLへ変更する。
7. この質問の前後にPage Breakを置き、ページ内に他の質問を置かない。

この実装はjsPsychを外部から読み込みません。Qualtrics上で44試行だけを直接動かすため、外部JavaScriptのCSP問題を避けています。

## 5. 終了画面を設定する

Survey OptionsまたはSurvey FlowのEnd of SurveyでCustom End of Survey Messageを選び、`end_of_survey.html`を貼ります。

完了コードにはQualtrics標準のResponseIDを使用します。エクスポート列では通常`ResponseId`として取得できます。CrowdWorks提出コードとこの列を照合します。

同意しない参加者や対象外参加者には、完了コードを表示しない別のEnd of Survey要素を使用してください。

## 6. データを戻す

実験データは11試行ずつ、次の4列にJSONとして保存されます。

```text
__js_experiment_data_1
__js_experiment_data_2
__js_experiment_data_3
__js_experiment_data_4
```

4つを順番に結合すると44試行になります。各試行には刺激ID、ブロック、F/J、キーコード、正答、反応時間、実測画像表示時間が含まれます。

`__js_experiment_complete=1`かつQualtricsのFinished列が完了を示す回答だけを支払い対象候補にします。ResponseIdとの一致も確認します。

## 7. 必須テスト

- Previewではなく匿名リンクでもテスト回答を1件送信する。
- 44試行が4つのJSON列に11件ずつ保存される。
- `__js_experiment_complete=1`が保存される。
- `ResponseId`が終了画面に表示され、CSVにも同じ値がある。
- cb→ccとcc→cbの両方が発生する。
- 各刺激表示時間が概ね400 msである。
- F以外・J以外のキーでは進まない。
- スマートフォン・タブレットでは開始できない。
- 画像読み込み失敗時は試行が始まらない。
- 実験中にQualtricsのNext Buttonが表示されない。
- 同意しない経路では完了コードが出ない。
- Windows Chrome/Edge、macOS Chrome/Safariで通し確認する。

## 注意点

- Qualtricsは実験質問ページを送信するまで、44試行のデータを正式な回答として確定しません。課題途中でブラウザを閉じた参加者について、完了済み試行を確実に回収する設計ではありません。
- ResponseIDをCrowdWorksへ提出させるため、CrowdWorks参加者とQualtrics回答を対応づけられます。同意説明と倫理申請をその前提へ変更してください。
- QualtricsのAnonymize Responses、IP記録、保存地域、保存期間は大学管理者へ確認してください。
- 公開前に倫理審査番号、正式題目、データ保存・撤回方針を確定してください。
