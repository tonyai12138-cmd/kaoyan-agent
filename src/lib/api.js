import { answerChatQuestion } from "./chatAgent";
import { retrieveKnowledge } from "./retrieve";

/**
 * Mock-first API adapter.
 * Future model integration can replace the local branch below with:
 * fetch("/api/chat", { method: "POST", body: JSON.stringify(payload) }).
 */
export async function sendChatMessage({
  message,
  profile,
  history,
  context,
  mode = "school",
}) {
  await new Promise((resolve) => globalThis.setTimeout(resolve, 280));
  const snippets = retrieveKnowledge(message, mode);

  return answerChatQuestion({
    message,
    profile,
    history,
    context,
    mode,
    snippets,
  });
}
