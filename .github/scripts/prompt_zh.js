import fs from "fs";

const promptZh = fs.readFileSync("./.github/scripts/prompt_zh.txt", "utf-8");

export default promptZh.toString();