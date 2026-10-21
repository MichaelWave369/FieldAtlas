/**
 * Hosted pages may be updated independently of the Atlas. Give them a separate
 * opaque origin while retaining common interactive capabilities.
 *
 * Deliberately omit allow-same-origin, top-navigation and clipboard grants.
 * allow-scripts + allow-same-origin would weaken isolation for GitHub Pages
 * projects sharing the Atlas origin. Some storage/CORS-dependent apps may not
 * work in preview; the direct "Open this world" link is the full-featured path.
 */
export const PREVIEW_SANDBOX = 'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox';
