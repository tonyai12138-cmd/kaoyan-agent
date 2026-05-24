# 研途智伴 Agent

面向中国考研学生的一站式智能备考服务平台原型，优先覆盖经管类和市场营销相关专业学生的画像诊断、目标比较、备考计划、智能问答与每日复盘场景。

## 当前版本

当前版本支持 **DeepSeek 可选接入 + 本地 mock 演示回退**：

- 前端使用 React、Vite、Tailwind CSS v4 与 HashRouter 构建。
- 画像、定位报告、计划与复盘仍来自本地演示数据和规则逻辑。
- 智能体问答默认可直接使用本地 mock；部署服务端函数并配置密钥后，可由服务端调用 DeepSeek API。
- DeepSeek 请求仅通过 `api/chat.js` 执行；浏览器端不会读取或保存 API Key。
- 当后端不可用、未配置密钥或模型请求失败时，问答会自动回退至本地演示回答，不影响课堂展示。
- 页面中涉及院校、分数线、招生人数和参考资料的展示均为演示信息，正式信息以研招网和目标院校官网为准。

## 本地运行

推荐使用 Node.js `22.x`，兼容 Node.js `20.19+`。

```bash
npm install
npm run dev
```

生产构建验证：

```bash
npm run build
npm run preview
```

项目已为 GitHub Pages 静态托管预留资源路径，并使用 Hash 路由避免直接刷新子页面产生静态服务器 404。

## 页面路由

| 页面 | Hash 路由 | 说明 |
| --- | --- | --- |
| 首页 | `/#/` | 产品价值、核心能力与体验入口 |
| 考研画像诊断 | `/#/diagnosis` | 填写用户背景并生成摘要 |
| 择校报告 | `/#/report` | 对比演示目标并选择主目标 |
| 备考计划 | `/#/plan` | 查看阶段计划并完成今日任务 |
| 智能体问答 | `/#/chat` | 支持 DeepSeek 服务端回答与本地 mock 自动回退 |
| 每日复盘 | `/#/review` | 根据任务完成情况生成建议 |
| 项目说明 | `/#/about` | 查看 MVP 范围、技术栈与边界 |

## 目录说明

```text
src/
  components/    页面可复用组件
  data/          JSON 演示资料与前端展示配置
  lib/           mock Agent、状态容器与 API 适配器
  pages/         七个核心页面
api/
  chat.js        Vercel Serverless Function：DeepSeek 服务端代理与 mock 回退
docs/
  product-spec.md
```

## DeepSeek API 接入

当前聊天页面通过 `src/lib/api.js` 优先请求 `POST /api/chat`，请求结构为 `{ message, profile, history, context, mode }`。服务端函数调用 DeepSeek 时统一返回来源、模型信息与免责声明；当接口不可用时，前端自动调用已有的本地 `chatAgent`。

要启用 DeepSeek：

1. 将项目部署到支持后端函数的平台，例如 Vercel。
2. 在部署平台的服务端环境变量中配置 `DEEPSEEK_API_KEY`。
3. 可选配置 `DEEPSEEK_MODEL`，未配置时默认使用 `deepseek-v4-flash`。
4. 前端会显示回答来源为“DeepSeek 模型生成”或“本地演示回答”。

启用 DeepSeek 后，用户提交的问题、对话历史以及用于个性化回答的画像/任务 context 会由服务端发送给模型服务；课堂展示时请勿输入身份证号、联系方式等敏感个人信息。

可参考 `.env.example` 的变量名称，但不要在示例文件中填写真实密钥。

```dotenv
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
```

仅部署到 GitHub Pages 时，`api/chat.js` 不会作为后端接口运行。页面会自动使用本地 mock 回答，完整画像、报告、计划、问答与复盘演示闭环仍然可用。

**请勿将任何 API Key 提交到 GitHub。** 密钥只能配置在本地未跟踪的环境文件或部署平台的服务端环境变量中，不能暴露到浏览器端代码。

## 信息边界

本项目用于课程原型展示，不构成院校选择或报名决策依据。所有涉及院校、分数线、招生人数与参考书的演示内容，均应以研招网和目标院校官网发布的正式信息为准。
