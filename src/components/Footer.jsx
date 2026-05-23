import { Link } from "react-router-dom";
import DisclaimerBanner from "./DisclaimerBanner";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/80 bg-white/70">
      <div className="page-shell grid gap-7 py-10 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-2xl space-y-4">
          <p className="text-lg font-semibold text-slate-900">
            研途智伴 Agent
          </p>
          <p className="text-sm leading-7 text-slate-600">
            本项目为《数字营销》课程智能应用原型，当前版本通过本地
            mock 数据展示画像诊断、目标比较、学习计划与复盘体验。
          </p>
          <DisclaimerBanner compact />
        </div>
        <div className="flex gap-5 text-sm text-slate-500">
          <Link className="hover:text-indigo-600" to="/about">
            项目说明
          </Link>
          <Link className="hover:text-indigo-600" to="/chat">
            体验问答
          </Link>
        </div>
      </div>
    </footer>
  );
}
