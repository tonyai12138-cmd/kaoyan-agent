import { useEffect, useRef, useState } from "react";
import DisclaimerBanner from "./DisclaimerBanner";
import MarkdownMessage from "./MarkdownMessage";

const sourceLabels = {
  university: "院校基础索引",
  faq: "FAQ",
  school: "院校专业",
  template: "题型模板",
  prompt: "规则提示",
};

const dataStatusLabels = {
  verified: "已核验",
  partial: "部分核验",
  pending: "待核验",
  demo: "演示",
};

const sourceTypeLabels = {
  official: "官方来源",
  official_index: "官方基础名单",
  school_official: "院校官网",
  official_guidance: "官方核验指引",
  methodology: "方法规则",
  pending: "待补来源",
  demo: "演示来源",
};

const answerSourceLabels = {
  deepseek: "DeepSeek 模型生成",
  "local-mock": "本地演示回答",
};

export default function ChatBox({
  activeMode,
  messages,
  templates,
  onClear,
  onSend,
  pending,
  placeholder,
}) {
  const [input, setInput] = useState("");
  const threadRef = useRef(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, pending]);

  function submitMessage(message) {
    if (!message.trim() || pending) {
      return;
    }

    onSend(message.trim());
    setInput("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitMessage(input);
  }

  return (
    <section className="chat-window">
      <div className="chat-toolbar">
        <div>
          <span className="chat-mode-pill">{activeMode.label}</span>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {activeMode.description}
          </p>
        </div>
        <button
          className="text-sm font-medium text-slate-500 transition hover:text-indigo-700"
          onClick={onClear}
          type="button"
        >
          清空聊天记录
        </button>
      </div>
      <div className="border-b border-slate-100 px-5 py-4 md:px-7">
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-400">
          QUICK QUESTIONS
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              className="pill-button"
              key={template.id}
              onClick={() => submitMessage(template.message)}
              type="button"
            >
              {template.message}
            </button>
          ))}
        </div>
      </div>
      <div className="chat-thread" ref={threadRef}>
        {messages.map((message) => {
          const isAgentMessage =
            message.role === "assistant" || message.role === "agent";

          return (
            <div
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              key={message.id}
            >
              <div className={message.role === "user" ? "bubble-user" : "bubble-agent"}>
                {isAgentMessage && (
                  <span className="chat-answer-mode">
                    {message.modeLabel ?? "Agent"}
                  </span>
                )}
                {isAgentMessage ? (
                  <MarkdownMessage content={message.content} />
                ) : (
                  <p className="mt-2 whitespace-pre-line text-sm leading-7">
                    {message.content}
                  </p>
                )}
                {isAgentMessage && message.source && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold">
                      {answerSourceLabels[message.source] ?? "研途智伴 Agent 回答"}
                      {message.source === "deepseek" && message.model
                        ? ` · ${message.model}`
                        : ""}
                    </span>
                    {message.fallbackReason && (
                      <span>
                        当前已自动切换至本地演示，不影响课堂展示。
                      </span>
                    )}
                  </div>
                )}
                {message.snippets?.length > 0 && (
                  <details className="chat-snippets">
                    <summary>参考知识库片段 · {message.snippets.length}</summary>
                    <div className="mt-3 space-y-2">
                      {message.snippets.map((snippet) => (
                        <article className="chat-snippet-item" key={`${snippet.source}-${snippet.title}`}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-700">
                              {snippet.title}
                            </p>
                            <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">
                              {sourceLabels[snippet.source]} · 匹配 {snippet.score}
                            </span>
                          </div>
                          {snippet.source === "university" && (
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                                {snippet.school}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                                {snippet.city}
                              </span>
                              {snippet.is985 && (
                                <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">
                                  985
                                </span>
                              )}
                              {snippet.is211 && (
                                <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">
                                  211
                                </span>
                              )}
                            </div>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {snippet.dataStatus && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                                {dataStatusLabels[snippet.dataStatus] ?? snippet.dataStatus}
                              </span>
                            )}
                            {snippet.sourceType && (
                              <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">
                                {sourceTypeLabels[snippet.sourceType] ?? snippet.sourceType}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-xs leading-6 text-slate-500">
                            {snippet.content}
                          </p>
                          {snippet.sourceLabel && (
                            <p className="mt-2 text-[11px] text-indigo-600">
                              {snippet.sourceLabel}
                            </p>
                          )}
                          {snippet.disclaimer && (
                            <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] leading-5 text-slate-400">
                              {snippet.disclaimer}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  </details>
                )}
                {message.disclaimer && (
                  <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-6 text-slate-500">
                    {message.disclaimer}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {pending && (
          <div className="bubble-agent inline-flex items-center gap-2 text-sm text-slate-500">
            <span className="loading-dot" />
            正在检索知识库并生成回答...
          </div>
        )}
      </div>
      <form className="chat-composer" onSubmit={handleSubmit}>
        <DisclaimerBanner compact />
        <div className="flex items-end gap-3">
          <textarea
            className="field-input min-h-[52px] flex-1 resize-none"
            onChange={(event) => setInput(event.target.value)}
            placeholder={placeholder}
            rows={2}
            value={input}
          />
          <button className="button-primary shrink-0" disabled={pending} type="submit">
            发送
          </button>
        </div>
      </form>
    </section>
  );
}
