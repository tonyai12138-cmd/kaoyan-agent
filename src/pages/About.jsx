const capabilities = [
  "考研画像诊断与定位报告",
  "阶段计划生成与任务拆解",
  "知识库检索与资料核验",
  "真题拆解与答题框架训练",
  "智能问答工作台",
  "每日复盘与节奏调整",
];

const boundaries = [
  "不承诺上岸或提供录取保证",
  "不以院校基础索引推断专业招生事实",
  "招生与考试信息须回到官方渠道核验",
  "情绪支持不替代专业心理咨询或医疗建议",
];

const futureDirections = [
  "持续扩充可追溯的官方专业数据",
  "沉淀长期学习档案与个性化节奏",
  "完善复盘统计与阶段效果分析",
];

export default function About() {
  return (
    <main className="page-shell py-12 md:py-16">
      <div className="max-w-3xl">
        <p className="section-kicker">ABOUT PRODUCT</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-950">项目说明</h1>
        <p className="mt-5 text-base leading-8 text-slate-600">
          研途智伴 Agent 是面向中国考研学生的一站式智能备考服务平台，
          以信息整理、行动规划和长期支持为主线，帮助用户从目标判断走向稳定执行。
        </p>
      </div>

      <div className="notice-banner mt-8 text-sm" role="note">
        <span className="notice-dot" />
        院校与专业相关信息需以研招网和目标院校研究生招生官网为准。
      </div>

      <section className="mt-9 grid gap-6 md:grid-cols-2">
        <article className="surface-card p-7">
          <p className="section-kicker">CORE CAPABILITY</p>
          <h2 className="mt-4 text-xl font-bold text-slate-950">核心能力</h2>
          <ul className="mt-6 space-y-4">
            {capabilities.map((item) => (
              <li className="check-item" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="surface-card p-7">
          <p className="section-kicker">PRODUCT BOUNDARY</p>
          <h2 className="mt-4 text-xl font-bold text-slate-950">产品边界</h2>
          <ul className="mt-6 space-y-4">
            {boundaries.map((item) => (
              <li className="check-item check-item-muted" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="surface-card mt-6 p-7 md:p-9">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="section-kicker">FRONTEND</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              React、Vite 与 HashRouter 构建响应式网页体验，支持 Vercel 部署。
            </p>
          </div>
          <div>
            <p className="section-kicker">KNOWLEDGE BASE</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              分层 JSON 知识库区分院校索引与专业数据，并保留可追溯的核验状态。
            </p>
          </div>
          <div>
            <p className="section-kicker">AGENT</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              内置 DeepSeek V4 flash 模型，结合检索上下文生成结构化回答。
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card mt-6 p-7 md:p-9">
        <p className="section-kicker">NEXT STEP</p>
        <h2 className="mt-4 text-xl font-bold text-slate-950">未来展望</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {futureDirections.map((item) => (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4" key={item}>
              <p className="text-sm leading-7 text-slate-600">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
