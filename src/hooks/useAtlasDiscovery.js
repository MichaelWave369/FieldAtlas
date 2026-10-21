import { useEffect, useRef, useState } from 'react';
import { discoverGithubPages, newArrivals, shouldAutoDiscover, uniqueMerge } from '../catalog.js';
import { DISCOVERY_KEY, normalizeDiscovery, approveArrival, dismissArrival } from '../discovery-state.js';

function readDiscovery() {
  try { return normalizeDiscovery(JSON.parse(localStorage.getItem(DISCOVERY_KEY) || 'null')); }
  catch { return normalizeDiscovery(); }
}

/**
 * Read-only public discovery with browser-local approvals, dismissals and opt-out.
 * catalogRef resolves the current catalog after an asynchronous GitHub scan.
 */
export default function useAtlasDiscovery({ catalogRef, setPages }) {
  const [discovery, setDiscovery] = useState(readDiscovery);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncing, setSyncing] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const latestDiscovery = useRef(discovery);
  latestDiscovery.current = discovery;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => { localStorage.setItem(DISCOVERY_KEY, JSON.stringify(discovery)); }, [discovery]);

  async function scanLibrary(background = false) {
    if (inFlight.current) return;
    inFlight.current = true;
    setSyncing(true);
    if (!background) setSyncStatus('Checking public GitHub Pages for new arrivals…');
    try {
      const discovered = await discoverGithubPages();
      if (!mounted.current) return;
      const currentCatalog = catalogRef.current;
      const currentDiscovery = latestDiscovery.current;
      const candidates = newArrivals(discovered, currentCatalog, currentDiscovery.dismissedIds);
      setDiscovery(previous => ({
        ...previous,
        candidates: newArrivals(discovered, catalogRef.current, previous.dismissedIds),
        lastCheckedAt: Date.now(),
      }));
      setSyncStatus('Found ' + discovered.length + ' Pages-enabled public repositories; ' +
        candidates.length + ' await approval. GitHub Pages status does not guarantee a working live site.');
    } catch (error) {
      if (mounted.current) setSyncStatus(error?.message || 'Could not reach GitHub right now.');
    } finally {
      inFlight.current = false;
      if (mounted.current) setSyncing(false);
    }
  }

  // One opt-in read-only scan after mount at most once per refresh interval.
  useEffect(() => {
    if (latestDiscovery.current.autoEnabled &&
        shouldAutoDiscover(latestDiscovery.current.lastCheckedAt)) void scanLibrary(true);
    // Scan is intentionally scoped to initial browser load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function approveCandidate(id) {
    const result = approveArrival(latestDiscovery.current, id, []);
    if (!result) return false;
    setPages(previous => uniqueMerge(previous, [result.pages[0]]));
    setDiscovery(previous => ({
      ...previous,
      candidates: previous.candidates.filter(page => page.id !== id),
    }));
    return true;
  }

  function dismissCandidate(id) {
    setDiscovery(previous => dismissArrival(previous, id));
  }

  return { discovery, setDiscovery, syncStatus, syncing, scanLibrary, approveCandidate, dismissCandidate };
}
