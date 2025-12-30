function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchSlowData(key) {
  const randomDelay = Math.floor(Math.random() * 700) + 800; // 800–1500ms
  await delay(randomDelay);

  return {
    key,
    value: `Data for ${key}`,
    fetchedAt: new Date().toISOString()
  };
}

module.exports = fetchSlowData;
