import { useEffect, useState } from 'react';
import { parseEncyclopediaSnapshot } from '../encyclopedia-data.js';

/** Static, deployment-refreshed public evidence only. Never fetch private data or credentials. */
export default function useEncyclopediaSnapshot(baseUrl) {
  const [snapshot, setSnapshot] = useState({
    repositories:[],generatedAt:null,complete:false,status:'Loading public source dossiers…',
  });
  useEffect(() => {
    let cancelled = false;
    fetch(baseUrl + 'encyclopedia.json', { cache:'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Public encyclopedia snapshot unavailable');
        return parseEncyclopediaSnapshot(await response.json());
      }).then(data => {
        if (cancelled) return;
        setSnapshot({
          ...data,
          status:data.repositories.length
            ? (data.complete ? 'Public-owner inventory from the last deployment' : 'Partial public-owner fallback inventory')
            : 'No public source dossiers in this build yet',
        });
      }).catch(() => {
        if (!cancelled) setSnapshot(previous => ({
          ...previous,status:'Public source index unavailable; live book chapters are unaffected.',
        }));
      });
    return () => { cancelled = true; };
  },[baseUrl]);
  return snapshot;
}
