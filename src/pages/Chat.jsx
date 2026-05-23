import { useState } from "react";
import ChatBox from "../components/ChatBox";
import questionData from "../data/questionTemplates.json";
import { sendChatMessage } from "../lib/api";
import { useDemo } from "../lib/demoState";

export default function Chat() {
  const {
    profile,
    selectedSchoolId,
    chatHistory,
    addChatMessage,
  } = useDemo();
  const [pending, setPending] = useState(false);

  async function handleSend(content) {
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };
    addChatMessage(userMessage);
    setPending(true);

    const result = await sendChatMessage({
      message: content,
      profile,
      history: [...chatHistory, userMessage],
      context: { selectedSchoolId },
    });

    addChatMessage({
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: result.answer,
      citations: result.citations,
      disclaimer: result.disclaimer,
      isMock: result.isMock,
    });
    setPending(false);
  }

  return (
    <main className="page-shell py-12 md:py-16">
      <div className="mb-9">
        <p className="section-kicker">STEP 04 / CHAT</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-950">智能体问答</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          当前以本地演示资料生成回答，体验未来知识库引用与个性化建议的交互方式。
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <ChatBox
          messages={chatHistory}
          onSend={handleSend}
          pending={pending}
          templates={questionData.templates}
        />
        <aside className="surface-card h-fit p-6">
          <p className="text-sm font-semibold text-slate-900">回答边界</p>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            <li>当前不连接真实模型服务</li>
            <li>院校事实均为展示用样例</li>
            <li>正式决策应查看官方最新信息</li>
          </ul>
          <p className="mt-6 rounded-2xl bg-indigo-50 p-4 text-sm leading-7 text-indigo-800">
            后续可在保持界面不变的情况下，将统一接口替换为服务端检索与模型回答。
          </p>
        </aside>
      </div>
    </main>
  );
}
