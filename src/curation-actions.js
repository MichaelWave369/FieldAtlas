import { safeUrl } from './catalog.js';

/** Keep visitor-supplied entries browser-local and URL constrained. */
export function makeCustomChapter(form, existingCatalog, now = Date.now()) {
  const url = safeUrl(form.url);
  if (!url) return { error: 'Please use a valid https:// URL.' };
  const title = String(form.title || '').trim();
  if (!title) return { error: 'Every chapter needs a name.' };
  if (existingCatalog.some(page => page.url.replace(/\/$/, '').toLowerCase() === url.replace(/\/$/, '').toLowerCase())) {
    return { error: 'That doorway is already in the book.' };
  }
  return {
    chapter: {
      id: 'custom-' + now,
      repo: '',
      title: title.slice(0, 80),
      kicker: 'A NEW CHAPTER',
      category: form.category,
      url,
      desc: String(form.desc || '').trim().slice(0, 300) || 'Another little universe in the Field.',
      pullquote: 'Every great story has another page.',
      accent: '#e6c893',
      index: '✦',
    },
  };
}

export function makeChapterEdit(page, editForm) {
  return {
    key: String(page.repo || page.id).toLowerCase(),
    edit: {
      title: String(editForm.title).trim().slice(0, 80),
      desc: String(editForm.desc).trim().slice(0, 300),
      category: editForm.category,
    },
  };
}
