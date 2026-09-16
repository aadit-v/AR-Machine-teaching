/**
 * app.js
 * ------------------------------------------------------------------
 * 1) Merges DEFAULT_MACHINES (data.js) with any custom machines saved
 *    in localStorage by the admin panel, keyed by targetIndex.
 * 2) Listens for MindAR's targetFound/targetLost events on each
 *    <a-entity mindar-image-target> and shows/hides the guide panel.
 * 3) Runs the "⚙️" admin panel: add a new machine, add/edit/remove
 *    its control rows, delete a machine, export/import everything
 *    as JSON so guides can be backed up or shared between devices.
 */

const STORAGE_KEY = "ar_guide_custom_machines_v1";
const MAX_TARGETS = 10;

/* ---------------- data layer ---------------- */

function loadCustomMachines() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Could not read saved guides, starting fresh.", e);
    return [];
  }
}

function saveCustomMachines(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Merge defaults + custom into a single Map keyed by targetIndex.
 *  A custom entry with the same targetIndex as a default one wins
 *  (so you can override a built-in guide from the admin panel). */
function getMergedMachines() {
  const map = new Map();
  DEFAULT_MACHINES.forEach((m) => map.set(m.targetIndex, m));
  loadCustomMachines().forEach((m) => map.set(m.targetIndex, m));
  return map;
}

/* ---------------- AR: show/hide guide on marker recognition ---------------- */

const guidePanel = document.getElementById("guide-panel");
const guideTitle = document.getElementById("guide-title");
const guideBody = document.getElementById("guide-body");
const scanHint = document.getElementById("scan-hint");
const closeGuideBtn = document.getElementById("close-guide");
const addMoreBtn = document.getElementById("add-more-btn");

let currentTargetIndex = null;

function renderGuide(machine) {
  guideTitle.textContent = machine.name;
  guideBody.innerHTML = "";

  if (!machine.controls || machine.controls.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No instructions added yet for this machine.";
    guideBody.appendChild(empty);
    return;
  }

  machine.controls.forEach((c) => {
    const card = document.createElement("div");
    card.className = "control-card";
    const h4 = document.createElement("h4");
    h4.textContent = c.label;
    const p = document.createElement("p");
    p.textContent = c.description;
    card.appendChild(h4);
    card.appendChild(p);
    guideBody.appendChild(card);
  });
}

function showGuideFor(targetIndex) {
  const machines = getMergedMachines();
  const machine = machines.get(targetIndex) || {
    targetIndex,
    name: `Unrecognized marker (target ${targetIndex})`,
    controls: []
  };
  currentTargetIndex = targetIndex;
  renderGuide(machine);
  guidePanel.classList.remove("hidden");
  scanHint.style.opacity = "0";
}

function hideGuide() {
  guidePanel.classList.add("hidden");
  scanHint.style.opacity = "1";
}

closeGuideBtn.addEventListener("click", hideGuide);

addMoreBtn.addEventListener("click", () => {
  openAdmin(currentTargetIndex);
});

function showLoadingError(message) {
  const loadingText = document.getElementById("loading-text");
  const retryBtn = document.getElementById("loading-retry");
  const spinner = document.querySelector("#loading-screen .spinner");
  if (spinner) spinner.style.display = "none";
  loadingText.textContent = message;
  retryBtn.classList.remove("hidden");
  retryBtn.onclick = () => window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  const scene = document.querySelector("#ar-scene");
  let started = false;

  for (let i = 0; i < MAX_TARGETS; i++) {
    const el = document.getElementById(`target-${i}`);
    if (!el) continue;
    el.addEventListener("targetFound", () => showGuideFor(i));
    el.addEventListener("targetLost", () => {
      // Only hide if the panel is currently showing THIS target,
      // so a quick hand-shake between two markers doesn't flicker.
      if (currentTargetIndex === i) hideGuide();
    });
  }

  scene.addEventListener("renderstart", () => {
    started = true;
    document.getElementById("loading-screen").style.display = "none";
  });

  // MindAR failures (missing/bad targets.mind, camera permission
  // denied, no HTTPS, unsupported browser, etc.) fire this instead
  // of ever reaching renderstart — surface it rather than hanging.
  scene.addEventListener("arError", (e) => {
    console.error("MindAR error:", e.detail);
    showLoadingError(
      "Couldn't start the camera. Check camera permission, that the site is served over HTTPS, and that targets.mind exists next to index.html."
    );
  });

  // Some failures (e.g. a missing targets.mind file) throw before any
  // MindAR event fires at all, so also fall back on a timeout.
  setTimeout(() => {
    if (!started) {
      showLoadingError(
        "Still not started after 10s — most likely targets.mind is missing/invalid, the page isn't on HTTPS/localhost, or camera permission was blocked. Check the browser console for the exact error."
      );
    }
  }, 10000);

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showLoadingError(
      "This browser can't access the camera here — usually means the page isn't loaded over HTTPS (or localhost)."
    );
  }
});

/* ---------------- Admin panel ---------------- */

const adminToggle = document.getElementById("admin-toggle");
const adminPanel = document.getElementById("admin-panel");
const closeAdminBtn = document.getElementById("close-admin");
const machineSelect = document.getElementById("machine-select");
const newMachineFields = document.getElementById("new-machine-fields");
const newTargetIndexInput = document.getElementById("new-target-index");
const newMachineNameInput = document.getElementById("new-machine-name");
const controlsList = document.getElementById("controls-list");
const addControlRowBtn = document.getElementById("add-control-row");
const saveMachineBtn = document.getElementById("save-machine");
const deleteMachineBtn = document.getElementById("delete-machine");
const exportBtn = document.getElementById("export-json");
const importInput = document.getElementById("import-json");

function populateMachineSelect() {
  const machines = getMergedMachines();
  machineSelect.innerHTML = '<option value="__new__">+ New machine…</option>';
  [...machines.values()]
    .sort((a, b) => a.targetIndex - b.targetIndex)
    .forEach((m) => {
      const opt = document.createElement("option");
      opt.value = String(m.targetIndex);
      opt.textContent = `#${m.targetIndex} — ${m.name}`;
      machineSelect.appendChild(opt);
    });
}

function addControlRow(label = "", description = "") {
  const row = document.createElement("div");
  row.className = "control-row";
  row.innerHTML = `
    <button class="remove-row" title="Remove">✕</button>
    <input type="text" class="control-label" placeholder="Button/knob name (e.g. Bass)" value="${escapeAttr(label)}" />
    <textarea class="control-desc" placeholder="What it does…">${escapeHtml(description)}</textarea>
  `;
  row.querySelector(".remove-row").addEventListener("click", () => row.remove());
  controlsList.appendChild(row);
}

function clearControlsList() {
  controlsList.innerHTML = "";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}
function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

function openAdmin(targetIndexToEdit = null) {
  populateMachineSelect();
  if (targetIndexToEdit !== null && targetIndexToEdit !== undefined) {
    machineSelect.value = String(targetIndexToEdit);
  } else {
    machineSelect.value = "__new__";
  }
  machineSelect.dispatchEvent(new Event("change"));
  adminPanel.classList.remove("hidden");
}

function closeAdmin() {
  adminPanel.classList.add("hidden");
}

adminToggle.addEventListener("click", () => openAdmin());
closeAdminBtn.addEventListener("click", closeAdmin);

machineSelect.addEventListener("change", () => {
  clearControlsList();
  if (machineSelect.value === "__new__") {
    newMachineFields.classList.remove("hidden");
    newTargetIndexInput.value = "";
    newMachineNameInput.value = "";
    deleteMachineBtn.classList.add("hidden");
    addControlRow(); // start with one blank row
  } else {
    newMachineFields.classList.add("hidden");
    deleteMachineBtn.classList.remove("hidden");
    const machines = getMergedMachines();
    const machine = machines.get(Number(machineSelect.value));
    if (machine) {
      (machine.controls || []).forEach((c) => addControlRow(c.label, c.description));
      if (!machine.controls || machine.controls.length === 0) addControlRow();
    }
  }
});

addControlRowBtn.addEventListener("click", () => addControlRow());

saveMachineBtn.addEventListener("click", () => {
  let targetIndex, name;

  if (machineSelect.value === "__new__") {
    targetIndex = Number(newTargetIndexInput.value);
    name = newMachineNameInput.value.trim();

    if (Number.isNaN(targetIndex) || targetIndex < 0 || targetIndex > 9) {
      alert("Please enter a target index between 0 and 9 (matching a compiled marker).");
      return;
    }
    if (!name) {
      alert("Please give the machine a name.");
      return;
    }
  } else {
    targetIndex = Number(machineSelect.value);
    const machines = getMergedMachines();
    name = machines.get(targetIndex)?.name || `Machine ${targetIndex}`;
  }

  const controls = [...controlsList.querySelectorAll(".control-row")]
    .map((row) => ({
      label: row.querySelector(".control-label").value.trim(),
      description: row.querySelector(".control-desc").value.trim()
    }))
    .filter((c) => c.label || c.description);

  const custom = loadCustomMachines();
  const idx = custom.findIndex((m) => m.targetIndex === targetIndex);
  const entry = { targetIndex, id: `custom-${targetIndex}`, name, controls };

  if (idx >= 0) custom[idx] = entry;
  else custom.push(entry);

  saveCustomMachines(custom);
  populateMachineSelect();
  machineSelect.value = String(targetIndex);
  alert("Saved. Point the camera at that marker to see it.");
});

deleteMachineBtn.addEventListener("click", () => {
  if (machineSelect.value === "__new__") return;
  const targetIndex = Number(machineSelect.value);
  if (!confirm("Delete this custom machine's saved guide? (Built-in defaults reappear if any.)")) return;

  const custom = loadCustomMachines().filter((m) => m.targetIndex !== targetIndex);
  saveCustomMachines(custom);
  populateMachineSelect();
  machineSelect.value = "__new__";
  machineSelect.dispatchEvent(new Event("change"));
});

/* ---------------- Import / export ---------------- */

exportBtn.addEventListener("click", () => {
  const machines = [...getMergedMachines().values()].sort((a, b) => a.targetIndex - b.targetIndex);
  const blob = new Blob([JSON.stringify(machines, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "machine-guides.json";
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Expected a JSON array of machines.");
      const custom = loadCustomMachines();
      imported.forEach((m) => {
        if (typeof m.targetIndex !== "number") return;
        const idx = custom.findIndex((c) => c.targetIndex === m.targetIndex);
        if (idx >= 0) custom[idx] = m;
        else custom.push(m);
      });
      saveCustomMachines(custom);
      populateMachineSelect();
      alert("Import complete.");
    } catch (err) {
      alert("Could not import that file: " + err.message);
    }
  };
  reader.readAsText(file);
  importInput.value = "";
});
