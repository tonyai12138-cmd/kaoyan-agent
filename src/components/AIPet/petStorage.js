export const storageKeys = {
  customFrontImage: "aiPet.customFrontImage",
  customBackImage: "aiPet.customBackImage",
  legacyCustomImage: "aiPet.customImage",
  legacySingleImage: "yantu-ai-pet-image",
  position: "aiPet.position",
  legacyPosition: "yantu-ai-pet-position",
  taskStatus: "aiPet.taskStatus",
  legacyTaskStatus: "yantu-ai-pet-task",
  selectedMood: "aiPet.selectedMood",
};

function getStorage() {
  try {
    return globalThis.window?.localStorage ?? null;
  } catch {
    return null;
  }
}

function readJson(key, fallback) {
  const storage = getStorage();
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function readString(...keys) {
  const storage = getStorage();
  if (!storage) return null;

  for (const key of keys) {
    try {
      const value = storage.getItem(key);
      if (typeof value === "string" && value) {
        return value;
      }
    } catch {
      // Try the next key.
    }
  }

  return null;
}

function writeString(key, value) {
  const storage = getStorage();
  if (!storage || typeof value !== "string") return false;

  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeKeys(...keys) {
  const storage = getStorage();
  if (!storage) return;

  keys.forEach((key) => {
    try {
      storage.removeItem(key);
    } catch {
      // Ignore storage cleanup errors; defaults remain available.
    }
  });
}

export function getPetPosition() {
  const position =
    readJson(storageKeys.position, null) ??
    readJson(storageKeys.legacyPosition, null);
  if (
    position &&
    Number.isFinite(position.x) &&
    Number.isFinite(position.y)
  ) {
    return position;
  }

  return null;
}

export function savePetPosition(position) {
  if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) {
    return false;
  }

  return writeJson(storageKeys.position, {
    x: Math.round(position.x),
    y: Math.round(position.y),
  });
}

export function getCustomPetImages() {
  return {
    frontImage: readString(
      storageKeys.customFrontImage,
      storageKeys.legacyCustomImage,
      storageKeys.legacySingleImage,
    ),
    backImage: readString(storageKeys.customBackImage),
  };
}

export function saveCustomPetImage(kind, dataUrl) {
  const key =
    kind === "back" ? storageKeys.customBackImage : storageKeys.customFrontImage;
  return writeString(key, dataUrl);
}

export function clearCustomPetImages() {
  removeKeys(
    storageKeys.customFrontImage,
    storageKeys.customBackImage,
    storageKeys.legacyCustomImage,
    storageKeys.legacySingleImage,
  );
}

export function getTaskState(today) {
  const state =
    readJson(storageKeys.taskStatus, null) ??
    readJson(storageKeys.legacyTaskStatus, null);
  if (!state || state.date !== today) {
    return {
      date: today,
      completed: false,
    };
  }

  return {
    date: today,
    completed: state.completed === true,
  };
}

export function saveTaskState(state) {
  return writeJson(storageKeys.taskStatus, state);
}

export function getSelectedMood() {
  return readString(storageKeys.selectedMood);
}

export function saveSelectedMood(mood) {
  if (!mood) return false;

  return writeString(storageKeys.selectedMood, mood);
}

export function clearSelectedMood() {
  removeKeys(storageKeys.selectedMood);
}
