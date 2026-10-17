/**
 * Explicit public pairing with Future Archive's original 18 prints.
 * Keep this small and reviewed. The Archive is independently deployed and its
 * artwork isn't copied or fetched into the Atlas.
 */
export const FUTURE_ARCHIVE_URL = 'https://michaelwave369.github.io/FutureArchive/';
export const archivePrintByRepo = Object.freeze({
  'infinite-porch': '01',
  'infinite-commons': '02',
  'superphivessel': '03',
  'nestedbubblegear': '04',
  'domistika': '05',
  'morebouncelabs': '06',
  'auralith369': '07',
  'siliconlouvre': '08',
  'openblueprintstudio': '09',
  'parallax-pixelforge': '10',
  'phicade': '11',
  'pulse369': '12',
  'brainc': '13',
  'pocketbrain': '14',
  'porchtalk': '15',
  'fieldatlas': '16',
  'morebouncemethod': '17',
  'glo': '18',
});
export function futureArchivePrintUrl(repo) {
  const number = archivePrintByRepo[String(repo || '').trim().toLowerCase()];
  return number ? FUTURE_ARCHIVE_URL + '#print-' + number : null;
}
