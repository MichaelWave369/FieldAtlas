import { useEffect, useRef, useState } from 'react';
import { mergePassportBackup } from '../passport-transfer.js';
import { PASSPORT_KEY, normalizePassportIds, markChapterVisited } from '../passport-storage.js';

/** Preserve the visitor's v6 local-only passport across architecture changes. */
export default function useAtlasPassport(activeId) {
  const [visitedChapters, setVisitedChapters] = useState(() => {
    try {
      return normalizePassportIds(JSON.parse(localStorage.getItem(PASSPORT_KEY) || 'null'));
    } catch {
      return [];
    }
  });
  const latestVisits = useRef(visitedChapters);
  latestVisits.current = visitedChapters;

  useEffect(() => {
    localStorage.setItem(PASSPORT_KEY, JSON.stringify(visitedChapters));
  }, [visitedChapters]);

  useEffect(() => {
    if (activeId) {
      setVisitedChapters(previous => previous.includes(activeId)
        ? previous : markChapterVisited(previous, activeId));
    }
  }, [activeId]);

  function importVisitedChapters(imported, catalog) {
    const result = mergePassportBackup(latestVisits.current, imported, catalog);
    latestVisits.current = result.visitedIds;
    setVisitedChapters(result.visitedIds);
    return result;
  }

  return { visitedChapters, importVisitedChapters };
}
