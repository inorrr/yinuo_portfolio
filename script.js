const canvas = document.getElementById("kinetic-name");
const ctx = canvas.getContext("2d");
const navRail = document.getElementById("section-nav");
const customCursor = document.getElementById("custom-cursor");
const experienceIntro = document.getElementById("experience-intro");
const experienceTimeline = document.getElementById("experience-timeline");
const experienceMobileQuery = window.matchMedia("(max-width: 640px)");

const CONFIG = {
  name: "YINUO ZHAO",
  sidePadding: 0.08,
  topAnchorPadding: 0,
  baseFontDesktop: 104,
  baseFontMobile: 56,
  minFont: 28,
  maxFont: 120,
  letterSpacingFactor: 1.12,
  wordGapFactor: 1.45,
  minLengthFactor: 0.24,
  maxLengthFactor: 0.38,
  gravity: 1000,
  airFriction: 0.996,
  substeps: 2,
  constraintIterations: 18,
  returnStrength: 0.006,
  midReturnStrength: 0.016,
  settleBoost: 1.06,
  idleSwingForce: 18,
  idleSwingFrequency: 0.00055,
  idleRestFactor: 0.24,
  pointerRadius: 112,
  pointerRecentMs: 650,
  pointerVelocityInfluence: 0.22,
  pointerPush: 5,
  stringTouchRadius: 64,
  stringPull: 1.6,
  maxVelocity: 1,
  stringWidth: 1.8,
  ropeSegments: 15,
  letterTiltResponse: 0.2,
  letterTiltDamping: 0.62,
  devicePixelCap: 2,
};

const pointer = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  inside: false,
  movedAt: 0,
  lastX: 0,
  lastY: 0,
};

const letters = [];
let width = 0;
let height = 0;
let lastFrame = performance.now();
let accumulator = 0;
const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

function getMonthsBetween(start, end) {
  return (end.year - start.year) * 12 + (end.month - start.month);
}

function parseContentMonth(dateString) {
  const [yearString, monthString] = dateString.split("-");
  return {
    year: Number(yearString),
    month: Number(monthString),
  };
}

function renderExperienceTimeline() {
  const experienceContent = window.SITE_CONTENT && window.SITE_CONTENT.experience;

  if (!experienceTimeline || !experienceContent) {
    return;
  }

  const { intro, rangeStart, rangeEnd, events } = experienceContent;
  const line = experienceTimeline.querySelector(".experience-timeline__line");

  if (!line) {
    return;
  }

  if (experienceIntro) {
    experienceIntro.textContent = intro;
  }

  const totalMonths = getMonthsBetween(rangeStart, rangeEnd);
  experienceTimeline.style.setProperty("--timeline-months", `${totalMonths}`);

  experienceTimeline.querySelectorAll(".experience-year-tick, .experience-event").forEach((node) => {
    node.remove();
  });

  for (let year = rangeStart.year; year <= rangeEnd.year; year += 1) {
    const monthOffset = getMonthsBetween(rangeStart, { year, month: 1 });

    if (monthOffset < 0 || monthOffset > totalMonths) {
      continue;
    }

    const tick = document.createElement("div");
    tick.className = "experience-year-tick";
    tick.style.setProperty("--month", `${monthOffset}`);

    const label = document.createElement("span");
    label.className = "experience-year-tick__label";
    label.textContent = `${year}`;
    tick.appendChild(label);

    experienceTimeline.appendChild(tick);
  }

  const laidOutEvents = getExperienceEventLayout(events, rangeStart);

  laidOutEvents.forEach((event, index) => {
    const article = document.createElement("article");
    article.className = `experience-event experience-event--${index % 2 === 0 ? "top" : "bottom"}`;
    article.style.setProperty("--month", `${event.monthOffset}`);
    article.style.setProperty("--event-level", `${event.level}`);
    article.dataset.type = event.type || "other";
    article.dataset.side = index % 2 === 0 ? "top" : "bottom";

    const connector = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    connector.classList.add("experience-event__connector");
    connector.setAttribute("aria-hidden", "true");
    connector.setAttribute("focusable", "false");

    const connectorPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    connectorPath.classList.add("experience-event__connector-path");
    connector.appendChild(connectorPath);

    const card = document.createElement("div");
    card.className = "experience-event__card";

    const meta = document.createElement("div");
    meta.className = "experience-event__meta";

    const date = document.createElement("p");
    date.className = "experience-event__date";
    date.textContent = formatExperienceDate(event.eventDate);

    meta.appendChild(date);

    const title = document.createElement("h3");
    title.className = "experience-event__title";
    title.textContent = event.title;

    const details = document.createElement("div");
    details.className = "experience-event__details";

    const detailsInner = document.createElement("div");
    detailsInner.className = "experience-event__details-inner";

    if (event.detailImage) {
      const detailImage = document.createElement("img");
      detailImage.className = "experience-event__detail-image";
      detailImage.src = event.detailImage;
      detailImage.alt = `${event.title} preview`;
      detailImage.loading = "lazy";
      detailImage.decoding = "async";
      detailsInner.appendChild(detailImage);
    }

    const detailText = document.createElement("p");
    detailText.className = "experience-event__detail-text";
    detailText.textContent =
      event.detailText ||
      "Add a short note here about what this milestone meant, what you learned, or a memory you want to surface on hover.";

    detailsInner.appendChild(detailText);
    details.appendChild(detailsInner);
    card.append(meta, title, details);
    article.append(connector, card);
    experienceTimeline.appendChild(article);
  });

  positionExperienceTimelineCards();
}

function getExperienceEventLayout(events, rangeStart) {
  const minGapMonths = 7;
  const lanesBySide = {
    top: [],
    bottom: [],
  };

  return events.map((event, index) => {
    const eventDate = parseContentMonth(event.date);
    const monthOffset = getMonthsBetween(rangeStart, eventDate);
    const side = index % 2 === 0 ? "top" : "bottom";
    const lanes = lanesBySide[side];
    let level = 0;

    while (lanes[level] !== undefined && monthOffset - lanes[level] < minGapMonths) {
      level += 1;
    }

    lanes[level] = monthOffset;

    return {
      ...event,
      eventDate,
      monthOffset,
      level,
    };
  });
}

function formatExperienceDate({ year, month }) {
  const date = new Date(year, month - 1, 1);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function positionExperienceTimelineCards() {
  if (!experienceTimeline) {
    return;
  }

  const events = [...experienceTimeline.querySelectorAll(".experience-event")];

  if (!events.length) {
    return;
  }

  events.forEach((event) => {
    event.style.setProperty("--event-nudge", "0px");
  });

  if (experienceMobileQuery.matches) {
    updateExperienceConnectors();
    return;
  }

  const placementsBySide = {
    top: [],
    bottom: [],
  };
  const overlapPaddingX = 0;
  const overlapPaddingY = 18;
  const maxVerticalLevel = 6;

  ["top", "bottom"].forEach((side) => {
    const sideEvents = events
      .filter((event) => event.dataset.side === side)
      .sort(
        (a, b) =>
          Number.parseFloat(a.style.getPropertyValue("--month")) -
          Number.parseFloat(b.style.getPropertyValue("--month"))
      );

    sideEvents.forEach((event) => {
      const card = event.querySelector(".experience-event__card");

      if (!card) {
        return;
      }

      const timelineRect = experienceTimeline.getBoundingClientRect();
      const baseRect = card.getBoundingClientRect();
      const baseLevel = Number.parseFloat(event.style.getPropertyValue("--event-level")) || 0;
      let chosenLevel = baseLevel;

      for (let level = baseLevel; level <= maxVerticalLevel; level += 1) {
        const verticalDelta = (level - baseLevel) * 4.5 * 16;
        const candidateRect = {
          left: baseRect.left,
          right: baseRect.right,
          top: side === "top" ? baseRect.top - verticalDelta : baseRect.top + verticalDelta,
          bottom: side === "top" ? baseRect.bottom - verticalDelta : baseRect.bottom + verticalDelta,
        };

        const overlaps = placementsBySide[side].some((placedRect) => {
          return !(
            candidateRect.right + overlapPaddingX <= placedRect.left ||
            candidateRect.left >= placedRect.right + overlapPaddingX ||
            candidateRect.bottom + overlapPaddingY <= placedRect.top ||
            candidateRect.top >= placedRect.bottom + overlapPaddingY
          );
        });

        if (!overlaps) {
          chosenLevel = level;
          break;
        }
      }

      event.style.setProperty("--event-level", `${chosenLevel}`);
      placementsBySide[side].push({
        left: baseRect.left,
        right: baseRect.right,
        top: side === "top" ? baseRect.top - (chosenLevel - baseLevel) * 4.5 * 16 : baseRect.top + (chosenLevel - baseLevel) * 4.5 * 16,
        bottom: side === "top" ? baseRect.bottom - (chosenLevel - baseLevel) * 4.5 * 16 : baseRect.bottom + (chosenLevel - baseLevel) * 4.5 * 16,
      });
    });

    applyExperienceHorizontalNudges(sideEvents);
  });

  updateExperienceConnectors();
}

function applyExperienceHorizontalNudges(events) {
  const groups = new Map();

  events.forEach((event) => {
    const month = event.style.getPropertyValue("--month");
    const group = groups.get(month) || [];
    group.push(event);
    groups.set(month, group);
  });

  groups.forEach((group) => {
    if (group.length < 2) {
      return;
    }

    const card = group[0].querySelector(".experience-event__card");

    if (!card) {
      return;
    }

    const nudgeStep = card.getBoundingClientRect().width / 4;
    const midpoint = (group.length - 1) / 2;

    group.forEach((event, index) => {
      const offset = (index - midpoint) * nudgeStep;
      event.style.setProperty("--event-nudge", `${offset}px`);
    });
  });
}

function updateExperienceConnectors() {
  if (!experienceTimeline) {
    return;
  }

  const events = [...experienceTimeline.querySelectorAll(".experience-event")];

  events.forEach((event) => {
    const connector = event.querySelector(".experience-event__connector");
    const path = connector && connector.querySelector(".experience-event__connector-path");
    const card = event.querySelector(".experience-event__card");

    if (!connector || !path || !card) {
      return;
    }

    if (experienceMobileQuery.matches) {
      connector.removeAttribute("viewBox");
      path.removeAttribute("d");
      return;
    }

    const eventRect = event.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const anchorX = eventRect.left + eventRect.width / 2;
    const anchorY = eventRect.top + eventRect.height / 2;
    const targetX = cardRect.left + cardRect.width / 2;
    const targetY = event.dataset.side === "top" ? cardRect.bottom : cardRect.top;
    const dx = targetX - anchorX;
    const dy = targetY - anchorY;
    const minX = Math.min(0, dx);
    const maxX = Math.max(0, dx);
    const minY = Math.min(0, dy);
    const maxY = Math.max(0, dy);
    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    const startX = -minX;
    const startY = -minY;
    const endX = dx - minX;
    const endY = dy - minY;

    connector.style.left = `calc(50% + ${minX}px)`;
    connector.style.top = `calc(50% + ${minY}px)`;
    connector.style.width = `${width}px`;
    connector.style.height = `${height}px`;
    connector.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const curveOffsetX = Math.abs(dx) < 1 ? width * 0.28 : 0;
    const control1X = startX + curveOffsetX;
    const control2X = endX + curveOffsetX;
    const control1Y = startY + dy * 0.68;
    const control2Y = endY - dy * 0.18;
    path.setAttribute(
      "d",
      `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`
    );
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createPoint(x, y) {
  return {
    x,
    y,
    oldX: x,
    oldY: y,
    restX: x,
    restY: y,
  };
}

function makeLetters() {
  letters.length = 0;

  [...CONFIG.name].forEach((char, index) => {
    if (char === " ") {
      letters.push({ char, isSpace: true });
      return;
    }

    letters.push({
      char,
      index,
      isSpace: false,
      phase: index * 0.67 + Math.random() * 0.2,
      anchorX: 0,
      anchorY: CONFIG.topAnchorPadding,
      fontSize: 0,
      width: 0,
      totalLength: 0,
      segmentLength: 0,
      ropePoints: [],
      bob: createPoint(0, 0),
      displayTilt: 0,
    });
  });
}

function measureLetterWidth(fontSize, char) {
  ctx.save();
  ctx.font = `400 ${fontSize}px "Cardo", "Iowan Old Style", "Palatino Linotype", serif`;
  const measured = ctx.measureText(char);
  ctx.restore();
  return measured.width;
}

function updateCanvasSize() {
  const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.devicePixelCap);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  layoutLetters();
}

function layoutLetters() {
  const activeLetters = letters.filter((letter) => !letter.isSpace);
  const isMobile = width < 900;
  let fontSize = isMobile ? CONFIG.baseFontMobile : CONFIG.baseFontDesktop;
  const availableWidth = width * (1 - CONFIG.sidePadding * 2);

  function computeTotalWidth(size) {
    let total = 0;
    letters.forEach((letter) => {
      if (letter.isSpace) {
        total += size * CONFIG.wordGapFactor;
        return;
      }
      total += measureLetterWidth(size, letter.char) + size * (CONFIG.letterSpacingFactor - 1);
    });
    return total;
  }

  while (computeTotalWidth(fontSize) > availableWidth && fontSize > CONFIG.minFont) {
    fontSize -= 2;
  }

  fontSize = clamp(fontSize, CONFIG.minFont, CONFIG.maxFont);

  const totalWidth = computeTotalWidth(fontSize);
  let cursorX = Math.max(width * CONFIG.sidePadding, (width - totalWidth) * 0.5);
  let activeIndex = 0;
  const compositionCenterY = height * (isMobile ? 0.56 : 0.52);

  letters.forEach((letter) => {
    if (letter.isSpace) {
      cursorX += fontSize * CONFIG.wordGapFactor;
      return;
    }

    const letterWidth = measureLetterWidth(fontSize, letter.char);
    const normalized = activeLetters.length <= 1 ? 0.5 : activeIndex / (activeLetters.length - 1);
    const lengthWave = 0.5 + 0.5 * Math.sin(normalized * Math.PI * 1.45 + 0.45);
    const lengthFactor =
      CONFIG.minLengthFactor + (CONFIG.maxLengthFactor - CONFIG.minLengthFactor) * lengthWave;
    const visualOffset = Math.cos(normalized * Math.PI * 2.1) * height * 0.02;
    const totalLength = clamp(
      height * lengthFactor + (compositionCenterY - height * 0.33) + visualOffset - letter.anchorY,
      height * CONFIG.minLengthFactor,
      height * CONFIG.maxLengthFactor
    );

    letter.fontSize = fontSize;
    letter.width = letterWidth;
    letter.anchorX = cursorX + letterWidth * 0.5;
    letter.anchorY = CONFIG.topAnchorPadding;
    letter.totalLength = totalLength;
    letter.segmentLength = totalLength / CONFIG.ropeSegments;

    const restBobX = letter.anchorX;
    const restBobY = letter.anchorY + totalLength;
    letter.ropePoints = Array.from({ length: CONFIG.ropeSegments - 1 }, (_, ropeIndex) => {
      const y = letter.anchorY + letter.segmentLength * (ropeIndex + 1);
      const existing = letter.ropePoints[ropeIndex] || createPoint(letter.anchorX, y);
      positionPoint(existing, letter.anchorX, y);
      return existing;
    });
    positionPoint(letter.bob, restBobX, restBobY);

    cursorX += letterWidth + fontSize * (CONFIG.letterSpacingFactor - 1);
    activeIndex += 1;
  });
}

function positionPoint(point, x, y) {
  point.x = x;
  point.y = y;
  point.oldX = x;
  point.oldY = y;
  point.restX = x;
  point.restY = y;
}

function pointerIsActive(now) {
  return pointer.inside && now - pointer.movedAt < CONFIG.pointerRecentMs;
}

function applyPointerToPoint(point, radius, pushScale, dt) {
  if (!pointer.inside) {
    return;
  }

  const dx = point.x - pointer.x;
  const dy = point.y - pointer.y;
  const distance = Math.hypot(dx, dy);

  if (distance >= radius || distance === 0) {
    return;
  }

  const influence = 1 - distance / radius;
  const awayX = dx / distance;
  const awayY = dy / distance;
  point.x += awayX * pushScale * influence * dt * 60;
  point.y += awayY * pushScale * influence * dt * 24;
  point.x += pointer.vx * CONFIG.pointerVelocityInfluence * influence * dt;
  point.y += pointer.vy * CONFIG.pointerVelocityInfluence * 0.18 * influence * dt;
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return { distance: Math.hypot(px - x1, py - y1), t: 0 };
  }

  const t = clamp(((px - x1) * dx + (py - y1) * dy) / lengthSquared, 0, 1);
  const closestX = x1 + dx * t;
  const closestY = y1 + dy * t;

  return {
    distance: Math.hypot(px - closestX, py - closestY),
    t,
    closestX,
    closestY,
  };
}

function applyPointerToString(letter, dt) {
  if (!pointer.inside) {
    return;
  }

  const nodes = [{ x: letter.anchorX, y: letter.anchorY }, ...letter.ropePoints, letter.bob];
  const segments = nodes.slice(0, -1).map((node, index) => ({
    x1: node.x,
    y1: node.y,
    x2: nodes[index + 1].x,
    y2: nodes[index + 1].y,
    point: nodes[index + 1] === letter.bob ? letter.bob : letter.ropePoints[index],
  }));

  segments.forEach((segment) => {
    const { distance, t, closestX, closestY } = distanceToSegment(
      pointer.x,
      pointer.y,
      segment.x1,
      segment.y1,
      segment.x2,
      segment.y2
    );

    if (distance >= CONFIG.stringTouchRadius) {
      return;
    }

    const influence = 1 - distance / CONFIG.stringTouchRadius;
    const alongBias = 1 - Math.abs(t - 0.5) / 0.5;
    const push = CONFIG.stringPull * influence * alongBias * dt * 60;
    const dirX = clamp(pointer.vx * 0.18 + (pointer.x - closestX) * 0.16, -12, 12);
    const dirY = clamp(pointer.vy * 0.08 + (pointer.y - closestY) * 0.08, -8, 8);

    segment.point.x += dirX * push * 0.1;
    segment.point.y += dirY * push * 0.04;
  });
}

function integratePoint(point, dt, gravityScale) {
  let vx = (point.x - point.oldX) * CONFIG.airFriction;
  let vy = (point.y - point.oldY) * CONFIG.airFriction;

  vx = clamp(vx, -CONFIG.maxVelocity, CONFIG.maxVelocity);
  vy = clamp(vy, -CONFIG.maxVelocity, CONFIG.maxVelocity);

  point.oldX = point.x;
  point.oldY = point.y;
  point.x += vx;
  point.y += vy + CONFIG.gravity * gravityScale * dt * dt;
}

function applyReturnForce(point, strength, settleFactor, options = {}) {
  const { x = true, y = true } = options;
  if (x) {
    point.x += (point.restX - point.x) * strength * settleFactor;
  }
  if (y) {
    point.y += (point.restY - point.y) * strength * settleFactor;
  }
}

function satisfyConstraint(a, b, targetLength, stiffness = 1) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy) || 0.0001;
  const difference = (distance - targetLength) / distance;
  const offsetX = dx * 0.5 * difference * stiffness;
  const offsetY = dy * 0.5 * difference * stiffness;

  a.x += offsetX;
  a.y += offsetY;
  b.x -= offsetX;
  b.y -= offsetY;
}

function constrainLetter(letter) {
  for (let i = 0; i < CONFIG.constraintIterations; i += 1) {
    let previous = { x: letter.anchorX, y: letter.anchorY };

    letter.ropePoints.forEach((point, index) => {
      satisfyConstraint(previous, point, letter.segmentLength, 1);
      point.y = Math.max(letter.anchorY + 6 + index * 6, point.y);
      previous = point;
    });

    satisfyConstraint(previous, letter.bob, letter.segmentLength, 1);
    const lastRopePoint = letter.ropePoints[letter.ropePoints.length - 1];
    letter.bob.y = Math.max((lastRopePoint ? lastRopePoint.y : letter.anchorY) + 18, letter.bob.y);
  }
}

function simulate(subDt, now) {
  const active = pointerIsActive(now);
  const settleFactor = active ? 1 : CONFIG.settleBoost;
  const idleScale = active ? 1 : CONFIG.idleRestFactor;

  letters.forEach((letter) => {
    if (letter.isSpace) {
      return;
    }

    const idleAngle = now * CONFIG.idleSwingFrequency + letter.phase;
    const idleSwing = Math.sin(idleAngle) * CONFIG.idleSwingForce * idleScale;
    const idleLift = Math.cos(idleAngle * 2) * CONFIG.idleSwingForce * 0.02 * idleScale;

    letter.ropePoints.forEach((point, index) => {
      const gravityScale = 0.2 + index * 0.055;
      integratePoint(point, subDt, gravityScale);
      const tailProgress =
        letter.ropePoints.length <= 1 ? 0 : index / (letter.ropePoints.length - 1);
      const tailDamping = 1 - tailProgress * 0.14;
      point.x = point.oldX + (point.x - point.oldX) * tailDamping;
      point.y = point.oldY + (point.y - point.oldY) * tailDamping;
    });
    integratePoint(letter.bob, subDt, 0.86);

    letter.ropePoints.forEach((point, index) => {
      const swayWeight = 0.055 + index * 0.024;
      point.x += idleSwing * swayWeight * subDt;
      point.y -= Math.abs(idleLift) * swayWeight * 0.12 * subDt;
    });
    letter.bob.x += idleSwing * 0.46 * subDt;
    letter.bob.y -= Math.abs(idleLift) * 0.1 * subDt;

    letter.ropePoints.forEach((point, index) => {
      const radius = CONFIG.pointerRadius * (0.55 + index * 0.08);
      const tailProgress =
        letter.ropePoints.length <= 1 ? 0 : index / (letter.ropePoints.length - 1);
      const push = CONFIG.pointerPush * (0.3 + index * 0.07) * (1 - tailProgress * 0.18);
      applyPointerToPoint(point, radius, push, subDt);
    });
    applyPointerToPoint(letter.bob, CONFIG.pointerRadius, CONFIG.pointerPush, subDt);
    applyPointerToString(letter, subDt);

    // Bias settling toward the upper rope so the system feels suspended
    // from the top rather than pinned at both ends.
    letter.ropePoints.forEach((point, index) => {
      const strength = CONFIG.midReturnStrength * (1 - index * 0.08);
      applyReturnForce(point, strength, settleFactor, { x: true, y: true });
    });
    applyReturnForce(letter.bob, CONFIG.returnStrength, settleFactor, { x: true, y: true });

    constrainLetter(letter);
    updateLetterTilt(letter);

  });
}

function updateLetterTilt(letter) {
  const lastRopePoint = letter.ropePoints[letter.ropePoints.length - 1];
  const targetTilt = clamp(
    (letter.bob.x - (lastRopePoint ? lastRopePoint.x : letter.anchorX)) /
      Math.max(1, letter.segmentLength * 1.8),
    -0.14,
    0.14
  );

  letter.displayTilt += (targetTilt - letter.displayTilt) * CONFIG.letterTiltResponse;
  letter.displayTilt *= CONFIG.letterTiltDamping;

  if (Math.abs(letter.displayTilt) < 0.0015) {
    letter.displayTilt = 0;
  }
}

function snapToRestIfSettled(letter) {
  const ropeSettled = letter.ropePoints.every((point) => {
    const dx = point.x - point.restX;
    const dy = point.y - point.restY;
    const speed = Math.hypot(point.x - point.oldX, point.y - point.oldY);
    return Math.hypot(dx, dy) < 0.7 && speed < 0.12;
  });
  const bobDx = letter.bob.x - letter.bob.restX;
  const bobDy = letter.bob.y - letter.bob.restY;
  const bobSpeed = Math.hypot(letter.bob.x - letter.bob.oldX, letter.bob.y - letter.bob.oldY);

  if (
    ropeSettled &&
    Math.hypot(bobDx, bobDy) < 0.9 &&
    bobSpeed < 0.14
  ) {
    letter.ropePoints.forEach((point) => {
      positionPoint(point, point.restX, point.restY);
    });
    positionPoint(letter.bob, letter.bob.restX, letter.bob.restY);
  }
}

function drawAmbient() {
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.18,
    0,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.55
  );
  gradient.addColorStop(0, "rgba(255,255,255,0.24)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawLetter(letter) {
  const ropePath = [
    { x: letter.anchorX, y: letter.anchorY },
    ...letter.ropePoints.map((point) => ({ x: point.x, y: point.y })),
  ];
  const glyphOffsetY = letter.fontSize * 0.34;

  ctx.save();
  ctx.lineWidth = CONFIG.stringWidth;
  ctx.strokeStyle = "rgba(101, 92, 80, 0.34)";
  drawSmoothRope(ropePath, { x: letter.bob.x, y: letter.bob.y });

  ctx.fillStyle = "rgba(24, 22, 20, 0.98)";
  ctx.font = `400 ${letter.fontSize}px "Cardo", "Iowan Old Style", "Palatino Linotype", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(letter.bob.x, letter.bob.y + glyphOffsetY);
  ctx.rotate(letter.displayTilt);
  ctx.fillText(letter.char, 0, 0);
  ctx.restore();
}

function drawSmoothRope(points, endPoint) {
  if (points.length < 2) {
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
    return;
  }

  for (let i = 1; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = current.x;
    const controlY = current.y;
    const midX = (current.x + next.x) * 0.5;
    const midY = (current.y + next.y) * 0.5;
    ctx.quadraticCurveTo(controlX, controlY, midX, midY);
  }

  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.stroke();
}

function render() {
  ctx.clearRect(0, 0, width, height);
  drawAmbient();

  letters.forEach((letter) => {
    if (!letter.isSpace) {
      drawLetter(letter);
    }
  });
}

function step(now) {
  const frameDt = clamp((now - lastFrame) / 1000, 1 / 240, 1 / 24);
  lastFrame = now;
  accumulator += frameDt;

  const fixedDt = 1 / 120;
  while (accumulator >= fixedDt) {
    for (let i = 0; i < CONFIG.substeps; i += 1) {
      simulate(fixedDt / CONFIG.substeps, now);
    }
    accumulator -= fixedDt;
  }

  render();
  requestAnimationFrame(step);
}

function updatePointer(clientX, clientY) {
  pointer.vx = clientX - pointer.lastX;
  pointer.vy = clientY - pointer.lastY;
  pointer.x = clientX;
  pointer.y = clientY;
  pointer.lastX = clientX;
  pointer.lastY = clientY;
  pointer.movedAt = performance.now();
  pointer.inside = true;

  if (supportsFinePointer && customCursor) {
    customCursor.style.transform = `translate(${clientX - 6}px, ${clientY - 6}px)`;
    customCursor.classList.add("is-visible");
  }
}

function releasePointer() {
  pointer.inside = false;
  pointer.vx = 0;
  pointer.vy = 0;
  pointer.lastX = pointer.x;
  pointer.lastY = pointer.y;
  pointer.movedAt = performance.now();

  if (customCursor) {
    customCursor.classList.remove("is-visible");
  }
}

function setupSectionNav() {
  if (!navRail) {
    return;
  }

  const sections = [...document.querySelectorAll("[data-section][id]")];

  if (!sections.length) {
    navRail.hidden = true;
    return;
  }

  const links = sections.map((section, index) => {
    const label =
      section.dataset.navLabel ||
      section.getAttribute("aria-label") ||
      `Section ${index + 1}`;
    const link = document.createElement("a");
    link.className = "section-nav__link";
    link.href = `#${section.id}`;
    link.textContent = label;
    navRail.appendChild(link);
    return link;
  });

  function setActiveSection(sectionId) {
    links.forEach((link) => {
      const active = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle("is-active", active);
      link.setAttribute("aria-current", active ? "page" : "false");
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries[0]) {
        setActiveSection(visibleEntries[0].target.id);
      }
    },
    {
      threshold: [0.35, 0.6, 0.85],
      rootMargin: "-20% 0px -28% 0px",
    }
  );

  sections.forEach((section) => observer.observe(section));
  setActiveSection(sections[0].id);
}

window.addEventListener("pointermove", (event) => {
  updatePointer(event.clientX, event.clientY);
});

window.addEventListener("pointerdown", (event) => {
  updatePointer(event.clientX, event.clientY);
});

window.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    updatePointer(touch.clientX, touch.clientY);
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    updatePointer(touch.clientX, touch.clientY);
  },
  { passive: true }
);

window.addEventListener("pointerleave", releasePointer);
window.addEventListener("pointercancel", releasePointer);
window.addEventListener("blur", releasePointer);
document.addEventListener("mouseleave", releasePointer);
window.addEventListener("resize", updateCanvasSize);
window.addEventListener("resize", positionExperienceTimelineCards);

renderExperienceTimeline();
makeLetters();
setupSectionNav();
updateCanvasSize();
requestAnimationFrame((time) => {
  lastFrame = time;
  requestAnimationFrame(step);
});
