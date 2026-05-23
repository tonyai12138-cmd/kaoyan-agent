import { useNavigate } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import ProfileForm from "../components/ProfileForm";
import { useDemo } from "../lib/demoState";

const diagnosisTags = ["择校方向", "备考基础", "当前风险"];

const reportOutputs = [
  {
    title: "画像摘要",
    description: "总结你的目标方向、备考阶段与主要诉求。",
  },
  {
    title: "风险识别",
    description: "定位数学、跨考与时间投入等关键约束。",
  },
  {
    title: "行动建议",
    description: "连接择校定位、主目标选择与后续计划。",
  },
];

export default function Diagnosis() {
  const navigate = useNavigate();
  const { profile, submitProfile } = useDemo();

  function handleSubmit(nextProfile) {
    submitProfile(nextProfile);
    navigate("/report");
  }

  return (
    <main className="page-shell pb-20 pt-10 md:pb-24 md:pt-14">
      <section className="diagnosis-hero grid gap-8 p-7 md:p-10 lg:grid-cols-[1fr_355px] lg:items-center">
        <div>
          <p className="section-kicker">AI PROFILE DIAGNOSIS · STEP 01</p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            3分钟完成考研画像诊断
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            输入你的基础、目标和当前困扰，研途智伴将生成一份适合当前阶段的择校定位与备考行动建议。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {diagnosisTags.map((tag, index) => (
              <span className="diagnosis-tag" key={tag}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="diagnosis-ai-card">
          <div className="flex items-center gap-3">
            <span className="agent-orb">AI</span>
            <div>
              <p className="text-sm font-bold text-slate-950">研途智伴 Agent</p>
              <p className="mt-1 text-xs text-indigo-600">画像分析准备就绪</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {["采集背景与意向", "识别关键风险", "生成定位报告"].map(
              (step, index) => (
                <div className="diagnosis-ai-step" key={step}>
                  <span className={index === 0 ? "task-check task-check-active" : "task-check"} />
                  <span>{step}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
        <ProfileForm initialValues={profile} onSubmit={handleSubmit} />
        <aside className="space-y-5 lg:sticky lg:top-28">
          <section className="surface-card p-6">
            <p className="section-kicker">OUTPUT PREVIEW</p>
            <h2 className="mt-4 text-xl font-bold text-slate-950">
              诊断将生成什么
            </h2>
            <div className="mt-6 space-y-4">
              {reportOutputs.map((item, index) => (
                <div className="report-output-item" key={item.title}>
                  <span className="profile-section-number">{index + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="surface-card p-6">
            <p className="text-sm font-bold text-slate-900">数据与判断边界</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              输入内容用于本地演示状态保存，不上传个人材料，也不替代正式报考判断。
            </p>
            <div className="mt-5">
              <DisclaimerBanner compact />
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
