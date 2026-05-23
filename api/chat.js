const disclaimer = "演示数据，正式信息以研招网和目标院校官网为准";

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ answer: "仅支持 POST 请求。" });
  }

  const {
    message = "",
    profile = null,
    history = [],
    context = null,
  } = request.body ?? {};

  if (typeof message !== "string" || message.trim() === "") {
    return response.status(400).json({ answer: "请输入需要咨询的问题。" });
  }

  const profileHint = profile?.major
    ? `已参考你的${profile.major}画像。`
    : "当前未读取个人画像。";

  return response.status(200).json({
    answer: `${profileHint}这是服务端接口预留返回的 mock 回答：你的问题是“${message.trim()}”。后续可在此接入检索与大模型服务。`,
    citations: [],
    disclaimer,
    isMock: true,
    meta: {
      historyCount: Array.isArray(history) ? history.length : 0,
      hasContext: Boolean(context),
    },
  });
}
