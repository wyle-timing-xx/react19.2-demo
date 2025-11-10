import fs from "fs";
import path from 'path';

// 读取提示词
const promptPath = path.resolve('.github/prompts/prompt_zh.txt');
const promptZh = fs.readFileSync(promptPath, "utf-8");

export default promptZh.toString();