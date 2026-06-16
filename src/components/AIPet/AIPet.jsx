import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AIPet3D from "./AIPet3D";
import { aiPetReply } from "./aiPetReply";
import "./AIPet.css";
import { removeEdgeWhiteBackground } from "./imageCutout";
import { compressPetImage } from "./imageUtils";
import { findMoodConfig, MOOD_CONFIG } from "./moodConfig";
import {
  DEFAULT_BACK_IMAGE,
  DEFAULT_FRONT_IMAGE,
  DEFAULT_SIDE_IMAGE,
  clearPetAssets,
  getInitialPetAssets,
  resolveBackImage,
  resolveSideImage,
  savePetAsset,
} from "./petAssets";
import {
  clearSelectedMood,
  getPetPosition,
  getSelectedMood,
  getTaskState,
  savePetPosition,
  saveSelectedMood,
  saveTaskState,
} from "./petStorage";

function viewportSize() {
  if (typeof window === "undefined") {
    return { width: 1280, height: 760 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function todayKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function petSizeFor(width) {
  return width <= 640 ? 118 : 156;
}

function defaultPosition(viewport) {
  const size = petSizeFor(viewport.width);
  return {
    x: Math.max(12, viewport.width - size - 28),
    y: Math.max(72, viewport.height - size - 28),
  };
}

function clampPosition(position, viewport) {
  const size = petSizeFor(viewport.width);
  const margin = viewport.width <= 640 ? 10 : 14;

  return {
    x: Math.min(Math.max(margin, position.x), viewport.width - size - margin),
    y: Math.min(Math.max(64, position.y), viewport.height - size - margin),
  };
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function determineDirection(dx, dy) {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (absX < 5 && absY < 5) return "idle-front";

  if (absY > absX) {
    if (dy < 0) {
      if (dx < -12) return "moving-up-left";
      if (dx > 12) return "moving-up-right";
      return "moving-up";
    }
    return "moving-down";
  }

  return dx < 0 ? "moving-left" : "moving-right";
}

function makeMessage(role, content) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}

function releasePointerCapture(target, pointerId) {
  if (
    target &&
    pointerId !== undefined &&
    target.hasPointerCapture?.(pointerId)
  ) {
    target.releasePointerCapture(pointerId);
  }
}

function isTiredInput(input) {
  const normalized = input.toLowerCase();
  return ["焦虑", "累", "不想学", "压力", "压力大", "崩溃"].some((keyword) =>
    normalized.includes(keyword),
  );
}

function isCompletedInput(input) {
  const normalized = input.toLowerCase();
  return ["完成", "完成了", "做完", "搞定"].some((keyword) =>
    normalized.includes(keyword),
  );
}

export default function AIPet() {
  const { pathname } = useLocation();
  const [viewport, setViewport] = useState(viewportSize);
  const [position, setPosition] = useState(() => {
    const currentViewport = viewportSize();
    return clampPosition(
      getPetPosition() ?? defaultPosition(currentViewport),
      currentViewport,
    );
  });
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [petDirection, setPetDirection] = useState("idle-front");
  const [bouncing, setBouncing] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [petMood, setPetMood] = useState("idle");
  const [use3dPet, setUse3dPet] = useState(false);
  const [assets, setAssets] = useState(getInitialPetAssets);
  const [backMissing, setBackMissing] = useState(false);
  const [sideMissing, setSideMissing] = useState(false);
  const [moodMenuOpen, setMoodMenuOpen] = useState(false);
  const [selectedMoodId, setSelectedMoodId] = useState(() => getSelectedMood());
  const [moodImageSrc, setMoodImageSrc] = useState("");
  const [taskState, setTaskState] = useState(() => getTaskState(todayKey()));
  const [messages, setMessages] = useState([]);
  const [petBubbleText, setPetBubbleText] = useState("");
  const [bubbleType, setBubbleType] = useState("system");
  const dragRef = useRef(null);
  const resetDirectionTimer = useRef(null);
  const staleDragTimer = useRef(null);
  const speechTimer = useRef(null);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const petSize = petSizeFor(viewport.width);
  const isBackDirection = petDirection.startsWith("moving-up");
  const isSideDirection =
    petDirection === "moving-left" || petDirection === "moving-right";
  const shouldUseBackImage = isBackDirection && !backMissing;
  const shouldUseSideImage = isSideDirection && !sideMissing;
  const selectedMood = findMoodConfig(selectedMoodId);
  const imageSrc = shouldUseBackImage
    ? resolveBackImage(assets)
    : shouldUseSideImage
      ? resolveSideImage(assets)
      : assets.frontImage || DEFAULT_FRONT_IMAGE;
  const displayedImageSrc = selectedMood
    ? moodImageSrc || selectedMood.image
    : imageSrc;
  const displayedMessages = messages.filter((message) => message.role === "user").slice(-2);
  const speechText =
    petBubbleText || (!bubbleOpen && selectedMood ? selectedMood.bubbleText : "");
  const speechType = petBubbleText ? bubbleType : "mood";
  const activeMood =
    petMood === "tired" ? "tired" : pending ? "thinking" : petMood;

  const bubbleStyle = useMemo(() => {
    if (viewport.width <= 640) {
      return undefined;
    }

    const width = 318;
    const height = 260;
    const gap = 12;
    const margin = 14;
    const preferredLeft =
      position.x < viewport.width / 2
        ? position.x
        : position.x + petSize - width;
    const belowTop = position.y + petSize + gap;
    const aboveTop = position.y - height - gap;
    const top =
      aboveTop >= margin
        ? aboveTop
        : Math.min(
            Math.max(margin, belowTop),
            viewport.height - height - margin,
          );

    return {
      left: Math.min(
        Math.max(margin, preferredLeft),
        viewport.width - width - margin,
      ),
      top,
    };
  }, [petSize, position.x, position.y, viewport.height, viewport.width]);

  const speechBubbleLayout = useMemo(() => {
    const margin = viewport.width <= 640 ? 10 : 12;
    const width = Math.min(viewport.width <= 640 ? 218 : 236, viewport.width - margin * 2);
    const height = viewport.width <= 640 ? 68 : 72;
    const petCenterX = position.x + petSize / 2;
    const petCenterY = position.y + petSize / 2;

    if (viewport.width <= 640) {
      const left = clampNumber(petCenterX - width / 2, margin, viewport.width - width - margin);
      const aboveTop = position.y - height - 8;
      const top = aboveTop >= margin
        ? aboveTop
        : clampNumber(position.y + petSize + 8, margin, viewport.height - height - margin);

      return {
        placement: aboveTop >= margin ? "top" : "bottom",
        style: {
          left,
          top,
          width,
          "--ai-pet-speech-arrow-x": `${clampNumber(petCenterX - left, 18, width - 18)}px`,
        },
      };
    }

    if (bubbleOpen) {
      const canUseLeft = position.x - width - 10 >= margin;
      const canUseRight = position.x + petSize + 10 + width <= viewport.width - margin;
      const placement = canUseLeft || !canUseRight ? "left" : "right";
      const left =
        placement === "left"
          ? clampNumber(position.x - width + 12, margin, viewport.width - width - margin)
          : clampNumber(position.x + petSize - 12, margin, viewport.width - width - margin);
      const top = clampNumber(petCenterY - height / 2, margin, viewport.height - height - margin);

      return {
        placement,
        style: {
          left,
          top,
          width,
        },
      };
    }

    const left = clampNumber(petCenterX - width / 2, margin, viewport.width - width - margin);
    const aboveTop = position.y - height - 10;
    const top = aboveTop >= margin
      ? aboveTop
      : clampNumber(position.y + petSize + 10, margin, viewport.height - height - margin);

    return {
      placement: aboveTop >= margin ? "top" : "bottom",
      style: {
        left,
        top,
        width,
        "--ai-pet-speech-arrow-x": `${clampNumber(petCenterX - left, 18, width - 18)}px`,
      },
    };
  }, [bubbleOpen, petSize, position.x, position.y, viewport.height, viewport.width]);

  useEffect(() => {
    function handleResize() {
      setViewport(viewportSize());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setPosition((current) => clampPosition(current, viewport));
  }, [viewport]);

  useEffect(() => {
    return () => {
      if (speechTimer.current) {
        window.clearTimeout(speechTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    setBackMissing(false);
  }, [assets.backImage]);

  useEffect(() => {
    setSideMissing(false);
  }, [assets.sideImage]);

  useEffect(() => {
    if (!selectedMoodId) {
      setMoodImageSrc("");
      return undefined;
    }

    const mood = findMoodConfig(selectedMoodId);
    if (!mood) {
      setSelectedMoodId(null);
      clearSelectedMood();
      setMoodImageSrc("");
      return undefined;
    }

    let cancelled = false;
    setMoodImageSrc(mood.image);

    removeEdgeWhiteBackground(mood.image).then((processedImage) => {
      if (!cancelled) {
        setMoodImageSrc(processedImage);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedMoodId]);

  function showPetSpeech(content, type = "system", duration = 5600) {
    const nextText = String(content ?? "").trim();
    if (!nextText) return;

    if (speechTimer.current) {
      window.clearTimeout(speechTimer.current);
      speechTimer.current = null;
    }

    setPetBubbleText(nextText);
    setBubbleType(type);

    if (duration > 0) {
      speechTimer.current = window.setTimeout(() => {
        setPetBubbleText((current) => (current === nextText ? "" : current));
        speechTimer.current = null;
      }, duration);
    }
  }

  function addAssistantMessage(content) {
    showPetSpeech(content, "system");
  }

  function applyMood(moodId, { closeMenu = true } = {}) {
    const mood = findMoodConfig(moodId);
    if (!mood) return;

    setSelectedMoodId(mood.mood);
    saveSelectedMood(mood.mood);
    setPetDirection("idle-front");
    setUse3dPet(false);
    if (closeMenu) {
      setMoodMenuOpen(false);
    }
  }

  function handleMoodSelect(mood) {
    applyMood(mood.mood);
    showPetSpeech(mood.bubbleText, "mood", 0);
    pulsePet(mood.mood === "thinking" ? "thinking" : "happy", 720);
  }

  function restoreDefaultMood() {
    setSelectedMoodId(null);
    setMoodImageSrc("");
    setMoodMenuOpen(false);
    clearSelectedMood();
    showPetSpeech("已恢复默认桌宠状态。", "system");
    pulsePet("happy");
  }

  function pulsePet(mood = "happy", duration = 560) {
    setPetMood(mood);
    setPetDirection("idle-front");
    setBouncing(mood === "happy");
    window.setTimeout(() => {
      setBouncing(false);
      setPetMood("idle");
      setPetDirection("idle-front");
    }, duration);
  }

  function scheduleIdleReset(delay = 500) {
    if (resetDirectionTimer.current) {
      window.clearTimeout(resetDirectionTimer.current);
    }

    resetDirectionTimer.current = window.setTimeout(() => {
      setPetDirection("idle-front");
      setPetMood("happy");
      setBouncing(true);
      window.setTimeout(() => {
        setBouncing(false);
        setPetMood("idle");
      }, 280);
    }, delay);
  }

  function clearStaleDragTimer() {
    if (staleDragTimer.current) {
      window.clearTimeout(staleDragTimer.current);
      staleDragTimer.current = null;
    }
  }

  function finishStaleDrag() {
    if (!dragRef.current) return;

    const dragState = dragRef.current;
    const wasMoved = dragState.moved;
    dragRef.current = null;
    setDragging(false);
    releasePointerCapture(dragState.target, dragState.pointerId);
    setPosition((current) => {
      const nextPosition = clampPosition(current, viewport);
      savePetPosition(nextPosition);
      return nextPosition;
    });

    if (wasMoved) {
      scheduleIdleReset(0);
    }
  }

  function beginDrag(event) {
    if (event.button !== 0) return;

    clearStaleDragTimer();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
      pointerId: event.pointerId,
      target: event.currentTarget,
    };
    if (resetDirectionTimer.current) {
      window.clearTimeout(resetDirectionTimer.current);
    }
    setDragging(true);
  }

  function movePet(event) {
    if (!dragRef.current) return;

    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.moved = true;
    }

    setPetDirection(determineDirection(dx, dy));
    setPosition(
      clampPosition(
        {
          x: dragRef.current.originX + dx,
          y: dragRef.current.originY + dy,
        },
        viewport,
      ),
    );

    clearStaleDragTimer();
    staleDragTimer.current = window.setTimeout(finishStaleDrag, 650);
  }

  function endDrag(event) {
    if (!dragRef.current) return;

    clearStaleDragTimer();
    const dragState = dragRef.current;
    const wasMoved = dragRef.current.moved;
    dragRef.current = null;
    setDragging(false);
    setPosition((current) => {
      const nextPosition = clampPosition(current, viewport);
      savePetPosition(nextPosition);
      return nextPosition;
    });

    releasePointerCapture(dragState.target, dragState.pointerId);

    if (wasMoved) {
      scheduleIdleReset();
      return;
    }

    pulsePet("happy");
    setBubbleOpen((current) => !current);
  }

  function cancelDrag() {
    clearStaleDragTimer();
    const dragState = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (dragState) {
      releasePointerCapture(dragState.target, dragState.pointerId);
      setPosition((current) => {
        const nextPosition = clampPosition(current, viewport);
        savePetPosition(nextPosition);
        return nextPosition;
      });
    }
    scheduleIdleReset();
  }

  async function sendMessage(message, actionType = "custom", contextOverrides = {}) {
    const content = message.trim();
    if (!content || pending) return;

    setBubbleOpen(true);
    setInput("");
    setMessages((current) => [...current, makeMessage("user", content)]);
    setPending(true);
    showPetSpeech("我想一想，马上回来~", "system", 0);
    const shouldLookTired = isTiredInput(content);
    const shouldLookHappy = isCompletedInput(content);
    if (shouldLookTired) {
      applyMood("lazy", { closeMenu: false });
    } else if (shouldLookHappy) {
      applyMood("excited", { closeMenu: false });
    } else if (actionType === "progress") {
      applyMood("cheer", { closeMenu: false });
    } else if (actionType === "prompt") {
      applyMood("thinking", { closeMenu: false });
    }
    setPetMood(shouldLookTired ? "tired" : "thinking");

    try {
      const reply = await aiPetReply({
        userInput: content,
        actionType,
        context: {
          route: pathname,
          currentMood: selectedMoodId,
          taskCompleted: taskState.completed,
          ...contextOverrides,
        },
      });
      showPetSpeech(reply, "ai", 8000);
    } finally {
      setPending(false);
      pulsePet(
        shouldLookTired ? "tired" : shouldLookHappy ? "happy" : "happy",
        shouldLookTired ? 1200 : 560,
      );
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(input);
  }

  function handlePromptAction() {
    setShowImageSettings(false);
    applyMood("thinking", { closeMenu: false });
    sendMessage("优化提问", "prompt");
  }

  function handleMoodCheckAction() {
    applyMood("satisfied", { closeMenu: false });
    sendMessage("心情怎么样，帮我调整一下状态", "mood");
  }

  function handleProgressAction() {
    const nextState = {
      date: todayKey(),
      completed: true,
    };
    setTaskState(nextState);
    saveTaskState(nextState);
    applyMood(taskState.completed ? "thinking" : "cheer", { closeMenu: false });
    sendMessage("学习进度", "progress", { taskCompleted: nextState.completed });
  }

  async function handleUpload(kind, event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressPetImage(file);
      const saved = savePetAsset(kind, dataUrl);
      if (!saved) throw new Error("图片保存失败");

      setAssets((current) => ({
        ...current,
        frontImage: kind === "front" ? dataUrl : current.frontImage,
        backImage:
          kind === "back"
            ? dataUrl
            : kind === "front" && !current.customBackImage
              ? null
              : current.backImage,
        customFrontImage: kind === "front" ? dataUrl : current.customFrontImage,
        customBackImage: kind === "back" ? dataUrl : current.customBackImage,
        backFallback:
          kind === "front" && !current.customBackImage
            ? true
            : kind === "back"
              ? false
              : current.backFallback,
      }));
      setUse3dPet(false);
      setBackMissing(false);
      showPetSpeech(kind === "front" ? "正面形象已保存。" : "背面形象已保存，向上拖拽时会优先展示。", "system");
      pulsePet("happy");
    } catch {
      showPetSpeech("上传失败，已保留当前形象。请使用 jpg、jpeg、png 或 webp。", "system");
    } finally {
      event.target.value = "";
    }
  }

  function restoreDefaults() {
    clearPetAssets();
    setAssets({
      frontImage: DEFAULT_FRONT_IMAGE,
      sideImage: DEFAULT_SIDE_IMAGE,
      backImage: DEFAULT_BACK_IMAGE,
      customFrontImage: null,
      customBackImage: null,
      backFallback: false,
    });
    setUse3dPet(false);
    setBackMissing(false);
    setSideMissing(false);
    setSelectedMoodId(null);
    setMoodImageSrc("");
    setMoodMenuOpen(false);
    clearSelectedMood();
    showPetSpeech("已恢复你的原图桌宠。", "system");
    pulsePet("happy");
  }

  const rootClass = [
    "ai-pet-root",
    dragging ? "is-dragging" : "",
    bouncing ? "is-bouncing" : "",
    pending ? "is-thinking" : "",
    activeMood !== "idle" ? `is-${activeMood}` : "",
    selectedMood ? "has-selected-mood" : "",
    use3dPet && !selectedMood ? "is-3d" : "is-2d",
    `is-${petDirection}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} style={{ left: position.x, top: position.y }}>
      {speechText && (
        <div
          aria-live={speechType === "ai" ? "polite" : "off"}
          className={`ai-pet-speech-bubble is-${speechType} is-${speechBubbleLayout.placement}`}
          role="status"
          style={speechBubbleLayout.style}
        >
          <span>
            {speechText}
          </span>
        </div>
      )}

      <button
        aria-label="研途智伴 AI 桌宠"
        className="ai-pet-avatar"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            pulsePet("happy");
            setBubbleOpen((current) => !current);
          }
        }}
        onPointerCancel={cancelDrag}
        onPointerDown={beginDrag}
        onLostPointerCapture={cancelDrag}
        onPointerMove={movePet}
        onPointerUp={endDrag}
        type="button"
      >
        <span className="ai-pet-shadow" aria-hidden="true" />
        {use3dPet && !selectedMood && (
          <AIPet3D
            direction={petDirection}
            dragging={dragging}
            mood={activeMood}
            onUnavailable={() => setUse3dPet(false)}
          />
        )}
        {(!use3dPet || selectedMood) && (
          <img
            alt={selectedMood ? `${selectedMood.label}研途小熊` : "研途小熊"}
            className={`ai-pet-image${selectedMood ? " ai-pet-mood-image" : ""}`}
            draggable="false"
            onError={() => {
              if (selectedMood) {
                setMoodImageSrc(selectedMood.image);
                return;
              }
              if (shouldUseBackImage) {
                setBackMissing(true);
              }
              if (shouldUseSideImage) {
                setSideMissing(true);
              }
            }}
            src={displayedImageSrc}
          />
        )}
      </button>

      <div className="ai-pet-mood-controls">
        <button
          aria-expanded={moodMenuOpen}
          className="ai-pet-mood-toggle"
          onClick={() => setMoodMenuOpen((current) => !current)}
          type="button"
        >
          心情
        </button>

        {moodMenuOpen && (
          <div className="ai-pet-mood-panel" role="menu">
            {MOOD_CONFIG.map((mood) => (
              <button
                className={mood.mood === selectedMoodId ? "is-active" : ""}
                key={mood.mood}
                onClick={() => handleMoodSelect(mood)}
                role="menuitem"
                type="button"
              >
                {mood.label}
              </button>
            ))}
            <button
              className="ai-pet-mood-restore"
              onClick={restoreDefaultMood}
              role="menuitem"
              type="button"
            >
              恢复默认
            </button>
          </div>
        )}
      </div>

      {bubbleOpen && (
        <section
          aria-label="研途小熊轻量对话"
          className="ai-pet-bubble"
          style={bubbleStyle}
        >
          <header className="ai-pet-bubble-head">
            <div>
              <p className="ai-pet-bubble-title">研途小熊 · AI 助手</p>
              <p className="ai-pet-bubble-status">
                {pending ? "正在思考" : taskState.completed ? "今日有进度" : "陪你拆小任务"}
              </p>
            </div>
            <button
              aria-label="关闭研途小熊气泡"
              className="ai-pet-icon-button"
              onClick={() => setBubbleOpen(false)}
              type="button"
            >
              ×
            </button>
          </header>

          <div className="ai-pet-actions">
            <button onClick={handleProgressAction} type="button">学习进度</button>
            <button onClick={handleMoodCheckAction} type="button">
              心情怎么样
            </button>
            <button onClick={handlePromptAction} type="button">优化提问</button>
            <button
              onClick={() => setShowImageSettings((current) => !current)}
              type="button"
            >
              更换桌宠
            </button>
          </div>

          {showImageSettings && (
            <div className="ai-pet-upload-panel">
              <button onClick={() => frontInputRef.current?.click()} type="button">
                上传正面形象
              </button>
              <button onClick={() => backInputRef.current?.click()} type="button">
                上传背面形象
              </button>
              <button onClick={restoreDefaults} type="button">恢复默认形象</button>
              <input
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="ai-pet-file-input"
                onChange={(event) => handleUpload("front", event)}
                ref={frontInputRef}
                type="file"
              />
              <input
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="ai-pet-file-input"
                onChange={(event) => handleUpload("back", event)}
                ref={backInputRef}
                type="file"
              />
            </div>
          )}

          {displayedMessages.length > 0 && (
            <div className="ai-pet-replies">
              {displayedMessages.map((message) => (
                <p className={`ai-pet-reply ai-pet-reply-${message.role}`} key={message.id}>
                  {message.content}
                </p>
              ))}
            </div>
          )}

          <form className="ai-pet-form" onSubmit={handleSubmit}>
            <input
              onChange={(event) => setInput(event.target.value)}
              placeholder="问问研途小熊……"
              value={input}
            />
            <button disabled={pending} type="submit">发送</button>
          </form>
        </section>
      )}
    </div>
  );
}
