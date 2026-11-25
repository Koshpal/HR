import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

/**
 * Per-page metadata for the HR portal. The portal is a single-page app, so the browser tab, link
 * previews and search results would otherwise all show the one title from index.html. This sets the
 * <title>, description, canonical URL and Open Graph / Twitter tags for whichever route is on screen.
 * Add a row to PAGES when you add a route.
 */
const ORIGIN = 'https://hr.koshpal.com';
const PORTAL = 'Koshpal HR Portal';

interface PageMetaEntry {
  /** react-router path pattern */
  path: string;
  title: string;
  description: string;
}

const DEFAULT_ENTRY: PageMetaEntry = {
  path: '/',
  title: 'HR Portal',
  description: 'Koshpal HR portal: see how employee financial wellness coaching is used and what difference it makes, with privacy-safe aggregate data.',
};

export const PAGES: PageMetaEntry[] = [
  { path: '/login', title: 'HR Login', description: 'Sign in to the Koshpal HR portal to see your company’s financial wellness programme.' },
  { path: '/forgot-password', title: 'Forgot Password', description: 'Reset your Koshpal HR portal password. Enter your work email and we will send you a reset link.' },
  { path: '/dashboard', title: 'Dashboard', description: 'Your financial wellness programme at a glance: enrolment, sessions and engagement.' },
  { path: '/employees', title: 'Employee Directory', description: 'Manage who is enrolled in the financial wellness programme and invite new employees.' },
  { path: '/sessions', title: 'Session Reports', description: 'Coaching session volumes and completion across your company, without individual details.' },
  { path: '/reports', title: 'Analytics', description: 'Participation and engagement trends for your employee financial wellness programme.' },
  { path: '/impact', title: 'Impact', description: 'The value the programme delivers: participation, progress and wellbeing, shown as anonymised aggregates.' },
  { path: '/coaching', title: 'Coaching Overview', description: 'How financial coaching is running for your employees, with aggregate-only data that protects privacy.' },
  { path: '/settings', title: 'Settings', description: 'Company profile, notification and security settings for the Koshpal HR portal.' },
];

/** Set (or create) a <meta> in <head>. */
function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string | null) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!href) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function resolvePageMeta(pathname: string): { entry: PageMetaEntry; canonical: string | null } {
  const entry = PAGES.find((p) => matchPath({ path: p.path, end: true }, pathname));
  if (!entry) return { entry: DEFAULT_ENTRY, canonical: null };
  // A canonical URL must not carry a record id or a reset token, so parameterised routes get none.
  return { entry, canonical: entry.path.includes(':') ? null : `${ORIGIN}${entry.path}` };
}

export default function PageMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const { entry, canonical } = resolvePageMeta(pathname);
    const title = entry === DEFAULT_ENTRY ? 'Koshpal HR Portal' : `${entry.title} | ${PORTAL}`;
    document.title = title;
    setMeta('name', 'description', entry.description);
    setMeta('name', 'robots', 'index, follow');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', entry.description);
    setMeta('property', 'og:url', canonical ?? ORIGIN);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', entry.description);
    setCanonical(canonical);
  }, [pathname]);
  return null;
}
