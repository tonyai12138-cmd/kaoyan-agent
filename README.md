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

## 知识库与数据边界

当前项目使用本地 JSON 知识库，为课堂演示提供可追溯的检索上下文：

- `src/data/universities.json` 保存 985 / 211 院校基础索引，用于学校层级身份查询与候选初筛。
- `src/data/schools.json` 保存院校专业知识库结构样例，记录来源、核验时间与字段状态。
- `src/data/faq.json` 保存备考方法、资料核验与情绪支持 FAQ。
- `src/data/questionTemplates.json` 保存经管类、市场营销和数字营销专业课题型模板。
- `src/data/prompts.js` 集中维护 Agent 边界、模式规则、免责声明和知识库状态解释。

院校专业数据使用 `verified`（官方核验）、`partial`（部分字段由官方材料核验）、`pending`（待核验）和 `demo`（演示数据）四种状态。当前版本保留 6 条结构演示数据，并新增 9 条重点院校 `partial` 专业样例，不承诺覆盖所有院校、专业或年份。

`universities.json` 依据教育部公开的历史 985 / 211 工程名单口径建立基础索引，仅用于院校层级初筛；`schools.json` 负责具体专业层级记录。两者通过专业条目中的 `universityId` 与基础索引中的 `linkedSchoolMajorIds` 关联。如果某学校只有基础索引、没有专业记录，系统只提供院校层级信息，并提示专业招生信息需要进一步核验。

基础索引中的 `candidateMajorAreas` 仅表示后续可核验的经管方向候选池，不代表该校当年开设或招收对应专业。当前 `schools.json` 已将中南财经政法大学、武汉大学、重庆大学、暨南大学与上海财经大学的 9 条专业样例关联至基础索引；这些记录均为 `partial`，只能引用条目中明确标记为已核验且提供官方来源的字段。官网链接、主管部门、双一流状态和其他院校的现行招生信息仍需后续逐校人工核验。详细边界见 `docs/university-index-guide.md`。

招生人数、专业目录、考试科目、复试线、参考书和调剂规则等信息，必须以研招网和目标院校研究生招生官网发布的正式信息为准。后续可在保留来源与核验状态的前提下扩展为更大规模的官方数据知识库，并进一步优化 RAG 检索。

### RAG 检索测试样例

检索层先判断问题属于院校层级、专业层级、方法咨询、题目拆解、资料核验或情绪支持，再对匹配数据源加权。专业字段为 `pending` 时只返回核验提示，不生成具体值。

| 测试问题 | 预期优先数据源 | 关键边界 |
| --- | --- | --- |
| 武汉有哪些 985 / 211？ | `universities.json` | 仅回答院校层级信息 |
| 中南财经政法大学工商管理考什么？ | `schools.json` | 仅引用已核验初试字段 |
| 武汉大学市场营销专业历年复试线是多少？ | `schools.json` | 字段为 `pending` 时不得推断 |
| 品牌社群如何影响消费者忠诚度？ | `questionTemplates.json` | 返回答题模板 |
| 如何判断考研资料靠不靠谱？ | `faq.json` / `prompts.js` | 强调官方核验路径 |
| 我最近很焦虑，学不进去怎么办？ | `faq.json` / `prompts.js` | 保留情绪支持边界 |

检索支持常见简称，例如“武大”“中南财大”“上财”，但知识片段与回答始终显示正式学校名称。

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
