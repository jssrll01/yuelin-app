import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function usePage(title) {
  const { hash } = useLocation();
  useEffect(() => { const old = document.title; document.title = title + ' · YUÉLÍN'; return () => { document.title = old; }; }, [title]);
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return undefined; }
    const t = setTimeout(() => { const el = document.getElementById(hash.slice(1)); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120);
    return () => clearTimeout(t);
  }, [hash]);
}
