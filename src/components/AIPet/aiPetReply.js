import { sendChatMessage } from "../../lib/api";

const maxReplyLength = 100;

export const PET_SYSTEM_PROMPT =
  "你是“研途小熊”，一个陪伴考研学生学习的可爱桌宠。你的语气要软萌、亲切、轻松，但不能空泛鸡汤。回答要围绕考研学习，帮助用户缓解压力、恢复节奏、明确下一步行动。每次回答不超过100字，只输出一小段中文，不要写标题，不要编号太多，不要说自己是AI。";

const promptTemplate =
  "可以这样问：我正在准备考研，目标是【院校/专业】，目前卡在【问题】，请帮我拆成可执行步骤。";

const fallbackReplies = {
  progress:
    "人~先告诉我今天学了哪一科？如果还没开始，就先做25分钟小任务，完成一点点也很棒。",
  mood:
    "摸摸头~状态差也可以慢慢来。先背5个单词或看1道错题，让小熊陪你把节奏找回来。",
  prompt: promptTemplate,
  custom:
    "收到啦人~先别想太多，把问题拆小一点。现在先做一个最容易完成的小任务吧。",
};

const actionPrompts = {
  progress:
    "用户点击了“学习进度”。请用研途小熊语气，引导用户记录今日学习进度，并给一个很小、可马上开始的学习任务。",
  mood:
    "用户点击了“心情怎么样”。请用研途小熊语气关心用户状态，并给一个低压力学习建议。",
  prompt:
    "用户点击了“优化提问”。请生成一个适合考研学习场景的提问模板，方便用户复制给学习类 AI 工具。",
  custom:
    "用户输入了具体问题。请根据内容简短回应：学习问题给学习建议，焦虑疲惫给安抚和低阻力任务，完成任务就给予具体鼓励。",
};

const pageHints = [
  {
    test: (pathname) => pathname === "/",
    text: "欢迎来到研途智伴，可以先做一次院校诊断。",
  },
  {
    test: (pathname) => pathname.startsWith("/diagnosis"),
    text: "认真填写目标院校、专业基础和备考状态，诊断会更准确。",
  },
  {
    test: (pathname) => pathname.startsWith("/report"),
    text: "重点看看风险项和策略建议，不要只看结论。",
  },
  {
    test: (pathname) => pathname.startsWith("/plan"),
    text: "先完成今日最小任务，再追加任务。",
  },
  {
    test: (pathname) => pathname.startsWith("/chat"),
    text: "可以让我帮你把模糊问题改成高质量 Prompt。",
  },
  {
    test: (pathname) => pathname.startsWith("/review"),
    text: "复盘比单纯记录更重要，建议写出卡点和明日调整。",
  },
];

function includesAny(input, keywords) {
  const normalized = String(input ?? "").toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function compactReply(text) {
  const plainText = String(text ?? "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= maxReplyLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxReplyLength - 1)}…`;
}

function normalizeActionType(actionType) {
  return ["progress", "mood", "prompt", "custom"].includes(actionType)
    ? actionType
    : "custom";
}

function modeForAction(actionType, input) {
  if (
    actionType === "mood" ||
    includesAny(input, ["焦虑", "累", "不想学", "压力", "压力大", "崩溃"])
  ) {
    return "support";
  }

  if (
    actionType === "progress" ||
    includesAny(input, ["计划", "任务", "今天", "复盘", "总结", "完成"])
  ) {
    return "plan";
  }

  return "school";
}

function buildPetMessage({ userInput, actionType, context }) {
  return [
    PET_SYSTEM_PROMPT,
    actionPrompts[actionType],
    `当前页面：${context.route ?? "未知页面"}`,
    context.currentMood ? `当前心情：${context.currentMood}` : "",
    context.taskCompleted ? "今日最小任务已记录完成。" : "今日最小任务尚未明确完成。",
    `用户内容：${userInput || actionType}`,
    "只输出一小段中文，不超过100字。不要使用 Markdown 表格，不要长篇解释。",
  ]
    .filter(Boolean)
    .join("\n");
}

async function requestExistingAgentApi({ userInput, actionType, context }) {
  const result = await sendChatMessage({
    message: buildPetMessage({ userInput, actionType, context }),
    profile: context.profile ?? {},
    history: [],
    context: {
      source: "ai-pet",
      route: context.route,
      pageHint: context.pageHint,
      actionType,
      currentMood: context.currentMood,
      taskCompleted: Boolean(context.taskCompleted),
      petSystemPrompt: PET_SYSTEM_PROMPT,
    },
    mode: modeForAction(actionType, userInput),
  });

  if (result?.source !== "deepseek" || typeof result.answer !== "string") {
    throw new Error("当前没有可用的真实模型回复");
  }

  return result.answer;
}

export function getPromptTemplate() {
  return promptTemplate;
}

export function getPagePetHint(pathname) {
  return (
    pageHints.find((item) => item.test(pathname))?.text ??
    "保持节奏，先完成一个小任务。"
  );
}

export function createLocalPetReply({ userInput = "", actionType = "custom" } = {}) {
  const currentAction = normalizeActionType(actionType);

  if (currentAction !== "custom") {
    return fallbackReplies[currentAction];
  }

  if (includesAny(userInput, ["完成", "完成了", "做完", "搞定"])) {
    return "哇，人完成啦！小熊给你记一朵小红花~现在休息2分钟，再写一句今天哪里做得好。";
  }

  if (includesAny(userInput, ["焦虑", "累", "不想学", "压力", "压力大", "崩溃"])) {
    return "摸摸头~累了就先降难度。背5个单词或看1道错题，完成一点点也算重新启动。";
  }

  if (includesAny(userInput, ["prompt", "提问", "怎么问"])) {
    return fallbackReplies.prompt;
  }

  if (includesAny(userInput, ["进度", "学习进度", "计划", "任务", "今天"])) {
    return fallbackReplies.progress;
  }

  return fallbackReplies.custom;
}

export async function aiPetReply(inputOrOptions, maybeContext = {}) {
  const options =
    typeof inputOrOptions === "object" && inputOrOptions !== null
      ? inputOrOptions
      : { userInput: inputOrOptions, actionType: "custom", context: maybeContext };
  const userInput = String(options.userInput ?? "").trim();
  const actionType = normalizeActionType(options.actionType);
  const context = options.context ?? {};

  try {
    const apiAnswer = await requestExistingAgentApi({
      userInput,
      actionType,
      context,
    });
    return compactReply(apiAnswer);
  } catch {
    return compactReply(createLocalPetReply({ userInput, actionType, context }));
  }
}
