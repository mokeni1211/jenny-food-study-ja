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
  var STUDY_VERSION = "ccb-ja-qualtrics-1.6.6";
  var practiceItems = ["p1", "p2"];
  var mainItems = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"];
  var canonicalItemOrder = practiceItems.concat(mainItems);
  var correctKeysByBlock = {
    cb: [74,70,74,70,70,74,74,70,70,74,74,74,70,74,70,74,70,70,74,70,74,70],
    cc: [74,70,74,70,70,74,74,70,70,74,74,74,70,74,70,74,70,70,74,70,74,70]
  };
  /* Metadata from the original Study 1 analysis table. */
  var mainTrialMetadata = {
    "1":  { design: "Area",    ratio: 1.5,   sweet_more: false },
    "2":  { design: "Density", ratio: 2,     sweet_more: true  },
    "3":  { design: "Density", ratio: 1.083, sweet_more: true  },
    "4":  { design: "Area",    ratio: 1.11,  sweet_more: false },
    "5":  { design: "Density", ratio: 1.083, sweet_more: false },
    "6":  { design: "Area",    ratio: 1.5,   sweet_more: true  },
    "7":  { design: "Density", ratio: 1.11,  sweet_more: true  },
    "8":  { design: "Area",    ratio: 1.25,  sweet_more: false },
    "9":  { design: "Area",    ratio: 2,     sweet_more: false },
    "10": { design: "Density", ratio: 1.11,  sweet_more: false },
    "11": { design: "Density", ratio: 1.5,   sweet_more: true  },
    "12": { design: "Area",    ratio: 1.083, sweet_more: false },
    "13": { design: "Density", ratio: 1.25,  sweet_more: true  },
    "14": { design: "Density", ratio: 2,     sweet_more: false },
    "15": { design: "Area",    ratio: 1.11,  sweet_more: true  },
    "16": { design: "Area",    ratio: 1.25,  sweet_more: true  },
    "17": { design: "Density", ratio: 1.5,   sweet_more: false },
    "18": { design: "Area",    ratio: 1.083, sweet_more: true  },
    "19": { design: "Density", ratio: 1.25,  sweet_more: false },
    "20": { design: "Area",    ratio: 2,     sweet_more: true  }
  };
  var blockOrder = Math.random() < 0.5 ? ["cb","cc"] : ["cc","cb"];
  var spatialList = Math.random() < 0.5 ? "A" : "B";
  var itemOrders = {};
  var correctKeyByStimulus = {};
  var preloadedImages = {};
  var root = document.getElementById("food-task-root");
  var trials = [];
  var blockIndex = 0;
  var itemIndex = 0;
  var keyHandler = null;
  var startedAt = new Date().toISOString();
  var style = document.createElement("style");

  function shuffledCopy(items) {
    var result = items.slice();
    for (var i = result.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  }

  ["cb", "cc"].forEach(function (block) {
    /* Practice is fixed first; only the 20 main trials are randomized. */
    itemOrders[block] = practiceItems.concat(shuffledCopy(mainItems));
    canonicalItemOrder.forEach(function (item, index) {
      correctKeyByStimulus[block + "_" + item] = correctKeysByBlock[block][index];
    });
  });

  style.textContent = [
    "#food-task-root{width:100%;max-width:1000px;min-height:0;margin:0 auto;text-align:center;box-sizing:border-box;overflow-x:hidden;font-family:-apple-system,BlinkMacSystemFont,'Yu Gothic','Hiragino Kaku Gothic ProN',sans-serif;line-height:1.5}",
    "#food-task-root .ft-page{width:100%;max-width:850px;margin:10px auto;text-align:left;box-sizing:border-box;padding:0 8px}",
    "#food-task-root .ft-page h2{margin:6px 0 10px}",
    "#food-task-root .ft-page p{margin:7px 0}",
    "#food-task-root .ft-keys{display:flex;justify-content:space-between;font-size:1.1rem;font-weight:700;margin:0 5% 8px}",
    "#food-task-root .ft-image{display:block;width:auto;height:auto;max-width:min(100%,88vw);max-height:68vh;margin:0 auto;object-fit:contain}",
    "#food-task-root .ft-intro-image{display:block;width:auto;height:auto;max-width:min(100%,82vw);max-height:50vh;margin:5px auto 8px;object-fit:contain}",
    "#food-task-root .ft-nav{display:flex;justify-content:center;gap:12px;align-items:center;margin-top:8px}",
    "#food-task-root .ft-button{display:inline-block;margin:10px;padding:9px 24px;font-size:1rem;cursor:pointer}",
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
    var names = [
      "lid_bg.jpg", "cb_intro.jpg", "cc_intro.jpg",
      "alien_1.png", "alien_8.png", "intro_3.gif", "intro_5.gif",
      "instruction_keys_ja.svg", "alien_3.png", "alien_5.png", "alien_7.png", "alien_10.png"
    ];
    ["cb", "cc"].forEach(function (prefix) {
      canonicalItemOrder.forEach(function (item) { names.push(prefix + "_" + item + ".jpeg"); });
    });
    return names;
  }

  function introPages() {
    return [
      {
        image: "alien_1.png",
        alt: "宇宙人の友達",
        text: "これから、別の星から来た宇宙人の友達と一緒に、食べ物の数を判断するゲームを行います。"
      },
      {
        image: "alien_8.png",
        alt: "地球の食べ物に興味を持つ宇宙人",
        text: "この宇宙人は、地球の食べ物についてあまり知りません。地球でどのような食べ物を食べているのか、あなたに教えてもらいたいと思っています。"
      },
      {
        image: "intro_3.gif",
        alt: "カップケーキ、ブロッコリー、クッキー、クラッカー",
        text: "今回は、カップケーキ、ブロッコリー、クッキー、クラッカーが登場します。"
      },
      {
        image: "intro_5.gif",
        alt: "2枚のお皿とふた",
        text: "２枚のお皿のうち、食べ物の数が多い方を選んで、宇宙人を手伝ってください。食べ物は一瞬でふたに隠れるため、数えずに判断します。"
      },
      {
        image: "instruction_keys_ja.svg",
        alt: "左はFキー、右はJキーという操作方法",
        text: "左のお皿を選ぶときはFキー、右のお皿を選ぶときはJキーを押してください。"
      },
      {
        image: "alien_3.png",
        alt: "星を持つ宇宙人",
        text: "すべての問題が終わると、宇宙人が星を見せてくれます。できるだけ正確に、直感で答えてください。"
      },
      {
        image: "alien_7.png",
        alt: "宇宙人の友達",
        text: "簡単に感じる問題も、難しく感じる問題もあります。難しいときは、推測で答えてかまいません。"
      }
    ];
  }

  function showAlienIntro(pageIndex) {
    var pages = introPages();
    var page = pages[pageIndex];
    var backButton = pageIndex > 0 ? '<button type="button" id="ft-intro-back" class="ft-button">戻る</button>' : "";
    var nextLabel = pageIndex === pages.length - 1 ? "課題の説明へ" : "次へ";
    setHtml('<div class="ft-page" style="text-align:center"><h2>宇宙人の友達を手伝おう</h2>' +
      '<img class="ft-intro-image" src="' + asset(page.image) + '" alt="' + page.alt + '">' +
      '<p>' + page.text + '</p><p>' + (pageIndex + 1) + ' / ' + pages.length + '</p>' +
      '<div class="ft-nav">' + backButton + '<button type="button" id="ft-intro-next" class="ft-button">' + nextLabel + '</button></div></div>');
    if (pageIndex > 0) {
      document.getElementById("ft-intro-back").onclick = function () { showAlienIntro(pageIndex - 1); };
    }
    document.getElementById("ft-intro-next").onclick = function () {
      if (pageIndex < pages.length - 1) showAlienIntro(pageIndex + 1);
      else showTaskInstructions();
    };
  }

  function showTaskInstructions() {
    setHtml('<div class="ft-page"><h2>食べ物の数を判断する課題</h2><p>２枚のお皿に食べ物が一瞬（0.4秒）表示され、その後すぐに蓋で隠れます。食べ物の数が多い方を選んでください。</p>' +
      '<ul><li>左のお皿を選ぶ：Fキー</li><li>右のお皿を選ぶ：Jキー</li></ul>' +
      '<p>また、キーを押すと同時に、次の問題が始まります。数える時間はありませんので、直感でお答えください。課題の途中では、正解・不正解は表示されません。</p>' +
      '<p>ブラウザを最大化し、左手の人差し指をFキー、右手の人差し指をJキーに置いてください。</p>' +
      '<p style="text-align:center"><button type="button" id="ft-start" class="ft-button">ここをクリックして、画像を読み込んで開始する</button></p></div>');
    document.getElementById("ft-start").onclick = beginLoading;
  }

  function usesSwappedLayout() {
    /* Keep food position constant within a participant. */
    return spatialList === "B";
  }

  function drawStimulus(stimulusId, swapped) {
    var img = preloadedImages[stimulusId + ".jpeg"];
    var canvas = document.getElementById("ft-stimulus-canvas");
    var context = canvas.getContext("2d");
    var half = Math.floor(img.naturalWidth / 2);
    var rightWidth = img.naturalWidth - half;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    if (!swapped) {
      context.drawImage(img, 0, 0);
      return;
    }
    /* Swap the two plate halves without mirroring either food image. */
    context.drawImage(img, half, 0, rightWidth, img.naturalHeight, 0, 0, rightWidth, img.naturalHeight);
    context.drawImage(img, 0, 0, half, img.naturalHeight, rightWidth, 0, half, img.naturalHeight);
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
          preloadedImages[name] = img;
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
      '<p>このブロックでは、' + foods + 'が表示されます。<br>２枚のお皿のうち、食べ物の数が多い方を選んでください。</p>' +
      '<img class="ft-image" src="' + asset(block + "_intro.jpg") + '" alt="このブロックで使用する食品">' +
      '<button type="button" id="ft-block-start" class="ft-button">ここをクリックして、問題を始める。クリックとともに、２枚のお皿が一瞬で表示されます。</button></div>');
    document.getElementById("ft-block-start").onclick = showStimulus;
  }

  function showStimulus() {
    var block = blockOrder[blockIndex];
    var item = itemOrders[block][itemIndex];
    var stimulusId = block + "_" + item;
    var swapped = usesSwappedLayout();
    setHtml(promptHeader() + '<canvas id="ft-stimulus-canvas" class="ft-image" role="img" aria-label="食品が載った2枚のお皿"></canvas>');
    drawStimulus(stimulusId, swapped);
    var onset = performance.now();
    window.setTimeout(function () { showChoice(onset, stimulusId, item, swapped); }, 400);
  }

  function showChoice(stimulusOnset, stimulusId, item, swapped) {
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
      var isPractice = practiceItems.indexOf(item) !== -1;
      var metadata = isPractice ? {
        design: "Practice",
        ratio: 1.5,
        sweet_more: item === "p2"
      } : mainTrialMetadata[item];
      var originalCorrectKey = correctKeyByStimulus[stimulusId];
      var displayedCorrectKey = swapped ? (originalCorrectKey === 70 ? 74 : 70) : originalCorrectKey;
      trials.push({
        trial_index: globalIndex + 1,
        block_number: blockIndex + 1,
        block_order: blockOrder.join("-"),
        bgstim: blockOrder[blockIndex],
        stimulus_id: stimulusId,
        item_id: item,
        key: key,
        key_code: keyCode,
        correct_key_code: displayedCorrectKey,
        correct: keyCode === displayedCorrectKey,
        rt: Math.round(performance.now() - choiceOnset),
        stimulus_duration_ms: Math.round(choiceOnset - stimulusOnset),
        test_part: isPractice ? "practice" : "main",
        trial_design: metadata.design,
        numerical_ratio: metadata.ratio,
        numerosity_outcome: metadata.sweet_more ? "sweet_more" : "nonsweet_more",
        spatial_list: spatialList,
        spatial_layout: swapped ? "swapped" : "original",
        sweet_side: swapped ? "right" : "left",
        correct_side: displayedCorrectKey === 70 ? "left" : "right",
        response_side: keyCode === 70 ? "left" : "right"
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

  function setExperimentData(name, value) {
    /*
     * The New Survey Taking Experience stores JavaScript-created Embedded
     * Data through setJSEmbeddedData().  In Survey Flow the corresponding
     * field must be named __js_<name>, while this call receives <name>.
     * The fallback writes the same prefixed Survey Flow field in older
     * Qualtrics survey engines.
     */
    if (typeof Qualtrics.SurveyEngine.setJSEmbeddedData === "function") {
      Qualtrics.SurveyEngine.setJSEmbeddedData(name, String(value));
    } else {
      Qualtrics.SurveyEngine.setEmbeddedData("__js_" + name, String(value));
    }
  }

  function saveChunk(name, value) {
    setExperimentData(name, JSON.stringify(value));
  }

  function mean(values) {
    if (!values.length) return null;
    return values.reduce(function (sum, value) { return sum + value; }, 0) / values.length;
  }

  function median(values) {
    if (!values.length) return null;
    var sorted = values.slice().sort(function (a, b) { return a - b; });
    var middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function accuracyFor(source, block, outcome) {
    return mean(source.filter(function (trial) {
      return trial.bgstim === block && trial.numerosity_outcome === outcome;
    }).map(function (trial) { return trial.correct ? 1 : 0; }));
  }

  function saveAnalysisSummary() {
    var main = trials.filter(function (trial) { return trial.test_part === "main"; });
    var practice = trials.filter(function (trial) { return trial.test_part === "practice"; });
    var cbSweet = accuracyFor(main, "cb", "sweet_more");
    var cbNonsweet = accuracyFor(main, "cb", "nonsweet_more");
    var ccSweet = accuracyFor(main, "cc", "sweet_more");
    var ccNonsweet = accuracyFor(main, "cc", "nonsweet_more");
    var allSweet = mean(main.filter(function (trial) {
      return trial.numerosity_outcome === "sweet_more";
    }).map(function (trial) { return trial.correct ? 1 : 0; }));
    var allNonsweet = mean(main.filter(function (trial) {
      return trial.numerosity_outcome === "nonsweet_more";
    }).map(function (trial) { return trial.correct ? 1 : 0; }));

    setExperimentData("analysis_main_trial_count", main.length);
    setExperimentData("analysis_practice_trial_count", practice.length);
    setExperimentData("analysis_practice_correct_count", practice.filter(function (trial) { return trial.correct; }).length);
    setExperimentData("analysis_accuracy_overall", mean(main.map(function (trial) { return trial.correct ? 1 : 0; })));
    setExperimentData("analysis_accuracy_cb_sweet_more", cbSweet);
    setExperimentData("analysis_accuracy_cb_nonsweet_more", cbNonsweet);
    setExperimentData("analysis_accuracy_cc_sweet_more", ccSweet);
    setExperimentData("analysis_accuracy_cc_nonsweet_more", ccNonsweet);
    setExperimentData("analysis_bias_cb", cbSweet - cbNonsweet);
    setExperimentData("analysis_bias_cc", ccSweet - ccNonsweet);
    setExperimentData("analysis_food_quantity_bias", allSweet - allNonsweet);
    setExperimentData("analysis_median_rt_ms", median(main.map(function (trial) { return trial.rt; })));
    setExperimentData("analysis_mean_rt_ms", mean(main.map(function (trial) { return trial.rt; })));
    setExperimentData("analysis_mean_stimulus_duration_ms", mean(main.map(function (trial) { return trial.stimulus_duration_ms; })));
  }

  function finishTask() {
    var correctCount = trials.filter(function (trial) { return trial.test_part === "main" && trial.correct; }).length;
    try {
      saveChunk("experiment_data_1", trials.slice(0, 11));
      saveChunk("experiment_data_2", trials.slice(11, 22));
      saveChunk("experiment_data_3", trials.slice(22, 33));
      saveChunk("experiment_data_4", trials.slice(33, 44));
      setExperimentData("experiment_complete", "1");
      setExperimentData("experiment_version", STUDY_VERSION);
      setExperimentData("experiment_block_order", blockOrder.join("-"));
      setExperimentData("experiment_spatial_list", spatialList);
      setExperimentData("experiment_correct_count", String(correctCount));
      setExperimentData("experiment_started_at", startedAt);
      setExperimentData("experiment_finished_at", new Date().toISOString());
      saveAnalysisSummary();
      setHtml('<div class="ft-page" style="text-align:center"><h2>すべての判断課題が終わりました！</h2>' +
        '<img class="ft-intro-image" src="' + asset("alien_10.png") + '" alt="たくさんの星を見せてくれる宇宙人">' +
        '<p>見てください、たくさんの星です！ 宇宙人のお手伝いをしてくださり、ありがとうございました。</p>' +
        '<p>下のボタンを押して、次のページへ進んでください。</p>' +
        '<button type="button" id="ft-finish" class="ft-button">次へ進む</button></div>');
      document.getElementById("ft-finish").onclick = function () {
        document.getElementById("ft-finish").disabled = true;
        q.clickNextButton();
      };
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
  showAlienIntro(0);
});

Qualtrics.SurveyEngine.addOnUnload(function () {
  /* Qualtrics removes the question DOM on page transition. */
});
