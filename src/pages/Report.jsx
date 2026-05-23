import { Link } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import ReportCard from "../components/ReportCard";
import schoolsData from "../data/schools.json";
import { useDemo } from "../lib/demoState";

export default function Report() {
  const { diagnosis, selectedSchoolId, selectSchool } = useDemo();

  return (
    <main className="page-shell py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="section-kicker">STEP 02 / REPORT</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-950">择校方向报告</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            依据画像与演示目标信息形成对比，先选择一项主目标，再进入学习计划。
          </p>
        </div>
        <Link className="button-secondary" to="/diagnosis">
          更新画像
        </Link>
      </div>
      <section className="surface-card mt-9 grid gap-6 p-6 md:p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-medium text-indigo-600">画像摘要</p>
          <p className="mt-3 text-lg font-semibold leading-8 text-slate-950">
            {diagnosis.summary}
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {diagnosis.suggestion}
          </p>
        </div>
        <div className="grid gap-3 text-sm">
          {diagnosis.risks.map((risk) => (
            <p className="rounded-xl bg-amber-50 px-4 py-3 leading-6 text-amber-800" key={risk}>
              {risk}
            </p>
          ))}
        </div>
      </section>
      <div className="mt-6">
        <DisclaimerBanner />
      </div>
      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {schoolsData.schools.map((school) => (
          <ReportCard
            key={school.id}
            onSelect={selectSchool}
            school={school}
            selected={school.id === selectedSchoolId}
          />
        ))}
      </section>
      <div className="mt-8 flex justify-end">
        <Link className="button-primary" to="/plan">
          以当前目标生成计划
        </Link>
      </div>
    </main>
  );
}
