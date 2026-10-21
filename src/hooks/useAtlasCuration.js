import { useEffect, useState } from 'react';
import { safeUrl, seedPages } from '../catalog.js';
import { makeCustomChapter, makeChapterEdit } from '../curation-actions.js';

export const STORE_KEY = 'field-atlas-pages-v1';
export const EDITS_KEY = 'field-atlas-curation-edits-v4';
const EMPTY_FORM = { title: '', url: '', category: 'Other', desc: '' };

function readLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

/**
 * The private curator's desk: local chapters, personalized labels and forms.
 * None of these operations mutate GitHub or the public verified manifest.
 */
export default function useAtlasCuration() {
  const [pages, setPages] = useState(() => {
    const loaded = readLocal(STORE_KEY, seedPages);
    return Array.isArray(loaded) && loaded.length
      ? loaded.filter(page => page && page.id && safeUrl(page.url))
      : seedPages;
  });
  const [localEdits, setLocalEdits] = useState(() => readLocal(EDITS_KEY, {}));
  const [editorPage, setEditorPage] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', desc: '', category: 'Other' });
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  useEffect(() => { localStorage.setItem(STORE_KEY, JSON.stringify(pages)); }, [pages]);
  useEffect(() => { localStorage.setItem(EDITS_KEY, JSON.stringify(localEdits)); }, [localEdits]);

  function beginEdit(page) {
    setEditorPage(page);
    setEditForm({ title: page.title || '', desc: page.desc || '', category: page.category || 'Other' });
  }

  function saveEditedChapter(event) {
    event.preventDefault();
    if (!editorPage || !editForm.title.trim()) return;
    const { key, edit } = makeChapterEdit(editorPage, editForm);
    setLocalEdits(previous => ({ ...previous, [key]: edit }));
    setEditorPage(null);
  }

  function addPage(event, catalog) {
    event.preventDefault();
    const result = makeCustomChapter(form, catalog);
    if (result.error) {
      setFormError(result.error);
      return false;
    }
    setPages(previous => [...previous, result.chapter]);
    setForm(EMPTY_FORM);
    setFormError('');
    return true;
  }

  function removePage(id) {
    setPages(previous => previous.filter(page => page.id !== id));
  }

  function resetCatalog() {
    setPages(seedPages);
    setLocalEdits({});
  }

  return {
    pages, setPages, localEdits, setLocalEdits,
    editorPage, setEditorPage, editForm, setEditForm,
    form, setForm, formError, setFormError,
    beginEdit, saveEditedChapter, addPage, removePage, resetCatalog,
  };
}
