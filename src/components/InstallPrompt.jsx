import { useEffect, useState } from 'react';
import { Download, Gem, X } from 'lucide-react';

let deferred = null;
const subs = new Set();
const ping = () => subs.forEach((f) => f());
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; ping(); });
  window.addEventListener('appinstalled', () => { deferred = null; ping(); });
}

export function useInstall() {
  const [, tick] = useState(0);
  useEffect(() => { const f = () => tick((n) => n + 1); subs.add(f); return () => subs.delete(f); }, []);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const install = async () => {
    if (!deferred) return null;
    deferred.prompt();
    const r = await deferred.userChoice;
    deferred = null; ping();
    return r.outcome;
  };
  return { standalone, ios, canPrompt: !!deferred, install };
}

export default function InstallPrompt() {
  const { standalone, ios, canPrompt, install } = useInstall();
  const [hidden, setHidden] = useState(() => sessionStorage.getItem('yl_install_hide') === '1');
  if (standalone || hidden || (!canPrompt && !ios)) return null;
  const close = () => { sessionStorage.setItem('yl_install_hide', '1'); setHidden(true); };
  return (
    <div className="card install" role="dialog" aria-label="Install YUÉLÍN">
      <span className="ico"><Gem size={22} /></span>
      <div style={{ flex: 1 }}>
        <h3>Install YUÉLÍN</h3>
        <p className="dim small">{canPrompt ? 'Add YUÉLÍN to your home screen for one-tap access.' : 'In Safari, tap Share, then Add to Home Screen.'}</p>
      </div>
      {canPrompt && <button className="btn gold sm" onClick={install}><Download size={16} />Install</button>}
      <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={close} aria-label="Not now"><X size={16} /></button>
    </div>
  );
}
