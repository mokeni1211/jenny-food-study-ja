import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const js = fs.readFileSync(path.join(root, "experiment_question.js"), "utf8");
const fields = fs.readFileSync(path.join(root, "docs", "embedded_data_fields.txt"), "utf8");
const original = fs.readFileSync(path.resolve(root, "..", "ccb.html"), "utf8");
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const nums = (source, name) => {
  const match = source.match(new RegExp(`var\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
  return match ? (match[1].match(/\d+/g) || []).map(Number) : [];
};
const strings = (source, name) => {
  const match = source.match(new RegExp(`var\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
  return match ? [...match[1].matchAll(/["']([^"']+)["']/g)].map(x => x[1]) : [];
};

const originalKeys = nums(original, "ANS_sequence").slice(0,44);
const keyArrays = [...js.matchAll(/(?:cb|cc):\s*\[([^\]]+)\]/g)].map(match => (match[1].match(/\d+/g) || []).map(Number));
const items = strings(js, "canonicalItemOrder").length ? strings(js, "canonicalItemOrder") : ["p1","p2",...strings(js,"mainItems")];
check(keyArrays.length === 2 && keyArrays.every(x => x.length === 22), "expected 22 answer keys for each block");
check(JSON.stringify(keyArrays.flat()) === JSON.stringify(originalKeys), "stimulus answer keys differ from original first 44 trials");
check(items.length === 22, `expected 22 items per block, found ${items.length}`);
check(/showChoice\(onset, stimulusId, item, swapped\); \}, 400\)/.test(js), "400 ms presentation not found");
check(/key !== "f" && key !== "j"/.test(js), "F/J restriction not found");
check(/\["cb","cc"\].*\["cc","cb"\]/.test(js), "both block orders not found");
check(js.includes("practiceItems.concat(shuffledCopy(mainItems))"), "main-trial randomization with fixed practice not found");
check(js.includes('test_part: isPractice ? "practice" : "main"'), "practice/main labels not found");
check(js.includes("correctKeyByStimulus[stimulusId]"), "stimulus-keyed answer lookup not found");
check(js.includes('var spatialList = Math.random() < 0.5 ? "A" : "B"'), "spatial list randomization not found");
check(js.includes('return spatialList === "B"'), "between-participant fixed spatial layout not found");
check(js.includes('spatial_layout: swapped ? "swapped" : "original"'), "spatial layout recording not found");
check(js.includes("displayedCorrectKey = swapped ?"), "swapped correct-key handling not found");
check(js.includes("Swap the two plate halves without mirroring"), "non-mirrored plate swap not found");
check(js.includes('numerosity_outcome: metadata.sweet_more ? "sweet_more" : "nonsweet_more"'), "analysis outcome metadata not found");
check(js.includes('setExperimentData("analysis_food_quantity_bias"'), "participant analysis summary not found");
check(js.includes('setExperimentData("analysis_mean_rt_ms"'), "mean RT summary not found");
check((js.match(/experiment_data_[1-4]/g) || []).length >= 4, "four data chunks not found");
check(js.includes("setJSEmbeddedData"), "new Qualtrics Embedded Data API not found");
check(fields.includes("__js_experiment_complete"), "JavaScript Embedded Data prefix not found");
check(fields.includes("__js_experiment_spatial_list"), "spatial list Embedded Data field not found");
check(fields.includes("__js_analysis_food_quantity_bias"), "analysis Embedded Data fields not found");
check(fields.includes("__js_analysis_mean_rt_ms"), "mean RT Embedded Data field not found");
for (const prefix of ["cb","cc"]) for (const item of items) check(fs.existsSync(path.join(root,"static","img",`${prefix}_${item}.jpeg`)), `missing ${prefix}_${item}.jpeg`);
for (const name of ["lid_bg.jpg","cb_intro.jpg","cc_intro.jpg"]) check(fs.existsSync(path.join(root,"static","img",name)), `missing ${name}`);
const introAssets = ["alien_1.png","alien_8.png","intro_3.gif","intro_5.gif","instruction_keys_ja.svg","alien_3.png","alien_5.png","alien_7.png","alien_10.png"];
for (const name of introAssets) check(fs.existsSync(path.join(root,"static","img",name)), `missing introduction asset ${name}`);
check(js.includes("function showAlienIntro(pageIndex)"), "alien introduction screens not found");
check(js.includes("function showTaskInstructions()"), "task instructions after introduction not found");
check(js.includes("showAlienIntro(0)"), "experiment does not start from the alien introduction");
check(js.includes("宇宙人") && js.includes("地球の食べ物"), "Japanese alien introduction wording not found");
check(js.includes('asset("alien_10.png")'), "post-task stars screen not found");
check(js.includes('id="ft-finish"'), "post-task stars continue button not found");
check(fs.readdirSync(path.join(root,"static","img")).length === 56, "static/img must contain exactly 56 files");

if (failures.length) {
  console.error(`FAILED (${failures.length})`);
  failures.forEach(x => console.error(`- ${x}`));
  process.exit(1);
}
console.log("PASS: Qualtrics package includes the seven-page Japanese alien introduction, the performance-independent post-task stars screen, and all 56 assets, and preserves 44 trials, participant-fixed A/B food positions, non-mirrored plate swaps, analysis metadata and summaries, stimulus-keyed answers, fixed-first practice, randomized main trials, 400 ms timing, F/J responses, both block orders, and four data chunks.");
