import { useEffect, useRef, useState } from 'react';
import { uniqueMerge, newArrivals } from '../catalog.js';
import { parseAtlasManifest } from '../atlas-manifest.js';

/**
 * Fetch the trusted deployment inventory once per mount.
 * The latest committed local pages are used when the request completes, rather
 * than relying on a stale first-render closure.
 */
export default function useAtlasManifest({ pages, setDiscovery, baseUrl }) {
  const [publishedPages, setPublishedPages] = useState([]);
  const [manifestStatus, setManifestStatus] = useState('');
  const pagesRef = useRef(pages);
  useEffect(() => { pagesRef.current = pages; }, [pages]);

  useEffect(() => {
    let cancelled = false;
    fetch(baseUrl + 'pages-discovered.json', { cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error('No refreshed public catalog yet');
      return parseAtlasManifest(await response.json());
    }).then(valid => {
      if (cancelled) return;
      setPublishedPages(valid);
      setManifestStatus(valid.length + ' verified public websites in the latest atlas inventory.');
      setDiscovery(previous => ({
        ...previous,
        candidates: newArrivals(
          previous.candidates,
          uniqueMerge(pagesRef.current, valid),
          previous.dismissedIds
        ),
      }));
    }).catch(() => {
      if (!cancelled) setManifestStatus('Showing the curated collection. Live inventory will refresh when the next deployment completes.');
    });
    return () => { cancelled = true; };
  }, [baseUrl, setDiscovery]);

  return { publishedPages, manifestStatus };
}
