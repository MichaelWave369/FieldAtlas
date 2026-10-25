/** Reviewed, source-only R17.4 collaboration entry; never invent a deployed Pages URL. */
export const XI_COMMONS_SOURCE_ENTRY = Object.freeze({
  id: 'atlas.public.xi-phi-commons',
  title: 'Ξ ⇄ Φ · Sovereign Commons Gateway',
  repository: 'xi-vessel-bridge',
  category: 'Systems',
  status: 'PUBLIC_SOURCE_ONLY',
  sourceUrl: 'https://github.com/MichaelWave369/xi-vessel-bridge',
  docsUrl: 'https://github.com/MichaelWave369/xi-vessel-bridge/blob/main/docs/XI_COMMONS_GATEWAY_R173.md',
  liveXiConnected: false,
  externalPilot: 'BLOCKED',
  twoHostTest: 'NOT_RUN',
  websiteVerified: false,
  authorized: false,
  note: 'Public engineering reference. This is not a deployed web chapter, iframe, installed app, or live federation.'
});
export function reviewedXiCommonsSourceEntry() {
  const entry = XI_COMMONS_SOURCE_ENTRY;
  if(entry.status!=='PUBLIC_SOURCE_ONLY' || entry.authorized!==false ||
     entry.websiteVerified!==false || entry.liveXiConnected!==false ||
     entry.externalPilot!=='BLOCKED' || entry.twoHostTest!=='NOT_RUN') {
    throw new Error('Xi source-only entry cannot promote authority');
  }
  return entry;
}
