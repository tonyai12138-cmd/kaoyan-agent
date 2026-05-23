import DisclaimerBanner from "../components/DisclaimerBanner";

const capabilities = [
  "画像诊断与方向摘要",
  "目标专业演示对比",
  "备考任务执行与复盘",
  "本地 mock 智能问答",
];

const boundaries = [
  "不提供正式院校数据结论",
  "不预测个人录取结果",
  "不接入真实账户或私密资料",
  "不将情绪支持替代专业帮助",
];

export default function About() {
  return (
    <main className="page-shell py-12 md:py-16">
      <div className="max-w-3xl">
        <p className="section-kicker">ABOUT PRODUCT</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-950">项目说明</h1>
        <p className="mt-5 text-base leading-8 text-slate-600">
          研途智伴 Agent 是面向中国考研学生的课程项目原型，优先服务经管类、
          市场营销相关专业学生，以可解释的信息整理与可执行的学习节奏降低备考焦虑。
        </p>
      </div>
      <div className="mt-8">
        <DisclaimerBanner />
      </div>
      <section className="mt-9 grid gap-6 md:grid-cols-2">
        <article className="surface-card p-7">
          <p className="section-kicker">MVP CAPABILITY</p>
          <h2 className="mt-4 text-xl font-bold text-slate-950">当前演示能力</h2>
          <ul className="mt-6 space-y-4">
            {capabilities.map((item) => (
              <li className="check-item" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </article>
        <article className="surface-card p-7">
          <p className="section-kicker">SAFETY BOUNDARY</p>
          <h2 className="mt-4 text-xl font-bold text-slate-950">智能体边界</h2>
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
              React、Vite、Tailwind CSS 与 HashRouter，适配静态页面部署。
            </p>
          </div>
          <div>
            <p className="section-kicker">DATA</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              结构化本地演示数据，后续可替换为知识库检索与后台数据源。
            </p>
          </div>
          <div>
            <p className="section-kicker">AGENT</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              当前为规则式 mock 返回，未来通过服务端接口接入大模型能力。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
