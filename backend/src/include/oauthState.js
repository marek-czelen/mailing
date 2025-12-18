import crypto from "crypto";

const stateStore = new Map();
const STATE_TTL_MS = 5 * 60 * 1000; // 5 minut

function cleanup() {
  const now = Date.now();
  for (const [key, value] of stateStore.entries()) {
    if (now - value.createdAt > STATE_TTL_MS) {
      stateStore.delete(key);
    }
  }
}

export function createState({ provider, callback, customerId = null }) {
  cleanup();
  const state = crypto.randomBytes(16).toString('hex');
  stateStore.set(state, {
    provider,
    callback,
    customerId,
    createdAt: Date.now()
  });
  return state;
}

export function getState(state, expectedProvider) {
  cleanup();
  const entry = stateStore.get(state);
  if (!entry) return null;
  if (entry.provider !== expectedProvider) return null;
  return entry;
}

export function consumeState(state, expectedProvider) {
  cleanup();
  const entry = stateStore.get(state);
  if (!entry) return null;
  if (entry.provider !== expectedProvider) return null;
  stateStore.delete(state);
  return entry;
}

export default {
  createState,
  getState,
  consumeState
};
