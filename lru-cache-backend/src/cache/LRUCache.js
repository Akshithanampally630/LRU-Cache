const CacheNode = require("./CacheNode");

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();

    // Dummy head and tail
    this.head = new CacheNode(null, null);
    this.tail = new CacheNode(null, null);

    this.head.next = this.tail;
    this.tail.prev = this.head;

    // Metrics
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  _addNode(node) {
    // Always add right after head (MRU)
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _removeNode(node) {
    const prev = node.prev;
    const next = node.next;
    prev.next = next;
    next.prev = prev;
  }

  _moveToFront(node) {
    this._removeNode(node);
    this._addNode(node);
  }

  _popTail() {
    // Remove LRU node (before tail)
    const node = this.tail.prev;
    this._removeNode(node);
    return node;
  }

  get(key) {
    if (!this.map.has(key)) {
      this.misses++;
      return null;
    }

    const node = this.map.get(key);
    this._moveToFront(node);
    this.hits++;
    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      this._moveToFront(node);
      return;
    }

    const newNode = new CacheNode(key, value);
    this.map.set(key, newNode);
    this._addNode(newNode);

    if (this.map.size > this.capacity) {
      const lruNode = this._popTail();
      this.map.delete(lruNode.key);
      this.evictions++;
    }
  }

  getState() {
    const state = [];
    let current = this.head.next;
    while (current !== this.tail) {
      state.push({
        key: current.key,
        value: current.value
      });
      current = current.next;
    }
    return state;
  }

  getStats() {
    return {
      capacity: this.capacity,
      size: this.map.size,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRatio:
        this.hits + this.misses === 0
          ? 0
          : (this.hits / (this.hits + this.misses)).toFixed(2)
    };
  }

  clear() {
    this.map.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }
}

module.exports = LRUCache;
