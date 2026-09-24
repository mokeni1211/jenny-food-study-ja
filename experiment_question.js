/*
 * Qualtrics custom JavaScript for Study 1 Japanese adult replication.
 * Paste the contents of this file inside the Add JavaScript editor for the
 * descriptive-text question containing experiment_question.html.
 */
Qualtrics.SurveyEngine.addOnload(function () {
  "use strict";

  var q = this;
  q.hideNextButton();

  /* Change this one line after publishing the static/ directory. */
  var ASSET_BASE_URL = "https://mokeni1211.github.io/jenny-food-study-ja/static";
  var STUDY_VERSION = "ccb-ja-qualtrics-1.0.0";
  var itemOrder = ["p1","p2","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"];
  var correctKeys = [74,70,74,70,70,74,74,70,70,74,74,74,70,74,70,74,70,70,74,70,74,70,74,70,74,70,70,74,74,70,70,74,74,74,70,74,70,74,70,70,74,70,74,70];
  var blockOrder = Math.random() < 0.5 ? ["cb","cc"] : ["cc","cb"];
  var root = document.getElementById("food-task-root");
  var trials = [];
  var blockIndex = 0;
  var itemIndex = 0;
  var keyHandler = null;
  var startedAt = new Date().toISOString();
  var style = document.createElement("style");

  style.textContent = [
    "#food-task-root{max-width:1000px;min-height:650px;margin:0 auto;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Yu Gothic','Hiragino Kaku Gothic ProN',sans-serif;line-height:1.7}",
    "#food-task-root .ft-page{max-width:850px;margin:30px auto;text-align:left}",
    "#food-task-root .ft-keys{display:flex;justify-content:space-between;font-size:1.2rem;font-weight:700;margin:0 5% 12px}",
    "#food-task-root .ft-image{display:block;max-width:92%;max-height:68vh;margin:0 auto}",
    "#food-task-root .ft-button{display:inline-block;margin:25px;padding:12px 30px;font-size:1.05rem;cursor:pointer}",
    "#food-task-root .ft-warning{padding:16px;border:2px solid #a00;background:#fff4f4;text-align:left}",
    "#food-task-root .ft-loading{margin-top:120px;font-size:1.15rem}"
  ].join("");
  document.head.appendChild(style);

  function asset(name) {
    return ASSET_BASE_URL.replace(/\/$/, "") + "/img/" + name;
  }

  function setHtml(html) {
    root.innerHTML = html;
  }

  function promptHeader() {
    return '<p><strong>食べ物の数が多いのは、どちらのお皿ですか？</strong></p>' +
      '<div class="ft-keys"><span>左：Fキー</span><span>右：Jキー</span></div>';
  }

  function isUnsupportedDevice() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || !window.matchMedia("(pointer:fine)").matches;
  }

  function imageNames() {
    var names = ["lid_bg.jpg", "cb_intro.jpg", "cc_intro.jpg"];
    ["cb", "cc"].forEach(function (prefix) {
      itemOrder.forEach(function (item) { names.push(prefix + "_" + item + ".jpeg"); });
    });
    return names;
  }

  function preloadImages() {
    var names = imageNames();
    var loaded = 0;
    setHtml('<p class="ft-loading">画像を読み込んでいます（0/' + names.length + '）…</p>');
    return Promise.all(names.map(function (name) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () {
          loaded += 1;
          setHtml('<p class="ft-loading">画像を読み込んでいます（' + loaded + '/' + names.length + '）…</p>');
          resolve();
        };
        img.onerror = function () { reject(new Error("画像を読み込めません: " + name)); };
        img.src = asset(name);
      });
    }));
  }

  function showLoadError(error) {
    console.error(error);
    setHtml('<div class="ft-page"><div class="ft-warning"><strong>実験画像を読み込めませんでした。</strong><br>' +
      '通信状態を確認して「再試行」を押してください。この画面を閉じたり、ブラウザの戻るボタンを押したりしないでください。</div>' +
      '<p style="text-align:center"><button type="button" id="ft-retry" class="ft-button">再試行</button></p></div>');
    document.getElementById("ft-retry").onclick = beginLoading;
  }

  function beginLoading() {
    preloadImages().then(function () { showBlockIntro(); }).catch(showLoadError);
  }

  function showBlockIntro() {
    var block = blockOrder[blockIndex];
    var foods = block === "cb" ? "カップケーキとブロッコリー" : "クッキーとクラッカー";
    setHtml('<div class="ft-page" style="text-align:center"><h2>ブロック ' + (blockIndex + 1) + ' / 2</h2>' +
      '<p>このブロックでは、' + foods + 'が表示されます。<br>2枚のお皿のうち、食べ物の数が多い方を選んでください。</p>' +
      '<img class="ft-image" src="' + asset(block + "_intro.jpg") + '" alt="このブロックで使用する食品">' +
      '<button type="button" id="ft-block-start" class="ft-button">このブロックを始める</button></div>');
    document.getElementById("ft-block-start").onclick = showStimulus;
  }

  function showStimulus() {
    var block = blockOrder[blockIndex];
    var item = itemOrder[itemIndex];
    var stimulusId = block + "_" + item;
    var onset = performance.now();
    setHtml(promptHeader() + '<img class="ft-image" src="' + asset(stimulusId + ".jpeg") + '" alt="食品が載った2枚のお皿">');
    window.setTimeout(function () { showChoice(onset, stimulusId); }, 400);
  }

  function showChoice(stimulusOnset, stimulusId) {
    var choiceOnset = performance.now();
    setHtml(promptHeader() + '<img class="ft-image" src="' + asset("lid_bg.jpg") + '" alt="ふたで隠された2枚のお皿">');
    keyHandler = function (event) {
      var key = event.key.toLowerCase();
      if (key !== "f" && key !== "j") return;
      event.preventDefault();
      document.removeEventListener("keydown", keyHandler);
      keyHandler = null;
      var keyCode = key === "f" ? 70 : 74;
      var globalIndex = blockIndex * 22 + itemIndex;
      trials.push({
        trial_index: globalIndex + 1,
        block_number: blockIndex + 1,
        block_order: blockOrder.join("-"),
        bgstim: blockOrder[blockIndex],
        stimulus_id: stimulusId,
        item_id: itemOrder[itemIndex],
        key: key,
        key_code: keyCode,
        correct_key_code: correctKeys[globalIndex],
        correct: keyCode === correctKeys[globalIndex],
        rt: Math.round(performance.now() - choiceOnset),
        stimulus_duration_ms: Math.round(choiceOnset - stimulusOnset),
        test_part: "practice"
      });
      itemIndex += 1;
      if (itemIndex < 22) {
        showStimulus();
      } else {
        itemIndex = 0;
        blockIndex += 1;
        if (blockIndex < 2) showBlockIntro();
        else finishTask();
      }
    };
    document.addEventListener("keydown", keyHandler);
  }

  function saveChunk(name, value) {
    Qualtrics.SurveyEngine.setEmbeddedData(name, JSON.stringify(value));
  }

  function finishTask() {
    var correctCount = trials.filter(function (trial) { return trial.correct; }).length;
    try {
      saveChunk("experiment_data_1", trials.slice(0, 11));
      saveChunk("experiment_data_2", trials.slice(11, 22));
      saveChunk("experiment_data_3", trials.slice(22, 33));
      saveChunk("experiment_data_4", trials.slice(33, 44));
      Qualtrics.SurveyEngine.setEmbeddedData("experiment_complete", "1");
      Qualtrics.SurveyEngine.setEmbeddedData("experiment_version", STUDY_VERSION);
      Qualtrics.SurveyEngine.setEmbeddedData("experiment_block_order", blockOrder.join("-"));
      Qualtrics.SurveyEngine.setEmbeddedData("experiment_correct_count", String(correctCount));
      Qualtrics.SurveyEngine.setEmbeddedData("experiment_started_at", startedAt);
      Qualtrics.SurveyEngine.setEmbeddedData("experiment_finished_at", new Date().toISOString());
      setHtml('<div class="ft-page" style="text-align:center"><h2>課題が終了しました</h2><p>回答を保存して次の質問へ進みます。そのままお待ちください。</p></div>');
      window.setTimeout(function () { q.clickNextButton(); }, 700);
    } catch (error) {
      console.error(error);
      setHtml('<div class="ft-page"><div class="ft-warning"><strong>課題データをQualtricsへ渡せませんでした。</strong><br>この画面を閉じず、調査担当者へご連絡ください。</div></div>');
    }
  }

  if (!root) return;
  if (ASSET_BASE_URL.indexOf("REPLACE_WITH_") === 0) {
    setHtml('<div class="ft-page"><div class="ft-warning"><strong>実施者向け設定エラー：</strong>画像の公開URLが設定されていません。experiment_question.js の ASSET_BASE_URL を設定してください。</div></div>');
    return;
  }
  if (isUnsupportedDevice()) {
    setHtml('<div class="ft-page"><div class="ft-warning"><strong>この調査にはPCと物理キーボードが必要です。</strong><br>スマートフォンやタブレットでは参加できません。PCから調査URLを開き直してください。</div></div>');
    return;
  }
  setHtml('<div class="ft-page"><h2>数の判断課題</h2><p>2枚のお皿に食べ物が短時間表示され、その後すぐにふたで隠れます。食べ物の数が多い方を選んでください。</p>' +
    '<ul><li>左のお皿を選ぶ：Fキー</li><li>右のお皿を選ぶ：Jキー</li></ul>' +
    '<p>画像は400ミリ秒だけ表示されます。数える時間はありませんので、直感で答えてください。本試行中に正解・不正解は表示されません。</p>' +
    '<p>ブラウザを最大化し、左手の人差し指をFキー、右手の人差し指をJキーに置いてください。</p>' +
    '<p style="text-align:center"><button type="button" id="ft-start" class="ft-button">画像を読み込んで開始する</button></p></div>');
  document.getElementById("ft-start").onclick = beginLoading;
});

Qualtrics.SurveyEngine.addOnUnload(function () {
  /* Qualtrics removes the question DOM on page transition. */
});
