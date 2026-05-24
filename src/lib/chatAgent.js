import { demoDisclaimer } from "../data/mockData";
import { fallbackReply } from "../data/prompts";
import {
  createPositioningReport,
  createStudyPlan,
  hasCompletedDiagnosis,
  normalizeProfile,
} from "./mockAgent";

const urgentTerms = ["自杀", "自伤", "不想活", "结束生命"];
const chatModeLabels = {
  school: "择校咨询",
  plan: "计划解释",
  exam: "真题拆解",
  verify: "资料核验",
  support: "情绪陪伴",
};

function formatAnswerSections(sections) {
  return sections
    .map((section) => `${section.title}\n${section.content}`)
    .join("\n\n");
}

function formatPriorityTasks(tasks) {
  if (!tasks.length) {
    return "完成画像诊断并生成计划后，我会把今天最优先的任务拆到具体时长。";
  }

  return tasks
    .slice(0, 3)
    .map((task, index) => `${index + 1}. ${task.title}（${task.duration}）`)
    .join("\n");
}

export function createChatWelcome({ profile = {}, context = {} }) {
  if (!hasCompletedDiagnosis(profile)) {
    return {
      id: "welcome",
      role: "assistant",
      modeLabel: "导览",
      content:
        "你好，我是研途智伴智能体。完成画像诊断后，我可以结合你的阶段、策略和今日任务给出更个性化的回答。现在也可以先体验择校、资料核验或真题拆解。",
      disclaimer: demoDisclaimer,
      isMock: true,
    };
  }

  const plan = createStudyPlan(
    profile,
    context.selectedSchoolId,
    context.strategySelectionSource,
  );
  const concern = profile.biggestConcern || "当前任务执行";

  return {
    id: "welcome",
    role: "assistant",
    modeLabel: "导览",
    content: `你好，我是研途智伴智能体。你当前处于${plan.stage}，主要困扰是“${concern}”。我可以围绕${plan.strategySourceLabel}的${plan.strategyLabel}计划，帮助你解释任务、核验资料或进行今日复盘。`,
    disclaimer: demoDisclaimer,
    isMock: true,
  };
}

export function answerChatQuestion({
  message,
  profile = {},
  context = {},
  mode = "school",
  snippets = [],
}) {
  const modeLabel = chatModeLabels[mode] ?? chatModeLabels.school;

  if (urgentTerms.some((term) => message.includes(term))) {
    return {
      answer: formatAnswerSections([
        {
          title: "先照顾此刻的安全",
          content:
            "听到你正在承受很大的压力。备考任务可以暂停，你的安全最重要。",
        },
        {
          title: "立即寻求支持",
          content:
            "请尽快联系信任的亲友、学校心理支持渠道；若存在紧急危险，请立即联系当地紧急援助服务。",
        },
        {
          title: "能力边界",
          content:
            "这里提供的一般情绪陪伴不能替代专业心理咨询或紧急干预。",
        },
      ]),
      mode: "support",
      modeLabel: chatModeLabels.support,
      snippets: [],
      citations: [],
      disclaimer: demoDisclaimer,
      isMock: true,
      safety: "urgent",
    };
  }

  const completed = hasCompletedDiagnosis(profile);
  const plan = completed
    ? createStudyPlan(
        profile,
        context.selectedSchoolId,
        context.strategySelectionSource,
      )
    : null;
  const report = completed ? createPositioningReport(profile) : null;
  const normalized = completed ? normalizeProfile(profile) : null;
  const currentTasks =
    Array.isArray(context.tasks) && context.tasks.length
      ? context.tasks
      : plan?.todayTasks ?? [];
  let answer = fallbackReply;

  if (mode === "school") {
    const riskSummary = report?.risks
      .slice(0, 2)
      .map((risk) => `${risk.name}（${risk.level}）`)
      .join("；");
    answer = formatAnswerSections([
      {
        title: "初步判断",
        content: completed
          ? `你目前处于${report.stage}，综合定位为“${report.positioningTag}”。当前可先以${plan.strategyLabel}作为核验路径。`
          : "你还没有完成画像诊断，当前只能提供通用判断框架，无法给出个人策略结论。",
      },
      {
        title: "主要依据",
        content: completed
          ? `风险偏好为${normalized.normalizedRiskPreference}，当前最大困扰为${profile.biggestConcern}；阶段计划来源为${plan.strategySourceLabel}。`
          : "需要基础背景、目标方向、时间投入和风险偏好，才能形成三档策略建议。",
      },
      {
        title: "风险提醒",
        content: riskSummary || "任何择校方向都需要核验正式目录和考试要求，不承诺录取结果。",
      },
      {
        title: "下一步核验动作",
        content:
          "先在研招网与目标院校官网核验专业目录、考试科目和当年度公告，再将候选方向写入报告进行比较。",
      },
    ]);
  } else if (mode === "plan") {
    answer = formatAnswerSections([
      {
        title: "当前任务重点",
        content: completed
          ? `${plan.stage}应围绕${plan.strategyLabel}推进，优先处理可验证、可完成的高优先级任务。`
          : "完成画像与策略选择后，才能把阶段重点拆解成个人今日任务。",
      },
      {
        title: "为什么这样安排",
        content: completed
          ? plan.stageReminder
          : "计划需要依据剩余时间、薄弱科目与执行压力控制任务负担。",
      },
      {
        title: "今天最优先的 3 件事",
        content: formatPriorityTasks(currentTasks),
      },
      {
        title: "如何复盘",
        content:
          "晚间只记录完成情况、卡点与明天第一件事；若任务过重，优先缩小范围再调整节奏。",
      },
    ]);
  } else if (mode === "exam") {
    const hasQuestionSignal = /分析|论述|简答|案例|真题|如何作答|拆解/.test(message);
    answer = formatAnswerSections([
      {
        title: "题目考点",
        content: hasQuestionSignal
          ? "识别核心概念、作用机制与可评价的营销结果，先回答题目要求再扩展论述。"
          : "请补充具体题干；在此之前可先按概念、机制、案例与评价四层准备。",
      },
      {
        title: "答题框架",
        content: "概念界定 -> 机制分析 -> 情境或案例应用 -> 对策建议 -> 边界与结论。",
      },
      {
        title: "可用理论",
        content: "消费者参与、品牌社群价值共创、顾客关系与忠诚度形成路径等基础框架。",
      },
      {
        title: "案例方向",
        content: "可使用合法公开、自己能够准确说明的数字营销场景，避免编造品牌事实和数据。",
      },
      {
        title: "常见失分点",
        content: "只堆概念、不回应题干；案例没有机制连接；策略缺少适用条件与效果评价。",
      },
      {
        title: "示范开头",
        content:
          "品牌社群并非单向传播渠道，而是消费者互动、身份认同与价值共创的关系场域，其对忠诚度的作用需要从参与机制与体验结果展开分析。",
      },
      {
        title: "建议背诵结构",
        content: "定义 1 句 + 机制 3 点 + 案例对应 2 点 + 策略与边界各 1 点。",
      },
    ]);
  } else if (mode === "verify") {
    answer = formatAnswerSections([
      {
        title: "哪些信息必须核验",
        content:
          "目标专业、考试科目、培养方向、参考资料说明、招生安排和后续公告均需要核验。",
      },
      {
        title: "优先核验渠道",
        content:
          "先查研招网相关入口，再回到目标院校官网的当年度招生简章、专业目录与公告页面逐项确认。",
      },
      {
        title: "资料风险提醒",
        content:
          "经验帖与课程资料只能作为线索，不能替代官方信息；不上传或传播盗版资料。",
      },
      {
        title: "建议建立资料清单",
        content:
          "按“信息项、来源页面、发布日期、已核验/待核验、待解决问题”五列记录，避免重复搜索与版本混用。",
      },
    ]);
  } else if (mode === "support") {
    answer = formatAnswerSections([
      {
        title: "先承认当前压力",
        content:
          "在长期备考中感到焦虑、疲惫或因未完成计划而自责，都值得被认真看见；你不需要用一次失误定义整个进度。",
      },
      {
        title: "把问题拆成小任务",
        content:
          "先选择一项 20 至 30 分钟可以结束的任务，完成后再决定是否继续，不把今天变成补债日。",
      },
      {
        title: "今日最低完成版本",
        content: completed
          ? `完成“${currentTasks[0]?.title ?? "记录今日状态"}”，再做 10 分钟复盘并按时休息。`
          : "完成一次 20 分钟轻量学习并记录卡点，明天再补充画像生成适配计划。",
      },
      {
        title: "需要专业帮助时",
        content:
          "情绪陪伴不替代专业心理咨询。若持续严重焦虑、失眠，或出现自伤想法，请及时联系学校心理支持、专业机构或紧急援助渠道。",
      },
    ]);
  }

  return {
    answer,
    mode,
    modeLabel,
    snippets,
    citations: snippets.slice(0, 2).map((snippet) => snippet.title),
    disclaimer: demoDisclaimer,
    isMock: true,
  };
}
