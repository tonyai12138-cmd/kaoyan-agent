export const MOOD_CONFIG = [
  {
    mood: "pretendAngry",
    label: "假装生气",
    image: "/pet/moods/pretend-angry.jpg",
    bubbleText: "人，你怎么还没有完成任务！",
  },
  {
    mood: "happy",
    label: "开心",
    image: "/pet/moods/happy.jpg",
    bubbleText: "继续加油哦~给你比心",
  },
  {
    mood: "lazy",
    label: "摆烂",
    image: "/pet/moods/lazy.jpg",
    bubbleText: "人，我有点累呀~",
  },
  {
    mood: "excited",
    label: "激动",
    image: "/pet/moods/excited.jpg",
    bubbleText: "终于完成任务了呀",
  },
  {
    mood: "thinking",
    label: "思考",
    image: "/pet/moods/thinking-study.png",
    bubbleText: "认真学习中……",
  },
  {
    mood: "nosePicking",
    label: "抠鼻",
    image: "/pet/moods/nose-picking.png",
    bubbleText: "人，好好学习！我在监督你！",
  },
  {
    mood: "cheer",
    label: "加油",
    image: "/pet/moods/cheer.jpg",
    bubbleText: "努力学习呀！",
  },
  {
    mood: "satisfied",
    label: "满足",
    image: "/pet/moods/satisfied.png",
    bubbleText: "人，这么努力的你一定会取得好成绩！",
  },
  {
    mood: "angry",
    label: "生气",
    image: "/pet/moods/angry.png",
    bubbleText: "人，快滚去学习！",
  },
];

export function findMoodConfig(moodId) {
  return MOOD_CONFIG.find((item) => item.mood === moodId) ?? null;
}
