# API 预留目录

`chat.js` 是 Vercel Serverless Function 形式的 `POST /api/chat` 接口。配置 `DEEPSEEK_API_KEY` 后将调用 DeepSeek；未配置密钥或上游调用失败时，自动返回本地演示回答。

未来接入大模型时，请仅在服务端读取部署环境变量中的密钥，并保持前端 `src/lib/api.js` 的请求与响应契约稳定。
