const API_BASE = "http://localhost:5000";

const keyInput = document.getElementById("keyInput");
const valueInput = document.getElementById("valueInput");
const capacityInput = document.getElementById("capacityInput");

const getBtn = document.getElementById("getBtn");
const putBtn = document.getElementById("putBtn");
const setCapacityBtn = document.getElementById("setCapacityBtn");

const statusText = document.getElementById("statusText");
const cacheDiv = document.getElementById("cache");

let lastCacheState = [];

/**
 * FLIP animation renderer
 * This shows REAL movement paths
 */
function renderCache(newState) {
  const existingNodes = Array.from(cacheDiv.children);
  const firstPositions = new Map();

  // 1️⃣ FIRST — capture old positions
  existingNodes.forEach(node => {
    firstPositions.set(node.dataset.key, node.getBoundingClientRect());
  });

  // 2️⃣ Update DOM order (LRU → MRU)
  cacheDiv.innerHTML = "";
  newState.forEach((item, index) => {
    let div = existingNodes.find(n => n.dataset.key === item.key);

    if (!div) {
      div = document.createElement("div");
      div.className = "cache-item";
      div.dataset.key = item.key;
      div.innerHTML = `<strong>${item.key}</strong><br/>${item.value.value}`;
    }

    if (index === 0) div.classList.add("mru");
    else div.classList.remove("mru");

    cacheDiv.appendChild(div);
  });

  // 3️⃣ LAST — capture new positions
  const newNodes = Array.from(cacheDiv.children);
  newNodes.forEach(node => {
    const first = firstPositions.get(node.dataset.key);
    const last = node.getBoundingClientRect();

    if (!first) {
      // New item: come from LEFT
      node.style.transform = `translateX(-160px)`;
      node.style.opacity = "0";
      requestAnimationFrame(() => {
        node.style.transition = "transform 0.6s ease, opacity 0.4s ease";
        node.style.transform = "translateX(0)";
        node.style.opacity = "1";
      });
      return;
    }

    // 4️⃣ INVERT — calculate delta
    const dx = first.left - last.left;
    const dy = first.top - last.top;

    node.style.transform = `translate(${dx}px, ${dy}px)`;
    node.style.transition = "none";

    // 5️⃣ PLAY — animate to new position
    requestAnimationFrame(() => {
      node.style.transition = "transform 0.6s ease";
      node.style.transform = "translate(0, 0)";
    });
  });

  lastCacheState = newState;
}

// Fetch cache
async function fetchCacheState() {
  const res = await fetch(`${API_BASE}/cache/state`);
  const data = await res.json();
  renderCache(data.state);
}

// GET
getBtn.addEventListener("click", async () => {
  const key = keyInput.value.trim();
  if (!key) return;

  statusText.textContent = "Fetching...";
  statusText.className = "";

  const res = await fetch(`${API_BASE}/api/data/${key}`);
  const data = await res.json();

  statusText.textContent = data.cacheHit
    ? `Cache HIT ⚡ (${data.responseTimeMs} ms)`
    : `Cache MISS 🐢 (${data.responseTimeMs} ms)`;

  statusText.className = data.cacheHit ? "cache-hit" : "cache-miss";
  fetchCacheState();
});

// PUT
putBtn.addEventListener("click", async () => {
  const key = keyInput.value.trim();
  if (!key) return;

  await fetch(`${API_BASE}/api/data/${key}`);
  statusText.textContent = `PUT completed for "${key}"`;
  fetchCacheState();
});

// Set capacity
setCapacityBtn.addEventListener("click", async () => {
  const capacity = Number(capacityInput.value);
  if (!capacity) return;

  await fetch(`${API_BASE}/cache/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ capacity })
  });

  statusText.textContent = `Cache capacity set to ${capacity}`;
  fetchCacheState();
});

// Initial load
fetchCacheState();
