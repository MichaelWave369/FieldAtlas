import { safeUrl, uniqueMerge } from './catalog.js';

/** Keep the existing v2 discovery state contract, including opt-out. */
export const DISCOVERY_KEY = 'field-atlas-discovery-v2';

export function normalizeDiscovery(value = {}) {
  const state = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    candidates: Array.isArray(state.candidates) ? state.candidates.filter(p => p && p.id && safeUrl(p.url)) : [],
    dismissedIds: Array.isArray(state.dismissedIds) ? state.dismissedIds : [],
    lastCheckedAt: Number(state.lastCheckedAt) || 0,
    autoEnabled: state.autoEnabled !== false,
    hiddenIds: Array.isArray(state.hiddenIds) ? state.hiddenIds : [],
  };
}

export function approveArrival(discovery, id, pages) {
  const selected = discovery.candidates.find(page => page.id === id);
  if (!selected) return null;
  return {
    pages: uniqueMerge(pages, [selected]),
    discovery: { ...discovery, candidates: discovery.candidates.filter(page => page.id !== id) },
  };
}

export function dismissArrival(discovery, id) {
  return {
    ...discovery,
    dismissedIds: [...new Set([...discovery.dismissedIds, id])],
    candidates: discovery.candidates.filter(page => page.id !== id),
  };
}
