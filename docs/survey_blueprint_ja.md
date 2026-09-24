# Qualtrics画面構成

## ブロック1：参加同意

- Descriptive Text：`consent_qualtrics_ja.md`を、すべてのプレースホルダー確定後に掲載する。
- Multiple Choice（単一回答・必須）：参加条件
  - 「上記を読み、18歳以上で、調査への参加に同意します」
  - 「同意しません」
- Survey FlowのBranchで「同意しません」をEnd of Surveyへ送り、完了コードを表示しない。

## ブロック2：参加前質問

1. Multiple Choice（必須）：「直近1時間以内に、何か食べましたか？」
   - 表示：はい／いいえ
   - Recode Values：Yes／Noに相当する分析コードを後処理で付けるか、エクスポート後に変換する。
2. Text Entry（必須）：「直近1時間以内に食べた場合は、何を食べたか記入してください。食べていない場合は、最後に食べた時刻を記入してください。」
3. Text Entry → Content Validation → Number（必須、0より大きい）：「身長（cm）」
4. Text Entry → Content Validation → Number（必須、0より大きい）：「体重（kg）」

## ブロック3：44試行

- Descriptive Text質問を1つ作る。
- HTML表示で`experiment_question.html`を貼る。
- Question options → Add JavaScriptで既定コードを消し、`experiment_question.js`全体を貼る。
- 質問を単独のページに置く。前後にPage Breakを入れる。
- Back ButtonをSurvey Optionsで無効にする。
- JavaScriptが次ページへ自動移動するため、通常のNext Buttonは非表示になる。

## ブロック4：食品認識

4つのText Entry（すべて必須）。各質問に該当する食品画像をQualtrics Graphics Libraryから挿入する。

1. クッキー：「これは何ですか？ どのような味だと思いますか？」
2. クラッカー：同上
3. ブロッコリー：同上
4. カップケーキ：同上

画像は`../../ja/img/intro_cookie.jpg`、`intro_cracker.jpg`、`intro_broccoli.jpg`、`intro_cupcake.jpg`を使用する。

## ブロック5：食品選好

すべて単一回答・必須。

1. クッキーは好きですか？（はい／いいえ）
2. クラッカーは好きですか？（はい／いいえ）
3. クッキーとクラッカーでは、どちらがおいしいと思いますか？（クッキー／クラッカー）
4. クッキーとクラッカーでは、どちらがより好きですか？（クッキー／クラッカー）
5. ブロッコリーは好きですか？（はい／いいえ）
6. カップケーキは好きですか？（はい／いいえ）
7. ブロッコリーとカップケーキでは、どちらがおいしいと思いますか？（ブロッコリー／カップケーキ）
8. ブロッコリーとカップケーキでは、どちらがより好きですか？（ブロッコリー／カップケーキ）

## End of Survey

- Custom End of Survey Messageへ`end_of_survey.html`を貼る。
- PreviewではResponseIDの表示を必ず確認する。
- 「同意しない」「対象外」「Screen Out」経路では、この完了コード画面を使わない。
