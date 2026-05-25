import { answerChatQuestion } from "./chatAgent";
import { normalizeChatMode, toServerMode } from "../data/prompts";
import { retrieveKnowledge } from "./retrieve";

/**
 * DeepSeek is called only through the server-side `/api/chat` proxy.
 * Static hosting or unavailable server functions automatically use the local Agent.
 */
export async function sendChatMessage({
  message,
  profile,
  history,
  context,
  mode = "school",
}) {
  const clientMode = normalizeChatMode(mode);
  const snippets = retrieveKnowledge(message, clientMode);
  const requestContext = {
    ...context,
    knowledgeSnippets: snippets,
  };
  let fallbackReason = "api_error";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        profile,
        history,
        context: requestContext,
        mode: toServerMode(clientMode),
      }),
    });

    if (!response.ok) {
      fallbackReason =
        response.status === 400 ? "invalid_request" : "api_error";
      throw new Error(`Chat endpoint returned ${response.status}`);
    }

    const result = await response.json();
    if (
      typeof result?.answer !== "string" ||
      typeof result?.isMock !== "boolean" ||
      !["deepseek", "local-mock"].includes(result?.source)
    ) {
      throw new Error("Chat endpoint returned an invalid response");
    }

    return {
      ...result,
      mode: clientMode,
      snippets,
      citations: snippets.slice(0, 2).map((snippet) => snippet.title),
    };
  } catch {
    await new Promise((resolve) => globalThis.setTimeout(resolve, 280));
    const localAnswer = answerChatQuestion({
      message,
      profile,
      history,
      context,
      mode: clientMode,
      snippets,
    });

    return {
      ...localAnswer,
      source: "local-mock",
      model: undefined,
      fallbackReason,
    };
  }
}
