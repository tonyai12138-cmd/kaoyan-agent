export const agentBoundaries = [
  "只基于演示数据生成展示内容，不提供正式招生判断。",
  "涉及院校、分数线、招生人数和参考书时，必须展示核验提示。",
  "以可完成的小步骤支持用户，不输出录取承诺。",
];

export const welcomeMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "你好，我是研途智伴演示助手。你可以询问择校信息、学习节奏或复盘建议，我会基于当前演示资料回答。",
  disclaimer: "演示数据，正式信息以研招网和目标院校官网为准",
  isMock: true,
};

export const fallbackReply =
  "这个问题暂未覆盖在演示知识库中。建议先明确目标专业与当前学习阶段，正式招生信息请查阅研招网和目标院校官网。";
