import { Link, useNavigate } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import ReportCard from "../components/ReportCard";
import { useDemo } from "../lib/demoState";
import { createPositioningReport } from "../lib/mockAgent";

const previewBlocks = [
  "当前阶段、定位标签与综合风险等级",
  "冲刺、稳妥、保底三档选择策略",
  "个性化风险雷达与未来 7 天行动",
];

const trustRules = [
  "本报告为 AI 辅助诊断，不构成正式报考建议。",
  "院校、专业、招生人数、考试科目、复试线等信息以研招网和目标院校官网为准。",
  "本项目不承诺上岸、不提供录取保证。",
  "当前为课程展示用 mock 演示数据。",
];

function EmptyReport() {
  return (
    <main className="page-shell py-12 md:py-16">
      <section className="report-empty-state mx-auto max-w-5xl p-7 md:p-11">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_355px] lg:items-center">
          <div>
            <span className="report-status-pill">示例状态 · 未生成个人报告</span>
            <p className="section-kicker mt-7">AI GENERATED REPORT · STEP 02</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              你的考研定位报告
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              你还没有完成考研画像诊断，建议先填写画像以生成更准确的定位报告。
            </p>
            <Link className="button-primary mt-8" to="/diagnosis">
              去完成诊断
            </Link>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm font-bold text-slate-950">提交画像后将生成</p>
            <div className="mt-5 space-y-3">
              {previewBlocks.map((item, index) => (
                <div className="report-preview-item" key={item}>
                  <span className="profile-section-number">{index + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-6 text-slate-500">
              以上仅为结构预览，不代表你的个性化诊断结论。
            </p>
          </div>
        </div>
      </section>
      <section className="boundary-panel mx-auto mt-8 max-w-5xl p-6 md:p-8">
        <p className="section-kicker">TRUST BOUNDARY</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {trustRules.map((rule) => (
            <p className="boundary-rule" key={rule}>
              <span className="boundary-check">✓</span>
              {rule}
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function Report() {
  const navigate = useNavigate();
  const {
    profile,
    selectedSchoolId,
    hasSelectedReportTarget,
    selectSchool,
  } = useDemo();
  const report = createPositioningReport(profile);

  if (report.status === "incomplete") {
    return <EmptyReport />;
  }

  const aiRecommendation = report.recommendations.find((item) => item.recommended);

  function handleGeneratePlan() {
    if (!hasSelectedReportTarget) {
      selectSchool(aiRecommendation.planTargetId);
    }
    navigate("/plan");
  }

  return (
    <main className="page-shell pb-20 pt-10 md:pb-24 md:pt-14">
      <section className="report-hero p-7 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-7">
          <div>
            <span className="report-status-pill">AI GENERATED REPORT · 分析完成</span>
            <p className="section-kicker mt-7">STEP 02 / POSITIONING REPORT</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              你的考研定位报告
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              基于你的基础背景、目标意向、备考基础和当前困扰，生成当前阶段的择校方向与行动建议。
            </p>
          </div>
          <Link className="button-secondary" to="/diagnosis">
            重新诊断
          </Link>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {[
            { label: "当前阶段判断", value: report.stage },
            { label: "综合定位标签", value: report.positioningTag },
            { label: "风险等级", value: report.riskLevel },
          ].map((item) => (
            <div className="report-metric-card" key={item.label}>
              <p className="text-xs font-semibold text-slate-500">{item.label}</p>
              <p className="mt-3 text-xl font-bold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card mt-8 p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-kicker">PROFILE SUMMARY</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">用户画像摘要</h2>
          </div>
          <p className="text-sm text-slate-500">关键信息来自你刚刚提交的诊断画像</p>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {report.profileFacts.map((item) => (
            <div className="report-profile-fact" key={item.label}>
              <p className="text-xs font-medium text-slate-500">{item.label}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div>
          <p className="section-kicker">TARGET STRATEGY</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-950">择校方向建议</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            以下为选择标准与样例方向，不展示未经正式核验的院校招生指标。选择一档后可继续生成计划。
          </p>
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {report.recommendations.map((recommendation) => (
            <ReportCard
              key={recommendation.id}
              onSelect={selectSchool}
              recommendation={recommendation}
              selected={
                hasSelectedReportTarget &&
                recommendation.planTargetId === selectedSchoolId
              }
            />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="surface-card p-6 md:p-8">
          <p className="section-kicker">RISK RADAR</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-950">风险雷达</h2>
          <div className="mt-7 space-y-4">
            {report.risks.map((risk) => (
              <article className="report-risk-card" key={risk.name}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold text-slate-950">{risk.name}</h3>
                  <span className={`risk-pill risk-pill-${risk.level}`}>{risk.level}</span>
                </div>
                <div className="risk-track mt-4">
                  <span className={`risk-value risk-value-${risk.level}`} />
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{risk.reason}</p>
                <p className="mt-3 text-sm leading-7 text-indigo-700">
                  应对建议：{risk.action}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="surface-card p-6 md:p-8">
          <p className="section-kicker">NEXT 7 DAYS</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-950">未来 7 天行动清单</h2>
          <div className="mt-7 space-y-3">
            {report.sevenDayActions.map((item) => (
              <article className="report-day-item" key={item.day}>
                <span>{item.day}</span>
                <p>{item.action}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
            <p className="text-sm font-bold text-indigo-800">针对当前困扰的建议</p>
            <p className="mt-2 text-sm leading-7 text-indigo-700">{report.supportAdvice}</p>
          </div>
        </div>
      </section>

      <section className="surface-card mt-10 flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center md:p-8">
        <div>
          <p className="section-kicker">CONTINUE YOUR JOURNEY</p>
          <h2 className="mt-3 text-xl font-bold text-slate-950">将定位结论转为行动</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            未手动选择档位时，生成计划将默认采用带有“AI 优先建议”标识的方向。
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="button-primary" onClick={handleGeneratePlan} type="button">
            生成备考计划
          </button>
          <Link className="button-secondary" to="/chat">
            进入智能问答
          </Link>
          <Link className="button-secondary" to="/diagnosis">
            重新诊断
          </Link>
        </div>
      </section>

      <section className="boundary-panel mt-10 p-6 md:p-8">
        <p className="section-kicker">TRUST BOUNDARY</p>
        <h2 className="mt-3 text-2xl font-bold text-slate-950">可信边界</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {trustRules.map((rule) => (
            <p className="boundary-rule" key={rule}>
              <span className="boundary-check">✓</span>
              {rule}
            </p>
          ))}
        </div>
        <div className="mt-6">
          <DisclaimerBanner />
        </div>
      </section>
    </main>
  );
}
