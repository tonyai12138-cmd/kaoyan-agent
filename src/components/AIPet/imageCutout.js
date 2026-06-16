const memoryCache = new Map();
const CACHE_PREFIX = "aiPet.moodCutout.v1.";
const WHITE_THRESHOLD = 245;
const MAX_OUTPUT_WIDTH = 512;

function getStorage() {
  try {
    return globalThis.window?.localStorage ?? null;
  } catch {
    return null;
  }
}

function hashUrl(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

function readCache(key) {
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  const storage = getStorage();
  if (!storage) return null;

  try {
    const cached = storage.getItem(key);
    if (cached) {
      memoryCache.set(key, cached);
      return cached;
    }
  } catch {
    // localStorage may be unavailable or full; memory cache remains enough.
  }

  return null;
}

function writeCache(key, value) {
  memoryCache.set(key, value);

  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(key, value);
  } catch {
    // Large PNG data URLs can exceed storage quota; keep the memory cache.
  }
}

function loadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("mood image failed to load"));
    image.src = imageUrl;
  });
}

function isNearWhite(data, pixelIndex) {
  const offset = pixelIndex * 4;
  return (
    data[offset + 3] > 0 &&
    data[offset] > WHITE_THRESHOLD &&
    data[offset + 1] > WHITE_THRESHOLD &&
    data[offset + 2] > WHITE_THRESHOLD
  );
}

function enqueueIfWhite(index, data, visited, queue) {
  if (visited[index] || !isNearWhite(data, index)) return;

  visited[index] = 1;
  queue.push(index);
}

function removeConnectedEdgeWhite(imageData, width, height) {
  const { data } = imageData;
  const visited = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x += 1) {
    enqueueIfWhite(x, data, visited, queue);
    enqueueIfWhite((height - 1) * width + x, data, visited, queue);
  }

  for (let y = 0; y < height; y += 1) {
    enqueueIfWhite(y * width, data, visited, queue);
    enqueueIfWhite(y * width + width - 1, data, visited, queue);
  }

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const index = queue[cursor];
    data[index * 4 + 3] = 0;

    const x = index % width;
    const y = Math.floor(index / width);

    if (x > 0) enqueueIfWhite(index - 1, data, visited, queue);
    if (x < width - 1) enqueueIfWhite(index + 1, data, visited, queue);
    if (y > 0) enqueueIfWhite(index - width, data, visited, queue);
    if (y < height - 1) enqueueIfWhite(index + width, data, visited, queue);
  }
}

function getContentBounds(imageData, width, height) {
  const { data } = imageData;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha <= 8) continue;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  const padding = 8;
  const x0 = Math.max(0, minX - padding);
  const y0 = Math.max(0, minY - padding);
  const x1 = Math.min(width - 1, maxX + padding);
  const y1 = Math.min(height - 1, maxY + padding);

  return {
    x: x0,
    y: y0,
    width: x1 - x0 + 1,
    height: y1 - y0 + 1,
  };
}

export async function removeEdgeWhiteBackground(imageUrl) {
  const cacheKey = `${CACHE_PREFIX}${hashUrl(imageUrl)}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  try {
    const image = await loadImage(imageUrl);
    const scale = Math.min(1, MAX_OUTPUT_WIDTH / image.naturalWidth);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return imageUrl;

    context.drawImage(image, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    removeConnectedEdgeWhite(imageData, width, height);
    context.putImageData(imageData, 0, 0);

    const bounds = getContentBounds(imageData, width, height);
    if (!bounds) return imageUrl;

    const output = document.createElement("canvas");
    output.width = bounds.width;
    output.height = bounds.height;

    const outputContext = output.getContext("2d");
    if (!outputContext) return imageUrl;

    outputContext.drawImage(
      canvas,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      0,
      0,
      bounds.width,
      bounds.height,
    );

    const result = output.toDataURL("image/png");
    writeCache(cacheKey, result);
    return result;
  } catch {
    return imageUrl;
  }
}
