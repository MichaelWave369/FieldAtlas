// DOM-only modal focus management. No external dependency or permanent event listener.
const TAB_STOPS = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), iframe, [tabindex]:not([tabindex="-1"])';

export function getModalTabStops(dialog) {
  if (!dialog) return [];
  return Array.from(dialog.querySelectorAll(TAB_STOPS)).filter(element =>
    !element.closest('[hidden], [inert]') &&
    element.getAttribute('aria-hidden') !== 'true' &&
    element.getClientRects().length > 0
  );
}

/**
 * Keep keyboard navigation within the open modal and return to its opener.
 * Inert the surrounding Atlas surface, not the modal's own overlay.
 */
export function activateModalFocus(dialog, { initialSelector = '[data-atlas-initial-focus]' } = {}) {
  if (!dialog) return () => {};
  const previous = document.activeElement;
  const root = dialog.closest('.study-app');
  let layer = dialog;
  while (root && layer.parentElement && layer.parentElement !== root) layer = layer.parentElement;
  const madeInert = [];
  if (root) {
    for (const sibling of root.children) {
      if (sibling !== layer && !sibling.inert) {
        sibling.inert = true;
        madeInert.push(sibling);
      }
    }
  }

  const firstFocus = () => dialog.querySelector(initialSelector) || getModalTabStops(dialog)[0] || dialog;
  if (!getModalTabStops(dialog).length) dialog.tabIndex = -1;
  firstFocus().focus({ preventScroll: true });

  function onKeyDown(event) {
    if (event.key !== 'Tab') return;
    const stops = getModalTabStops(dialog);
    if (!stops.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const current = stops.indexOf(document.activeElement);
    if (event.shiftKey && current <= 0) {
      event.preventDefault();
      stops[stops.length - 1].focus();
    } else if (!event.shiftKey && (current === -1 || current === stops.length - 1)) {
      event.preventDefault();
      stops[0].focus();
    }
  }
  function onFocusIn(event) {
    if (!dialog.contains(event.target)) firstFocus().focus({ preventScroll: true });
  }
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('focusin', onFocusIn, true);

  return () => {
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('focusin', onFocusIn, true);
    for (const sibling of madeInert) sibling.inert = false;
    if (previous?.isConnected && typeof previous.focus === 'function') {
      previous.focus({ preventScroll: true });
    }
  };
}
