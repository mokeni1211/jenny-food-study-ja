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

const keys = nums(js, "correctKeys");
const originalKeys = nums(original, "ANS_sequence").slice(0,44);
const items = strings(js, "itemOrder");
check(keys.length === 44, `expected 44 answer keys, found ${keys.length}`);
check(JSON.stringify(keys) === JSON.stringify(originalKeys), "answer keys differ from original first 44 trials");
check(items.length === 22, `expected 22 items per block, found ${items.length}`);
check(/setTimeout\(function \(\) \{ showChoice\(onset, stimulusId\); \}, 400\)/.test(js), "400 ms presentation not found");
check(/key !== "f" && key !== "j"/.test(js), "F/J restriction not found");
check(/\["cb","cc"\].*\["cc","cb"\]/.test(js), "both block orders not found");
check((js.match(/experiment_data_[1-4]/g) || []).length >= 4, "four data chunks not found");
check(js.includes("setJSEmbeddedData"), "new Qualtrics Embedded Data API not found");
check(fields.includes("__js_experiment_complete"), "JavaScript Embedded Data prefix not found");
for (const prefix of ["cb","cc"]) for (const item of items) check(fs.existsSync(path.join(root,"static","img",`${prefix}_${item}.jpeg`)), `missing ${prefix}_${item}.jpeg`);
for (const name of ["lid_bg.jpg","cb_intro.jpg","cc_intro.jpg"]) check(fs.existsSync(path.join(root,"static","img",name)), `missing ${name}`);
check(fs.readdirSync(path.join(root,"static","img")).length === 47, "static/img must contain exactly 47 files");

if (failures.length) {
  console.error(`FAILED (${failures.length})`);
  failures.forEach(x => console.error(`- ${x}`));
  process.exit(1);
}
console.log("PASS: Qualtrics package preserves 44 trials, answer keys, 400 ms timing, F/J responses, both block orders, four data chunks, and all 47 assets.");
