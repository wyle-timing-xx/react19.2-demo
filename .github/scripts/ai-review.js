import axios from "axios";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const [owner, repo] = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split("/") : [undefined, undefined];

// Try to determine PR number safely.
// 1) If running in a pull_request event, GITHUB_REF often looks like: refs/pull/123/merge
// 2) Workflows can also pass the PR number explicitly (see ai-review.yml uses PR_NUMBER env)
// We'll prefer parsing GITHUB_REF, but fall back to PR_NUMBER env if needed, and validate.
function parsePrNumber() {
  const ref = process.env.GITHUB_REF || "";
  const fromRefMatch = ref.match(/refs\/pull\/(\d+)\/?.*/);
  if (fromRefMatch && fromRefMatch[1]) return fromRefMatch[1];

  if (process.env.PR_NUMBER) return String(process.env.PR_NUMBER);
  return null;
}

const prNumber = parsePrNumber();
if (!prNumber) {
  console.error("❌ Could not determine PR number. Ensure this action runs on a pull_request event or pass PR_NUMBER env.");
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

  const prompt = `
你是一名资深代码审查专家，请帮我分析以下代码改动，指出：
1. 潜在逻辑/安全风险
2. 可优化的地方
3. 总体质量评分
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
    body: `🤖 **DeepSeek AI 审查报告**\n\n${review}`,
  });

  console.log("✅ DeepSeek AI review completed!");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
