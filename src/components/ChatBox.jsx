import { useState } from "react";
import DisclaimerBanner from "./DisclaimerBanner";

export default function ChatBox({ messages, templates, onSend, pending }) {
  const [input, setInput] = useState("");

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
    <section className="surface-card overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 md:px-7">
        <p className="text-sm font-medium text-slate-900">快捷体验问题</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              className="pill-button"
              key={template.id}
              onClick={() => submitMessage(template.message)}
              type="button"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[430px] space-y-4 overflow-y-auto bg-slate-50/70 p-5 md:p-7">
        {messages.map((message) => (
          <div
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            key={message.id}
          >
            <div
              className={
                message.role === "user" ? "bubble-user" : "bubble-agent"
              }
            >
              <p className="text-sm leading-7">{message.content}</p>
              {message.citations?.length > 0 && (
                <div className="mt-3 space-y-1 rounded-xl bg-white/80 p-3 text-xs text-slate-500">
                  <p className="font-medium text-slate-700">参考卡片</p>
                  {message.citations.map((citation) => (
                    <p key={citation}>{citation}</p>
                  ))}
                </div>
              )}
              {message.disclaimer && (
                <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-500">
                  {message.disclaimer}
                </p>
              )}
            </div>
          </div>
        ))}
        {pending && (
          <div className="bubble-agent inline-flex items-center gap-2 text-sm text-slate-500">
            <span className="loading-dot" />
            正在生成演示回答...
          </div>
        )}
      </div>
      <form className="space-y-4 border-t border-slate-100 p-5 md:p-7" onSubmit={handleSubmit}>
        <DisclaimerBanner compact />
        <div className="flex gap-3">
          <input
            className="field-input flex-1"
            onChange={(event) => setInput(event.target.value)}
            placeholder="输入你的备考问题..."
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
