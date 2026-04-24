const desktop = document.getElementById("desktop");
const windows = [...document.querySelectorAll(".window")];
const toast = document.getElementById("toast");
const cursorGlow = document.querySelector(".cursor-glow");
const shuffleButton = document.getElementById("shuffle-button");
const partyButton = document.getElementById("party-button");
const resetButton = document.getElementById("reset-button");
const secretButton = document.getElementById("secret-trigger");
const navButtons = [...document.querySelectorAll("[data-focus]")];
const contactPlaceholders = [...document.querySelectorAll("[data-placeholder]")];

let topZ = 20;
let partyMode = false;
let toastTimer;

function isDesktopLayout() {
  return window.innerWidth > 900;
}

function bringToFront(element) {
  topZ += 1;
  element.style.zIndex = topZ;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function setInitialFloatingLayout() {
  if (!isDesktopLayout()) {
    windows.forEach((win) => {
      win.classList.remove("is-floating");
      win.style.left = "";
      win.style.top = "";
      win.style.zIndex = "";
    });
    return;
  }

  const positions = [
    { left: window.innerWidth - 700, top: 145 },
    { left: 410, top: 390 },
    { left: window.innerWidth - 540, top: 545 },
    { left: 118, top: 980 },
    { left: 375, top: 1135 },
    { left: window.innerWidth - 585, top: 1505 },
  ];

  windows.forEach((win, index) => {
    const fallback = positions[index];
    win.classList.add("is-floating");
    win.style.left = `${fallback.left}px`;
    win.style.top = `${fallback.top}px`;
  });

  windows.forEach((win, index) => {
    if (index !== 0) {
      bringToFront(win);
    }
  });

  bringToFront(windows[0]);

  const lastWindow = windows[windows.length - 1];
  desktop.style.minHeight = `${lastWindow.offsetTop + lastWindow.offsetHeight + 280}px`;
}

function clampWindow(win, proposedLeft, proposedTop) {
  const maxLeft = Math.max(16, window.innerWidth - win.offsetWidth - 16);
  const maxTop = Math.max(140, desktop.offsetHeight - win.offsetHeight - 120);

  return {
    left: Math.min(Math.max(16, proposedLeft), maxLeft),
    top: Math.min(Math.max(110, proposedTop), maxTop),
  };
}

function shuffleWindows() {
  if (!isDesktopLayout()) {
    showToast("Shuffle is sleeping on mobile.");
    return;
  }

  windows.forEach((win) => {
    const left = Math.random() * (window.innerWidth - win.offsetWidth - 40) + 16;
    const top = Math.random() * (desktop.offsetHeight - win.offsetHeight - 220) + 120;
    const next = clampWindow(win, left, top);

    win.classList.add("glitch");
    win.style.left = `${next.left}px`;
    win.style.top = `${next.top}px`;
    bringToFront(win);
    window.setTimeout(() => win.classList.remove("glitch"), 700);
  });

  showToast("Windows reshuffled. Chaos level upgraded.");
}

function wireDraggables() {
  windows.forEach((win) => {
    const bar = win.querySelector(".window-bar");
    let startX = 0;
    let startY = 0;
    let originLeft = 0;
    let originTop = 0;
    let dragging = false;

    function onPointerMove(event) {
      if (!dragging) {
        return;
      }

      const nextLeft = originLeft + (event.clientX - startX);
      const nextTop = originTop + (event.clientY - startY);
      const clamped = clampWindow(win, nextLeft, nextTop);
      win.style.left = `${clamped.left}px`;
      win.style.top = `${clamped.top}px`;
    }

    function onPointerUp() {
      dragging = false;
      win.classList.remove("dragging");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }

    bar.addEventListener("pointerdown", (event) => {
      if (!isDesktopLayout()) {
        return;
      }

      if (event.target.closest("button, a, input, textarea")) {
        return;
      }

      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      originLeft = win.offsetLeft;
      originTop = win.offsetTop;
      bringToFront(win);
      win.classList.add("dragging");
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    });

    win.addEventListener("pointerdown", () => {
      if (isDesktopLayout()) {
        bringToFront(win);
      }
    });
  });
}

function focusWindow(name) {
  const target = document.querySelector(`[data-window="${name}"]`);
  if (!target) {
    return;
  }

  if (isDesktopLayout()) {
    bringToFront(target);
    target.classList.add("glitch");
    window.setTimeout(() => target.classList.remove("glitch"), 650);
  }

  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

function moveCursorGlow(event) {
  if (!cursorGlow || !isDesktopLayout()) {
    return;
  }

  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
}

function resetLayout() {
  partyMode = false;
  document.body.classList.remove("party-mode");
  partyButton.textContent = "party mode";
  setInitialFloatingLayout();
  showToast("Layout reset. The playground has been re-centered.");
}

function togglePartyMode() {
  partyMode = !partyMode;
  document.body.classList.toggle("party-mode", partyMode);
  partyButton.textContent = partyMode ? "calm mode" : "party mode";

  windows.forEach((win, index) => {
    const rotation = partyMode ? (index % 2 === 0 ? 1.5 : -1.5) : 0;
    win.style.transform = `rotate(${rotation}deg)`;
  });

  showToast(
    partyMode
      ? "Party mode enabled. Professionalism reduced by 13%."
      : "Party mode disabled. We are pretending to be normal again."
  );
}

shuffleButton.addEventListener("click", shuffleWindows);
partyButton.addEventListener("click", togglePartyMode);
resetButton.addEventListener("click", resetLayout);
secretButton.addEventListener("click", () => {
  document.body.classList.add("party-mode");
  windows.forEach((win) => {
    win.classList.add("glitch");
    window.setTimeout(() => win.classList.remove("glitch"), 700);
  });
  showToast("You pressed it. The website is judging you affectionately.");
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    focusWindow(button.dataset.focus);
  });
});

contactPlaceholders.forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.dataset.placeholder;

    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied placeholder: ${text}`);
    } catch {
      showToast(text);
    }
  });
});

window.addEventListener("pointermove", moveCursorGlow);
window.addEventListener("resize", setInitialFloatingLayout);

wireDraggables();
setInitialFloatingLayout();
