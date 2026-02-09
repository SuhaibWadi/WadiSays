export const storage = new MMKV();

export const KEYS = {
  HIGH_SCORE_SOLO: "high_score_solo",
  HIGH_SCORE_FRIEND: "high_score_friend", // Maybe track wins? Or standard sequence length
};

export const getHighScore = (mode: "SOLO" | "FRIEND"): number => {
  const key = mode === "SOLO" ? KEYS.HIGH_SCORE_SOLO : KEYS.HIGH_SCORE_FRIEND;
  return storage.getNumber(key) || 0;
};

export const saveHighScore = (mode: "SOLO" | "FRIEND", score: number) => {
  const key = mode === "SOLO" ? KEYS.HIGH_SCORE_SOLO : KEYS.HIGH_SCORE_FRIEND;
  const currentHigh = getHighScore(mode);
  if (score > currentHigh) {
    storage.set(key, score);
  }
};
