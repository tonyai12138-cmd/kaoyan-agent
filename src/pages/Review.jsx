import { Link } from "react-router-dom";
import DisclaimerBanner from "../components/DisclaimerBanner";
import ReviewPanel from "../components/ReviewPanel";
import { useDemo } from "../lib/demoState";

export default function Review() {
  const { tasks, reviewResult, submitReview } = useDemo();
  const completed = tasks.filter((task) => task.completed).length;

  return (
    <main className="page-shell py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="section-kicker">STEP 05 / REVIEW</p>
          <h1 className="mt-4 text-4xl font-bold text-slate-950">每日复盘</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            不追求把落下的任务全部堆回明天，而是找到下一步真正能完成的安排。
          </p>
        </div>
        <Link className="button-secondary" to="/plan">
          返回计划
        </Link>
      </div>
      <div className="my-7">
        <DisclaimerBanner />
      </div>
      <ReviewPanel
        completed={completed}
        onSubmit={submitReview}
        result={reviewResult}
        total={tasks.length}
      />
    </main>
  );
}
