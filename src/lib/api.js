import { answerQuestion } from "./mockAgent";

/**
 * Mock-first API adapter. Replace the implementation with a POST request to
 * /api/chat after a server-side model integration has been configured.
 */
export async function sendChatMessage({ message, profile, history, context }) {
  await new Promise((resolve) => window.setTimeout(resolve, 280));

  return answerQuestion({
    message,
    profile,
    history,
    context,
  });
}
