import { useState } from "react";
import { Link } from "react-router-dom";
import "../chatStyles.css";
import ChatBox from "../components/ChatBox";
import questionData from "../data/questionTemplates.json";
import { agentBoundaries, chatModes } from "../data/prompts";
import { sendChatMessage } from "../lib/api";
import { createChatWelcome } from "../lib/chatAgent";
import { useDemo } from "../lib/demoState";
import { createStudyPlan, hasCompletedDiagnosis } from "../lib/mockAgent";

export default function Chat() {
  const {
    profile,
    selectedSchoolId,
    strategySelectionSource,
    tasks,
    chatHistory,
    addChatMessage,
    clearChatHistory,
  } = useDemo();
  const [mode, setMode] = useState("school");
  const [pending, setPending] = useState(false);
  const diagnosisComplete = hasCompletedDiagnosis(profile);
  const plan = createStudyPlan(
    profile,
    selectedSchoolId,
    strategySelectionSource,
  );
  const completedCount = tasks.filter((task) => task.completed).length;
  const completionRatio = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;
  const activeMode = chatModes.find((item) => item.id === mode) ?? chatModes[0];
  const templates =
    questionData.modes.find((item) => item.id === mode)?.templates ?? [];
  const welcome = createChatWelcome({
    profile,
    context: { selectedSchoolId, strategySelectionSource },
  });
  const displayedMessages = [
    { ...welcome, source: welcome.source ?? "local-mock" },
    ...chatHistory,
  ];

  async function handleSend(content) {
    const requestMode = mode;
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      mode: requestMode,
      modeLabel: activeMode.label,
    };
    addChatMessage(userMessage);
    setPending(true);

    try {
      const result = await sendChatMessage({
        message: content,
        profile,
        history: chatHistory,
        context: { selectedSchoolId, strategySelectionSource, tasks },
        mode: requestMode,
      });

      addChatMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.answer,
        mode: result.mode,
        modeLabel: result.modeLabel ?? activeMode.label,
        snippets: result.snippets,
        citations: result.citations,
        disclaimer: result.disclaimer,
        isMock: result.isMock,
        source: result.source,
        model: result.model,
        fallbackReason: result.fallbackReason,
      });
    } finally {
      setPending(false);
    }
  }

  const statusItems = [
    {
      label: "画像诊断",
      value: diagnosisComplete ? "已完成" : "待完成",
      detail: diagnosisComplete ? "可生成个性化回答" : "当前为通用体验",
    },
    {
      label: "当前阶段",
      value: diagnosisComplete ? plan.stage : "待诊断",
      detail: diagnosisComplete ? plan.countdownLabel : "先填写基础信息",
    },
    {
      label: "当前策略档位",
      value: diagnosisComplete ? plan.strategyLabel : "待生成",
      detail: diagnosisComplete ? plan.strategySourceLabel : "未形成定位报告",
    },
    {
      label: "今日任务完成率",
      value: diagnosisComplete ? `${completionRatio}%` : "--",
      detail: diagnosisComplete
        ? `已完成 ${completedCount}/${tasks.length} 项`
        : "生成计划后同步",
    },
  ];

  return (
    <main className="page-shell pb-20 pt-10 md:pb-24 md:pt-14">
      <section className="chat-hero p-7 md:p-10">
        <span className="chat-status-pill">
          AGENT WORKBENCH · LOCAL KNOWLEDGE BASE
        </span>
        <div className="mt-7 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="section-kicker">STEP 04 / INTELLIGENT CHAT</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              研途智伴 Agent
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              围绕择校、计划、资料、真题和复盘，提供基于画像与知识库的考研问答支持。
            </p>
          </div>
          <span className="badge">DeepSeek 可选 · 本地回退可用</span>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statusItems.map((item) => (
            <article className="chat-status-card" key={item.label}>
              <p className="text-xs font-semibold text-slate-500">{item.label}</p>
              <p className="mt-3 text-xl font-bold text-slate-950">{item.value}</p>
              <p className="mt-2 text-xs text-slate-500">{item.detail}</p>
            </article>
          ))}
        </div>
        {!diagnosisComplete && (
          <div className="chat-personalization mt-6">
            <div>
              <p className="text-sm font-bold text-slate-950">
                完成画像后可获得更个性化回答
              </p>
              <p className="mt-1 text-sm leading-7 text-slate-600">
                智能体将结合你的当前阶段、策略档位和今日任务给出解释。
              </p>
            </div>
            <Link className="button-primary shrink-0" to="/diagnosis">
              去完成诊断
            </Link>
          </div>
        )}
      </section>

      <section className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-5">
          <div className="surface-card overflow-hidden p-5">
            <p className="section-kicker">AGENT MODES</p>
            <h2 className="mt-3 text-lg font-bold text-slate-950">能力模式</h2>
            <div className="chat-mode-strip mt-5">
              {chatModes.map((item) => (
                <button
                  className={`chat-mode-card ${mode === item.id ? "chat-mode-card-active" : ""}`}
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  type="button"
                >
                  <span>{item.label}</span>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="chat-boundary-card">
            <p className="text-sm font-bold text-slate-950">能力与内容边界</p>
            <ul className="mt-4 space-y-3">
              {agentBoundaries.map((rule) => (
                <li className="check-item text-xs" key={rule}>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <ChatBox
          activeMode={activeMode}
          messages={displayedMessages}
          onClear={clearChatHistory}
          onSend={handleSend}
          pending={pending}
          placeholder={activeMode.placeholder}
          templates={templates}
        />
      </section>
    </main>
  );
}
