import axios from "axios";
import { Octokit } from "@octokit/rest";
import github from "@actions/github";
import promptZh from "./prompt_zh.js";
import promptEN from "./prompt_en.js";
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const ref = process.env.GITHUB_REF;
const match = ref.match(/refs\/pull\/(\d+)\/merge/);
const prNumber = match ? match[1] : github.context.payload.pull_request?.number;

if (!prNumber) {
  console.error("❌ 无法识别 Pull Request 编号，可能不是从 PR 事件触发。22");
	console.log(ref)
  process.exit(1);
}

async function main() {
  console.log("🚀 Running AI review with DeepSeek...");

  // 1️⃣ 获取 diff
  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  });

  const diffContent = files
    .map((f) => `### ${f.filename}\n\`\`\`diff\n${f.patch?.slice(0, 4000) || ""}\n\`\`\``)
    .join("\n\n");
	let promptLang = promptZh;
	if (process.env.LANG === 'en') {
		promptLang = promptEN
	}
  const prompt = `
${promptLang}
${diffContent}
`;

  // 2️⃣ 调用 DeepSeek API（与 OpenAI 类似）
  const response = await axios.post(
    "https://api.deepseek.com/v1/chat/completions",
    {
      model: "deepseek-coder",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
    }
  );

  const review = response.data.choices?.[0]?.message?.content || "No review generated.";

  // 3️⃣ 在 PR 评论区发布结果
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: `🤖 **AI 审查报告 **\n\n${review}`,
  });

  console.log("✅ AI review completed!");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
