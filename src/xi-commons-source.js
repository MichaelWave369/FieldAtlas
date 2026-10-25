/** R17.6: public STATIC website proven by R17.5 deploy+verify, not a Xi peer. */
export const XI_COMMONS_SOURCE_ENTRY = Object.freeze({
  id: 'atlas.public.xi-phi-commons',
  title: 'Ξ ⇄ Φ · Sovereign Commons Gateway',
  repository: 'xi-vessel-bridge',
  category: 'Systems',
  status: 'PUBLIC_STATIC_WEBSITE_VERIFIED',
  sourceUrl: 'https://github.com/MichaelWave369/xi-vessel-bridge',
  websiteUrl: 'https://michaelwave369.github.io/xi-vessel-bridge/',
  verificationRunUrl: 'https://github.com/MichaelWave369/xi-vessel-bridge/actions/runs/40243474173',
  manifestSha256: 'a85309f577e73d20b96fb1442f1f6d0628195805033b456fa81aa39fda9647f3',
  docsUrl: 'https://github.com/MichaelWave369/xi-vessel-bridge/blob/main/docs/XI_PAGES_LIVE_READINESS_R175.md',
  liveXiConnected: false,
  externalPilot: 'BLOCKED',
  twoHostTest: 'NOT_RUN',
  websiteVerified: true,
  authorized: false,
  note: 'Verified public static website and source fallback. This is not a confirmed Xi protocol, installed app, or live federation.'
});
export function reviewedXiCommonsSourceEntry() {
  const e = XI_COMMONS_SOURCE_ENTRY;
  if(e.status!=='PUBLIC_STATIC_WEBSITE_VERIFIED' || e.authorized!==false ||
     e.websiteVerified!==true ||
     e.websiteUrl!=='https://michaelwave369.github.io/xi-vessel-bridge/' ||
     e.sourceUrl!=='https://github.com/MichaelWave369/xi-vessel-bridge' ||
     e.verificationRunUrl!=='https://github.com/MichaelWave369/xi-vessel-bridge/actions/runs/40243474173' ||
     e.manifestSha256!=='a85309f577e73d20b96fb1442f1f6d0628195805033b456fa81aa39fda9647f3' ||
     e.liveXiConnected!==false || e.externalPilot!=='BLOCKED' || e.twoHostTest!=='NOT_RUN') {
    throw new Error('Unreviewed static Commons site or illicit Xi authority');
  }
  return e;
}
