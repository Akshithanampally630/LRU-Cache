// Import LRU Cache implementation
const LRUCache = require("./cache/LRUCache");
// Simulated slow data source
const fetchSlowData = require("./services/slowDataSource");
// Initialize LRU Cache with a capacity of 3
const cache = new LRUCache(3); // initial capacity
// Import dependencies
const express = require("express");
const cors = require("cors");
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
// Health check endpoint
app.get("/", (req, res) => {
  res.send("LRU Cache Backend is running 🚀");
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// API to fetch data with caching
app.get("/api/data/:key", async (req, res) => {
  const { key } = req.params;
  const startTime = Date.now();

  const cachedData = cache.get(key);

  if (cachedData) {
    const responseTime = Date.now() - startTime;
    return res.json({
      source: "cache",
      cacheHit: true,
      responseTimeMs: responseTime,
      data: cachedData
    });
  }

  const freshData = await fetchSlowData(key);
  cache.put(key, freshData);

  const responseTime = Date.now() - startTime;

  res.json({
    source: "slow-source",
    cacheHit: false,
    responseTimeMs: responseTime,
    data: freshData
  });
});
// Endpoint to get current cache state
app.get("/cache/state", (req, res) => {
  res.json({
    state: cache.getState() // MRU → LRU
  });
});
// Endpoint to get cache statistics
app.get("/cache/stats", (req, res) => {
  res.json(cache.getStats());
});
// Endpoint to update cache configuration
app.post("/cache/config", (req, res) => {
  const { capacity } = req.body;

  if (!capacity || capacity <= 0) {
    return res.status(400).json({ error: "Invalid capacity" });
  }

  cache.capacity = capacity;
  cache.clear();

  res.json({
    message: "Cache capacity updated",
    capacity
  });
});

// For testing purposes
// const LRUCache = require("./cache/LRUCache");

// const cache = new LRUCache(2);

// cache.put("a", 1);
// cache.put("b", 2);
// console.log(cache.getState()); // b, a

// cache.get("a");
// console.log(cache.getState()); // a, b

// cache.put("c", 3);
// console.log(cache.getState()); // c, a (b evicted)
