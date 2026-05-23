import { useNavigate } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import ProfileForm from "../components/ProfileForm";
import { useDemo } from "../lib/demoState";

export default function Diagnosis() {
  const navigate = useNavigate();
  const { profile, submitProfile } = useDemo();

  function handleSubmit(nextProfile) {
    submitProfile(nextProfile);
    navigate("/report");
  }

  return (
    <main className="page-shell py-12 md:py-16">
      <div className="mb-9 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="section-kicker">STEP 01 / PROFILE</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-950">考研画像诊断</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            填写你的专业背景、目标取向与可投入时间。演示智能体将据此生成方向摘要与风险提示。
          </p>
        </div>
        <DisclaimerBanner />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ProfileForm initialValues={profile} onSubmit={handleSubmit} />
        <aside className="surface-card h-fit p-6">
          <p className="text-sm font-semibold text-slate-900">本次诊断会关注</p>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            <li>专业基础是否与意向方向衔接</li>
            <li>学习投入时间与目标难度是否匹配</li>
            <li>如何选择主目标与备选方向</li>
          </ul>
          <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-sm leading-7 text-indigo-800">
            报告为产品演示分析，不代替真实院校调研与个人决策。
          </div>
        </aside>
      </div>
    </main>
  );
}
