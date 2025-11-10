import fs from "fs";
import path from 'path';

// 读取提示词
const promptPath = path.resolve('.github/prompts/en.md');
const promptZh = fs.readFileSync(promptPath, "utf-8");

export default promptZh;